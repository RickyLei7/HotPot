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
const campaignId = "24055900999";
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

const desired = new Map([
  ["GET_DIRECTIONS~GOOGLE_HOSTED", false],
  ["CONTACT~GOOGLE_HOSTED", true],
  ["PHONE_CALL_LEAD~CALL_FROM_ADS", true],
]);
const beforeRows = await search(`SELECT
    campaign_conversion_goal.resource_name,
    campaign_conversion_goal.category,
    campaign_conversion_goal.origin,
    campaign_conversion_goal.biddable
  FROM campaign_conversion_goal
  WHERE campaign.id = ${campaignId}`);

const before = beforeRows.map(({ campaignConversionGoal: goal }) => ({
  resourceName: goal.resourceName,
  category: goal.category,
  origin: goal.origin,
  biddable: goal.biddable,
}));
const lookup = new Map(before.map((goal) => [`${goal.category}~${goal.origin}`, goal]));
for (const key of desired.keys()) {
  if (!lookup.has(key)) throw new Error(`Missing expected campaign conversion goal ${key}.`);
}

const operations = [...desired].flatMap(([key, biddable]) => {
  const current = lookup.get(key);
  if (current.biddable === biddable) return [];
  return [{
    update: { resourceName: current.resourceName, biddable },
    updateMask: "biddable",
  }];
});

const result = {
  mode: apply ? "apply" : "validate",
  campaignId,
  rationale: "Bid toward phone contact while retaining directions as a secondary measured action.",
  before,
  planned: [...desired].map(([key, biddable]) => ({ key, biddable })),
  operationCount: operations.length,
};

if (operations.length) {
  result.mutation = await request("campaignConversionGoals:mutate", {
    operations,
    validateOnly: !apply,
  });
}

if (apply) {
  const afterRows = await search(`SELECT
      campaign_conversion_goal.resource_name,
      campaign_conversion_goal.category,
      campaign_conversion_goal.origin,
      campaign_conversion_goal.biddable
    FROM campaign_conversion_goal
    WHERE campaign.id = ${campaignId}`);
  result.after = afterRows.map(({ campaignConversionGoal: goal }) => ({
    resourceName: goal.resourceName,
    category: goal.category,
    origin: goal.origin,
    biddable: goal.biddable,
  }));
  const afterLookup = new Map(result.after.map((goal) => [`${goal.category}~${goal.origin}`, goal.biddable]));
  for (const [key, expected] of desired) {
    if (afterLookup.get(key) !== expected) throw new Error(`Verification failed for ${key}.`);
  }
}

const output = path.join(root, "marketing", "reports", "google-ads-conversion-goals-latest.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
