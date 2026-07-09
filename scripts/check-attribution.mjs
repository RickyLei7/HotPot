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

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relativePath = path.relative(root, file);
  assert.equal(
    (html.match(/src="\/site-events\.js"/g) || []).length,
    1,
    `${relativePath} must load /site-events.js exactly once`,
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
for (const requiredText of [
  "G-JN2E0S7E36",
  "campaign_landing",
  "reservation_click",
  "menu_click",
  "window.__hotpotAnalyticsReady",
]) {
  assert.ok(siteEvents.includes(requiredText), `site-events.js is missing ${requiredText}`);
}

console.log(`Attribution checks passed for ${htmlFiles.length} HTML files.`);
