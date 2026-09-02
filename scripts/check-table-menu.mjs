import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const reportDir = path.join(root, "reports/table-menu-check");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
};

function resolvePublicPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  const resolved = path.resolve(publicDir, `.${relative}`);
  const withinPublic = resolved === publicDir || resolved.startsWith(`${publicDir}${path.sep}`);
  if (!withinPublic) throw new Error(`Request escaped public directory: ${pathname}`);
  return resolved;
}

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const file = resolvePublicPath(request.url ?? "/");
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": mimeTypes[path.extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function checkViewport(browser, origin, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const requestFailures = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(origin)) requestFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
  });

  try {
    const response = await page.goto(`${origin}/table-menu/`, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200);
    assert.equal(await page.locator("html").getAttribute("lang"), "en-CA");
    assert.equal(await page.locator("[data-table-menu-language='en']").getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("[data-featured-card]").count(), 5);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    assert.equal(await page.locator("form, [data-cart], [data-checkout], [data-order-submit]").count(), 0);
    assert.match(await page.locator("body").innerText(), /View-only menu — please order with your server\./u);

    await page.locator("[data-table-menu-language='zh']").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hant");
    assert.match(await page.locator("body").innerText(), /此菜單僅供瀏覽，請向服務員點單。/u);

    const search = page.locator("[data-table-menu-search]");
    await search.fill("章魚小丸子");
    const takoyaki = page.locator("[data-item-id='takoyaki']");
    const unrelated = page.locator("[data-item-id='veggie-spring-rolls']");
    assert.equal(await takoyaki.isVisible(), true);
    assert.equal(await unrelated.isVisible(), false);

    await search.fill("");
    await page.locator("[data-table-menu-category='appetizers']").click();
    assert.equal(await takoyaki.isVisible(), true);
    await takoyaki.click();
    const dialog = page.locator("[data-table-menu-dialog]");
    assert.equal(await dialog.isVisible(), true);
    assert.match(await dialog.innerText(), /\$8\.89/u);
    assert.match(await dialog.innerText(), /6 個/u);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-item-id")), "takoyaki");

    await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
    await page.waitForFunction(() => [...document.images].every((image) => image.complete), null, { timeout: 30_000 });
    const brokenImages = await page.locator("img").evaluateAll((images) => images
      .filter((image) => image.getBoundingClientRect().width === 0 || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src));
    assert.deepEqual(brokenImages, []);
    assert.deepEqual(requestFailures, []);
    assert.deepEqual(consoleErrors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);

    await page.locator("[data-table-menu-category='featured']").click();
    await page.screenshot({ path: path.join(reportDir, `table-menu-${viewport.width}.png`), fullPage: true });
  } finally {
    await page.close();
  }
}

export async function checkTableMenu() {
  await mkdir(reportDir, { recursive: true });
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }]) {
      await checkViewport(browser, origin, viewport);
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkTableMenu();
  console.log("Table menu checks passed at 390px and 430px.");
}
