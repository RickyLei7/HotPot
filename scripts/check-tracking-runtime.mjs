import assert from "node:assert/strict";
import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const publicDir = path.join(root, "public");
const contentTypes = new Map([
  [".css", "text/css"],
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function fileForUrl(url) {
  const parsed = new URL(url, "http://127.0.0.1");
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  return path.normalize(path.join(publicDir, pathname));
}

const server = createServer((request, response) => {
  if (request.url === "/t662/") {
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.end("window.dataLayer=window.dataLayer||[];");
    return;
  }
  const filePath = fileForUrl(request.url || "/");
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": contentTypes.get(path.extname(filePath)) || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });

function eventFromLayer(layer, name) {
  return layer.find((entry) => entry?.[0] === "event" && entry?.[1] === name);
}

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const gclid = "TEST-GCLID-MUST-NOT-BE-SENT";
  const url = new URL("/", baseUrl);
  url.search = new URLSearchParams({
    utm_source: "google_ads",
    utm_medium: "cpc",
    utm_campaign: "ayce_pmax_local",
    utm_content: "pmax_main",
    utm_term: "hot pot calgary",
    campaign_id: "24055900999",
    asset_group_id: "6732359062",
    network: "x",
    device: "m",
    gclid,
  });
  await page.goto(url.toString(), { waitUntil: "networkidle" });

  const landingLayer = await page.evaluate(() => window.dataLayer);
  const campaignLanding = eventFromLayer(landingLayer, "campaign_landing");
  const adsLanding = eventFromLayer(landingLayer, "google_ads_landing");
  assert.ok(campaignLanding, "campaign_landing was not sent");
  assert.ok(adsLanding, "google_ads_landing was not sent");
  assert.equal(campaignLanding[2].campaign_source, "google", "google_ads must be normalized to google");
  assert.equal(campaignLanding[2].ads_campaign_id, "24055900999");
  assert.equal(campaignLanding[2].ads_asset_group_id, "6732359062");
  assert.equal(campaignLanding[2].page_type, "home");
  assert.equal(JSON.stringify(landingLayer).includes(gclid), false, "Raw click IDs must not enter the data layer");

  await page.goto(`${baseUrl}/menu/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true });
    document.querySelector('a[href="tel:+14034553188"]')?.click();
  });
  const phoneLayer = await page.evaluate(() => window.dataLayer);
  const phoneClick = eventFromLayer(phoneLayer, "phone_click");
  const lead = eventFromLayer(phoneLayer, "generate_lead");
  assert.ok(phoneClick, "phone_click was not sent");
  assert.ok(lead, "generate_lead was not sent for the phone CTA");
  assert.equal(phoneClick[2].campaign_source, "google", "Attribution did not persist across pages");
  assert.equal(phoneClick[2].session_landing_page, "/", "Original landing page did not persist");
  assert.equal(phoneClick[2].link_destination, "phone", "Phone number must not be sent as a URL");
  assert.equal(phoneClick[2].lead_type, undefined, "phone_click and generate_lead must remain separate event definitions");
  assert.equal(lead[2].lead_type, "phone");
  assert.equal(JSON.stringify(phoneLayer).includes("+14034553188"), false, "Phone number must not enter the data layer");

  const directionsPage = await context.newPage();
  await directionsPage.goto(`${baseUrl}/contact/`, { waitUntil: "networkidle" });
  await directionsPage.evaluate(() => {
    document.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true });
    document.querySelector('a[href*="google.com/maps"]')?.click();
  });
  const directionsLayer = await directionsPage.evaluate(() => window.dataLayer);
  assert.ok(eventFromLayer(directionsLayer, "directions_click"), "directions_click was not sent");
  assert.equal(Boolean(eventFromLayer(directionsLayer, "generate_lead")), false, "Directions must not be duplicated as generate_lead");

  await context.close();
  console.log("Runtime tracking checks passed: paid landing, session attribution, phone lead, privacy, and directions separation.");
} finally {
  await browser.close();
  server.close();
}
