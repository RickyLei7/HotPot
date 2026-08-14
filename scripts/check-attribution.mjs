import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  }));
  return files.flat();
}

const htmlFiles = await collectHtmlFiles(publicDir);
assert.ok(htmlFiles.length > 0, "No deployable HTML files found in public/");

// OAuth return pages only confirm an external account connection. They are not
// guest-facing site pages and intentionally do not load analytics or ad tags.
const authCallbackPages = new Set([
  "public/facebook-auth/index.html",
  "public/google-business-auth/index.html",
  "public/instagram-auth/index.html",
  "public/threads-auth/index.html",
]);

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relativePath = path.relative(root, file);
  if (authCallbackPages.has(relativePath)) continue;
  assert.equal(
    (html.match(/src="\/site-events\.js(?:\?[^"\s]+)?"/g) || []).length,
    1,
    `${relativePath} must load /site-events.js exactly once`,
  );
  assert.equal(
    (html.match(/src="\/meta-events-1108307461722381\.js"/g) || []).length,
    1,
    `${relativePath} must load the Meta Pixel event script exactly once`,
  );
  assert.equal(
    html.includes('src="/t662/"'),
    false,
    `${relativePath} must defer the large Google tag through /site-events.js`,
  );
  assert.equal(
    html.includes('src="/analytics.js"'),
    false,
    `${relativePath} must not load the retired /analytics.js file`,
  );
  assert.equal(
    html.includes("gtag('config', 'G-JN2E0S7E36')"),
    false,
    `${relativePath} must not contain the legacy inline GA initializer`,
  );
}

const siteEvents = await readFile(path.join(publicDir, "site-events.js"), "utf8");
const metaEvents = await readFile(path.join(publicDir, "meta-events-1108307461722381.js"), "utf8");
for (const requiredText of [
  "G-JN2E0S7E36",
  "1108307461722381",
  "campaign_landing",
  "google_ads_landing",
  "phone_click",
  'lead_type: "phone"',
  "offer_view",
  "offer_interest_click",
  "page_type",
  "session_landing_page",
  "ads_asset_group_id",
  "attribution_version",
  "menu_click",
  'script.src = "/t662/"',
  "requestIdleCallback",
  "window.__hotpotAnalyticsReady",
  "window.__hotpotMetaPixelConfigured",
  'window.fbq("track", "PageView")',
  'window.fbq("track", "Contact"',
  'window.fbq("track", "FindLocation"',
  'window.fbq("track", "ViewContent"',
]) {
  assert.ok(siteEvents.includes(requiredText), `site-events.js is missing ${requiredText}`);
}

for (const requiredText of [
  "1108307461722381",
  "window.__hotpotMetaStandaloneEvents",
  'window.fbq("track", "PageView")',
  'window.fbq("track", "Contact"',
  'window.fbq("track", "FindLocation"',
  'window.fbq("track", "ViewContent"',
]) {
  assert.ok(metaEvents.includes(requiredText), `meta-events script is missing ${requiredText}`);
}

assert.equal(
  /sendEvent\("directions_click"[\s\S]{0,240}sendEvent\("generate_lead"/.test(siteEvents),
  false,
  "directions_click must not also be reported as generate_lead",
);
assert.equal(siteEvents.includes("link_url:"), false, "Raw link URLs must not be sent to Analytics");
assert.equal(siteEvents.includes('params.get("gclid") ||'), false, "Raw Google click IDs must not be stored in event parameters");

console.log(`Attribution checks passed for ${htmlFiles.length} HTML files.`);
