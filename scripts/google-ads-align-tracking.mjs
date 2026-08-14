import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apply = process.argv.includes("--apply");
const root = process.cwd();
const env = Object.fromEntries((await readFile(path.join(root, ".env.google-ads.local"), "utf8"))
  .split("\n")
  .flatMap((line) => {
    const separator = line.indexOf("=");
    return separator > 0 && !line.startsWith("#") ? [[line.slice(0, separator), line.slice(separator + 1)]] : [];
  }));

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: env.GOOGLE_ADS_CLIENT_ID,
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type: "refresh_token",
  }),
});
const token = await tokenResponse.json();
if (!tokenResponse.ok || !token.access_token) throw new Error(token.error_description ?? "Unable to refresh Google Ads token.");

const customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "");
const headers = {
  Authorization: `Bearer ${token.access_token}`,
  "Content-Type": "application/json",
  "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN,
  ...(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ? { "login-customer-id": env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "") } : {}),
};
async function request(endpoint, body) {
  const response = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(JSON.stringify(result));
  return result;
}
async function search(query) {
  const result = await request("googleAds:searchStream", { query });
  return (Array.isArray(result) ? result : [result]).flatMap((batch) => batch.results ?? []);
}

const campaignIds = ["24055900999", "24129445812"];
const suffix = "utm_id={campaignid}&ad_group_id={adgroupid}&asset_group_id={assetgroupid}&creative={creative}&network={network}&device={device}&matchtype={matchtype}";
const campaigns = await search(`SELECT campaign.resource_name, campaign.id, campaign.name, campaign.final_url_suffix
  FROM campaign
  WHERE campaign.id IN (${campaignIds.join(",")})`);
if (campaigns.length !== campaignIds.length) throw new Error(`Expected ${campaignIds.length} campaigns, found ${campaigns.length}.`);

const pmaxGroups = await search(`SELECT asset_group.resource_name, asset_group.id, asset_group.name, asset_group.final_urls
  FROM asset_group
  WHERE campaign.id = 24055900999
    AND asset_group.status = 'ENABLED'`);
if (pmaxGroups.length !== 1) throw new Error(`Expected one enabled PMax asset group, found ${pmaxGroups.length}.`);
const group = pmaxGroups[0].assetGroup;
const normalizedPmaxUrls = group.finalUrls.map((rawUrl) => {
  const url = new URL(rawUrl);
  url.searchParams.set("utm_source", "google");
  url.searchParams.set("utm_medium", "cpc");
  url.searchParams.set("utm_campaign", "ayce_pmax_local");
  url.searchParams.set("utm_content", "pmax_main");
  return url.toString();
});

const campaignOperations = campaigns
  .filter(({ campaign }) => campaign.finalUrlSuffix !== suffix)
  .map(({ campaign }) => ({
    update: { resourceName: campaign.resourceName, finalUrlSuffix: suffix },
    updateMask: "final_url_suffix",
  }));
const assetChanged = JSON.stringify(group.finalUrls) !== JSON.stringify(normalizedPmaxUrls);
const result = {
  mode: apply ? "apply" : "validate",
  suffix,
  campaignsBefore: campaigns.map(({ campaign }) => ({ id: campaign.id, name: campaign.name, finalUrlSuffix: campaign.finalUrlSuffix || "" })),
  campaignChanges: campaignOperations.length,
  pmaxAssetGroup: { id: group.id, name: group.name, before: group.finalUrls, after: normalizedPmaxUrls, changed: assetChanged },
};

if (campaignOperations.length) {
  result.campaignMutation = await request("campaigns:mutate", { operations: campaignOperations, validateOnly: !apply });
}
if (assetChanged) {
  result.assetGroupMutation = await request("assetGroups:mutate", {
    operations: [{
      update: { resourceName: group.resourceName, finalUrls: normalizedPmaxUrls },
      updateMask: "final_urls",
    }],
    validateOnly: !apply,
  });
}

if (apply) {
  const verifiedCampaigns = await search(`SELECT campaign.id, campaign.name, campaign.final_url_suffix
    FROM campaign
    WHERE campaign.id IN (${campaignIds.join(",")})`);
  const verifiedGroup = await search(`SELECT asset_group.id, asset_group.final_urls
    FROM asset_group
    WHERE asset_group.resource_name = '${group.resourceName}'`);
  result.verifiedCampaigns = verifiedCampaigns.map(({ campaign }) => ({ id: campaign.id, name: campaign.name, finalUrlSuffix: campaign.finalUrlSuffix || "" }));
  result.verifiedPmaxUrls = verifiedGroup[0]?.assetGroup?.finalUrls ?? [];
  if (result.verifiedCampaigns.some((campaign) => campaign.finalUrlSuffix !== suffix)) throw new Error("Campaign final URL suffix verification failed.");
  if (JSON.stringify(result.verifiedPmaxUrls) !== JSON.stringify(normalizedPmaxUrls)) throw new Error("PMax final URL verification failed.");
}

const output = path.join(root, "marketing", "reports", "google-ads-tracking-alignment-latest.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
