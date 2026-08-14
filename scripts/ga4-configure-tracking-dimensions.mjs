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
    refresh_token: env.GOOGLE_MARKETING_REFRESH_TOKEN,
    grant_type: "refresh_token",
  }),
});
const token = await tokenResponse.json();
if (!tokenResponse.ok || !token.access_token) throw new Error(token.error_description ?? "Unable to refresh Google marketing token.");

const property = "properties/540500997";
const headers = { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" };
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${response.status} ${body.error?.message ?? "Unknown GA4 Admin API error"}`);
  return body;
}

const desired = [
  ["page_type", "Page type"],
  ["site_language", "Site language"],
  ["session_landing_page", "Session landing page"],
  ["cta_name", "CTA name"],
  ["cta_location", "CTA location"],
  ["cta_intent", "CTA intent"],
  ["offer_type", "Offer type"],
  ["campaign_source", "Persisted campaign source"],
  ["campaign_medium", "Persisted campaign medium"],
  ["campaign_name", "Persisted campaign name"],
  ["campaign_content", "Persisted campaign content"],
  ["ads_campaign_id", "Google Ads campaign ID"],
  ["ads_ad_group_id", "Google Ads ad group ID"],
  ["ads_asset_group_id", "Google Ads asset group ID"],
  ["ads_network", "Google Ads network"],
  ["ads_device", "Google Ads device"],
  ["ads_match_type", "Google Ads match type"],
  ["ads_click_id_type", "Google Ads click ID type"],
  ["ads_creative_id", "Google Ads creative ID"],
  ["campaign_term", "Persisted campaign term"],
  ["link_destination", "Privacy-safe link destination"],
  ["lead_type", "Lead type"],
  ["menu_context", "Menu click context"],
  ["section_id", "Viewed section"],
  ["referrer_host", "Referrer host"],
  ["method", "Contact method"],
];

const listUrl = `https://analyticsadmin.googleapis.com/v1beta/${property}/customDimensions?pageSize=200`;
const before = await request(listUrl);
const active = (before.customDimensions ?? []).filter((dimension) => !dimension.disallowAdsPersonalization);
const existingNames = new Set((before.customDimensions ?? []).map((dimension) => dimension.parameterName));
const missing = desired.filter(([parameterName]) => !existingNames.has(parameterName));
if ((before.customDimensions?.length ?? 0) + missing.length > 50) {
  throw new Error(`Adding ${missing.length} dimensions would exceed the GA4 standard property limit of 50.`);
}

const created = [];
if (apply) {
  for (const [parameterName, displayName] of missing) {
    created.push(await request(`https://analyticsadmin.googleapis.com/v1beta/${property}/customDimensions`, {
      method: "POST",
      body: JSON.stringify({
        parameterName,
        displayName,
        description: "Privacy-safe marketing attribution and CTA analysis for centrestjhotpot.ca",
        scope: "EVENT",
      }),
    }));
  }
}

const after = apply ? await request(listUrl) : before;
const result = {
  mode: apply ? "apply" : "validate",
  property,
  existingCount: before.customDimensions?.length ?? 0,
  activeCount: active.length,
  desiredCount: desired.length,
  missingBefore: missing.map(([parameterName]) => parameterName),
  created: created.map(({ name, parameterName }) => ({ name, parameterName })),
  verifiedParameters: (after.customDimensions ?? []).map((dimension) => dimension.parameterName).sort(),
};

const output = path.join(root, "marketing", "reports", "ga4-tracking-dimensions-latest.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
