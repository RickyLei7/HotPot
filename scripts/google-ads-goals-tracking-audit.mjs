import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

async function query(name, gaql) {
  const response = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:searchStream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: gaql }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return {
    name,
    error: body.error?.message ?? "Unknown Google Ads API error",
    details: body.error?.details ?? [],
  };
  return { name, rows: (Array.isArray(body) ? body : [body]).flatMap((batch) => batch.results ?? []) };
}

const reports = await Promise.all([
  query("allCampaigns", `SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.advertising_channel_type,
    campaign.bidding_strategy_type,
    campaign.tracking_url_template,
    campaign.final_url_suffix,
    campaign.url_custom_parameters,
    campaign_budget.amount_micros,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.all_conversions
  FROM campaign
  WHERE campaign.status != 'REMOVED'
    AND segments.date DURING LAST_30_DAYS`),
  query("customerSettings", `SELECT
    customer.id,
    customer.descriptive_name,
    customer.currency_code,
    customer.time_zone,
    customer.auto_tagging_enabled,
    customer.tracking_url_template,
    customer.final_url_suffix
  FROM customer`),
  query("campaignGoals", `SELECT
    campaign_conversion_goal.resource_name,
    campaign_conversion_goal.campaign,
    campaign_conversion_goal.category,
    campaign_conversion_goal.origin,
    campaign_conversion_goal.biddable,
    campaign.id,
    campaign.name
  FROM campaign_conversion_goal
  WHERE campaign.status != 'REMOVED'`),
  query("customerGoals", `SELECT
    customer_conversion_goal.resource_name,
    customer_conversion_goal.category,
    customer_conversion_goal.origin,
    customer_conversion_goal.biddable
  FROM customer_conversion_goal`),
  query("goalConfigs", `SELECT
    conversion_goal_campaign_config.campaign,
    conversion_goal_campaign_config.custom_conversion_goal,
    conversion_goal_campaign_config.goal_config_level,
    campaign.id,
    campaign.name
  FROM conversion_goal_campaign_config
  WHERE campaign.status != 'REMOVED'`),
  query("customGoals", `SELECT
    custom_conversion_goal.id,
    custom_conversion_goal.name,
    custom_conversion_goal.status,
    custom_conversion_goal.conversion_actions
  FROM custom_conversion_goal`),
  query("conversionActions", `SELECT
    conversion_action.id,
    conversion_action.name,
    conversion_action.status,
    conversion_action.type,
    conversion_action.category,
    conversion_action.origin,
    conversion_action.primary_for_goal,
    conversion_action.include_in_conversions_metric,
    conversion_action.counting_type
  FROM conversion_action
  WHERE conversion_action.status != 'REMOVED'`),
  query("dailyCampaignPerformance", `SELECT
    campaign.id,
    campaign.name,
    segments.date,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.all_conversions
  FROM campaign
  WHERE campaign.status != 'REMOVED'
    AND segments.date DURING LAST_30_DAYS
  ORDER BY segments.date DESC`),
  query("searchKeywords", `SELECT
    campaign.id,
    campaign.name,
    ad_group.id,
    ad_group.name,
    ad_group_criterion.status,
    ad_group_criterion.keyword.text,
    ad_group_criterion.keyword.match_type,
    ad_group_criterion.quality_info.quality_score,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions
  FROM keyword_view
  WHERE campaign.status != 'REMOVED'
    AND ad_group_criterion.negative = FALSE
    AND segments.date DURING LAST_30_DAYS`),
  query("recentSearchTerms", `SELECT
    campaign.id,
    campaign.name,
    campaign_search_term_view.search_term,
    segments.date,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.all_conversions
  FROM campaign_search_term_view
  WHERE campaign.status != 'REMOVED'
    AND segments.date DURING LAST_7_DAYS
  ORDER BY metrics.cost_micros DESC
  LIMIT 200`),
  query("searchAds", `SELECT
    campaign.id,
    campaign.name,
    ad_group.id,
    ad_group.name,
    ad_group_ad.status,
    ad_group_ad.ad.id,
    ad_group_ad.ad.final_urls,
    ad_group_ad.ad.tracking_url_template,
    ad_group_ad.ad.final_url_suffix,
    ad_group_ad.ad.responsive_search_ad.headlines,
    ad_group_ad.ad.responsive_search_ad.descriptions,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions
  FROM ad_group_ad
  WHERE campaign.status != 'REMOVED'
    AND segments.date DURING LAST_30_DAYS`),
  query("allLandingPages", `SELECT
    campaign.id,
    landing_page_view.unexpanded_final_url,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.all_conversions
  FROM landing_page_view
  WHERE segments.date DURING LAST_30_DAYS
  ORDER BY metrics.clicks DESC`),
  query("allSchedules", `SELECT
    campaign.id,
    campaign.name,
    campaign_criterion.ad_schedule.day_of_week,
    campaign_criterion.ad_schedule.start_hour,
    campaign_criterion.ad_schedule.start_minute,
    campaign_criterion.ad_schedule.end_hour,
    campaign_criterion.ad_schedule.end_minute,
    campaign_criterion.status
  FROM campaign_criterion
  WHERE campaign.status != 'REMOVED'
    AND campaign_criterion.type = 'AD_SCHEDULE'`),
  query("allNegativeKeywords", `SELECT
    campaign.id,
    campaign.name,
    campaign_criterion.status,
    campaign_criterion.keyword.text,
    campaign_criterion.keyword.match_type
  FROM campaign_criterion
  WHERE campaign.status != 'REMOVED'
    AND campaign_criterion.type = 'KEYWORD'
    AND campaign_criterion.negative = TRUE`),
  query("assetGroupTracking", `SELECT
    campaign.id,
    campaign.name,
    asset_group.id,
    asset_group.name,
    asset_group.status,
    asset_group.final_urls,
    asset_group.final_mobile_urls
  FROM asset_group
  WHERE asset_group.status != 'REMOVED'`),
]);

const audit = { customerId, generatedAt: new Date().toISOString(), reports };
const output = path.join(root, "marketing", "reports", "google-ads-goals-tracking-latest.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify(audit, null, 2));
