import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apply = process.argv.includes("--apply");
const root = process.cwd();
const env = Object.fromEntries((await readFile(path.join(root, ".env.google-ads.local"), "utf8"))
  .split("\n")
  .flatMap((line) => {
    const separator = line.indexOf("=");
    return separator > 0 && !line.startsWith("#")
      ? [[line.slice(0, separator), line.slice(separator + 1)]]
      : [];
  }));

if (!env.GOOGLE_ADS_DEVELO_TOKEN && env.GOOGLE_ADS_DEVELOPER_TOKEN) {
  env.GOOGLE_ADS_DEVELO_TOKEN = env.GOOGLE_ADS_DEVELOPER_TOKEN;
}
const required = [
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_DEVELO_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
  "GOOGLE_ADS_REFRESH_TOKEN",
];
const missing = required.filter((key) => !env[key]);
if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);

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
if (!tokenResponse.ok || !token.access_token) {
  throw new Error(token.error_description ?? "Unable to refresh Google Ads token.");
}

const customerId = env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "");
const campaignId = "24129445812";
const adGroupName = "AYCE Hot Pot - Chinese";
const landingUrl = "https://centrestjhotpot.ca/zh-hant/ayce-hot-pot-calgary/?utm_source=google&utm_medium=cpc&utm_campaign=ayce_search_high_intent&utm_content=rsa_zh_hant";
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token.access_token}`,
  "developer-token": env.GOOGLE_ADS_DEVELO_TOKEN,
  ...(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
    ? { "login-customer-id": env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "") }
    : {}),
};

async function request(endpoint, body) {
  const response = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(result));
  return result;
}

async function search(query) {
  const result = await request("googleAds:searchStream", { query });
  return (Array.isArray(result) ? result : [result]).flatMap((batch) => batch.results ?? []);
}

const keywords = [
  ["卡尔加里火锅", "EXACT"],
  ["卡尔加里火锅", "PHRASE"],
  ["卡加利火鍋", "EXACT"],
  ["卡加利火鍋", "PHRASE"],
  ["卡尔加里火锅自助", "EXACT"],
  ["卡尔加里火锅自助", "PHRASE"],
  ["卡加利火鍋自助", "EXACT"],
  ["卡加利火鍋自助", "PHRASE"],
  ["火锅自助", "EXACT"],
  ["火锅自助", "PHRASE"],
  ["火鍋自助", "EXACT"],
  ["火鍋自助", "PHRASE"],
  ["附近火锅", "EXACT"],
  ["附近火鍋", "EXACT"],
  ["一人一锅", "EXACT"],
  ["一人一鍋", "EXACT"],
  ["火锅店", "EXACT"],
  ["火鍋店", "EXACT"],
];

const headlines = [
  { text: "卡加利$28.99火鍋自助", pinnedField: "HEADLINE_1" },
  { text: "15款湯底已包含" },
  { text: "AAA牛肉羊肉任吃" },
  { text: "一人一鍋火鍋自助" },
  { text: "晚餐時段也有AYCE" },
  { text: "Centre Street鼎鑽火鍋" },
  { text: "致電預訂座位" },
  { text: "台式日式個人火鍋" },
  { text: "加$3.99小吃任吃" },
  { text: "營業至晚上10:30" },
  { text: "湯底肉品無限續點" },
  { text: "卡加利火鍋餐廳" },
];
const descriptions = [
  { text: "$28.99火鍋自助包含湯底，AAA牛肉、羊肉、豬肉和雞肉任點，致電預訂座位。" },
  { text: "卡加利一人一鍋火鍋自助，15款湯底任選，晚餐時段也能享用AYCE。" },
  { text: "每人加$3.99可升級19款台式小吃自助，需同桌一起升級。" },
  { text: "位於Centre Street，平日5點營業，週末中午12點營業，晚上10:30打烊。" },
];

const badHeadlines = headlines.filter(({ text }) => [...text].length > 30);
const badDescriptions = descriptions.filter(({ text }) => [...text].length > 90);
if (badHeadlines.length || badDescriptions.length) {
  throw new Error(`Ad text exceeds limits: ${JSON.stringify({ badHeadlines, badDescriptions })}`);
}

const campaignRows = await search(`SELECT campaign.id, campaign.resource_name, campaign.name,
  campaign.status, campaign.primary_status, campaign.advertising_channel_type
  FROM campaign WHERE campaign.id = ${campaignId}`);
if (campaignRows.length !== 1) throw new Error(`Expected one campaign, found ${campaignRows.length}.`);
const campaign = campaignRows[0].campaign;
if (campaign.status !== "ENABLED" || campaign.advertisingChannelType !== "SEARCH") {
  throw new Error(`Campaign is not an enabled Search campaign: ${JSON.stringify(campaign)}`);
}

const escapedName = adGroupName.replaceAll("'", "\\'");
let adGroupRows = await search(`SELECT ad_group.id, ad_group.resource_name, ad_group.name,
  ad_group.status, ad_group.primary_status, ad_group.primary_status_reasons
  FROM ad_group WHERE campaign.id = ${campaignId}
  AND ad_group.name = '${escapedName}' AND ad_group.status != 'REMOVED'`);
if (adGroupRows.length > 1) throw new Error(`Found ${adGroupRows.length} matching ad groups.`);

const report = {
  generatedAt: new Date().toISOString(),
  mode: apply ? "apply" : "validate",
  campaignId,
  campaignName: campaign.name,
  campaignStatus: campaign.status,
  adGroupName,
  landingUrl,
  keywordCount: keywords.length,
  headlineCount: headlines.length,
  descriptionCount: descriptions.length,
  existingAdGroupCount: adGroupRows.length,
};

if (adGroupRows.length === 0) {
  const tempAdGroup = `customers/${customerId}/adGroups/-101`;
  const mutateOperations = [
    {
      adGroupOperation: {
        create: {
          resourceName: tempAdGroup,
          campaign: campaign.resourceName,
          name: adGroupName,
          status: "ENABLED",
          type: "SEARCH_STANDARD",
        },
      },
    },
    ...keywords.map(([text, matchType]) => ({
      adGroupCriterionOperation: {
        create: {
          adGroup: tempAdGroup,
          status: "ENABLED",
          keyword: { text, matchType },
        },
      },
    })),
    {
      adGroupAdOperation: {
        create: {
          adGroup: tempAdGroup,
          status: "ENABLED",
          ad: {
            finalUrls: [landingUrl],
            responsiveSearchAd: {
              headlines,
              descriptions,
              path1: "ayce",
              path2: "calgary",
            },
          },
        },
      },
    },
  ];
  report.operationCount = mutateOperations.length;
  report.mutation = await request("googleAds:mutate", {
    mutateOperations,
    partialFailure: false,
    validateOnly: !apply,
    responseContentType: "RESOURCE_NAME_ONLY",
  });
  if (apply) {
    adGroupRows = await search(`SELECT ad_group.id, ad_group.resource_name, ad_group.name,
      ad_group.status, ad_group.primary_status, ad_group.primary_status_reasons
      FROM ad_group WHERE campaign.id = ${campaignId}
      AND ad_group.name = '${escapedName}' AND ad_group.status != 'REMOVED'`);
  }
} else {
  report.noCreateNeeded = true;
}

if (apply || adGroupRows.length === 1) {
  if (adGroupRows.length !== 1) throw new Error(`Verification found ${adGroupRows.length} matching ad groups.`);
  const adGroup = adGroupRows[0].adGroup;
  const [keywordRows, adRows] = await Promise.all([
    search(`SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
      ad_group_criterion.status, ad_group_criterion.primary_status, ad_group_criterion.primary_status_reasons
      FROM keyword_view WHERE ad_group.id = ${adGroup.id} AND ad_group_criterion.negative = FALSE`),
    search(`SELECT ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.primary_status,
      ad_group_ad.primary_status_reasons, ad_group_ad.policy_summary.approval_status,
      ad_group_ad.policy_summary.review_status, ad_group_ad.ad.final_urls,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions
      FROM ad_group_ad WHERE ad_group.id = ${adGroup.id}
      AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD' AND ad_group_ad.status != 'REMOVED'`),
  ]);
  report.verification = {
    adGroupId: adGroup.id,
    adGroupStatus: adGroup.status,
    adGroupPrimaryStatus: adGroup.primaryStatus,
    adGroupPrimaryStatusReasons: adGroup.primaryStatusReasons ?? [],
    keywords: keywordRows.map(({ adGroupCriterion }) => ({
      text: adGroupCriterion.keyword.text,
      matchType: adGroupCriterion.keyword.matchType,
      status: adGroupCriterion.status,
      primaryStatus: adGroupCriterion.primaryStatus,
      primaryStatusReasons: adGroupCriterion.primaryStatusReasons ?? [],
    })),
    ads: adRows.map(({ adGroupAd }) => ({
      id: adGroupAd.ad.id,
      status: adGroupAd.status,
      primaryStatus: adGroupAd.primaryStatus,
      primaryStatusReasons: adGroupAd.primaryStatusReasons ?? [],
      approvalStatus: adGroupAd.policySummary?.approvalStatus,
      reviewStatus: adGroupAd.policySummary?.reviewStatus,
      finalUrls: adGroupAd.ad.finalUrls,
      headlineCount: adGroupAd.ad.responsiveSearchAd?.headlines?.length ?? 0,
      descriptionCount: adGroupAd.ad.responsiveSearchAd?.descriptions?.length ?? 0,
    })),
  };
  report.verification.checks = {
    adGroupEnabled: report.verification.adGroupStatus === "ENABLED",
    allKeywordsPresent: report.verification.keywords.length === keywords.length
      && keywords.every(([text, matchType]) => report.verification.keywords
        .some((item) => item.text === text && item.matchType === matchType && item.status === "ENABLED")),
    oneEnabledRsa: report.verification.ads.length === 1
      && report.verification.ads[0].status === "ENABLED"
      && report.verification.ads[0].headlineCount === headlines.length
      && report.verification.ads[0].descriptionCount === descriptions.length
      && report.verification.ads[0].finalUrls?.[0] === landingUrl,
  };
  if (Object.values(report.verification.checks).some((passed) => !passed)) {
    throw new Error(`Verification failed: ${JSON.stringify(report.verification.checks)}`);
  }
}

const output = path.join(root, "marketing", "reports", "google-ads-chinese-search-latest.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
