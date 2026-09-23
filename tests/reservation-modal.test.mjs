import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const bookingOrigin = "https://reservation.centrestjhotpot.ca";
const [viewportWidth, viewportHeight] = (process.env.RESERVATION_VIEWPORT || "390x844").split("x").map(Number);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
      const file = path.resolve(publicDir, `.${relative}`);
      if (file !== publicDir && !file.startsWith(`${publicDir}${path.sep}`)) throw new Error("Invalid path");
      response.writeHead(200, { "content-type": mimeTypes[path.extname(file)] ?? "application/octet-stream" });
      response.end(await readFile(file));
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

test("online booking opens a safe same-page dialog while phone and direct-link fallbacks remain available", async () => {
  const { server, origin } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route(`${bookingOrigin}/embed/book*`, (route) => route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><button id="dirty">dirty</button><button id="done">done</button><button id="bad-done">bad done</button><button id="request-close">close</button><script>
      parent.postMessage({source:'hotpot-booking',type:'booking:ready'}, '*');
      dirty.onclick=()=>parent.postMessage({source:'hotpot-booking',type:'booking:dirty',dirty:true}, '*');
      done.onclick=()=>parent.postMessage({source:'hotpot-booking',type:'booking:completed',status:'confirmed',partySize:4}, '*');
      document.querySelector('#bad-done').onclick=()=>parent.postMessage({source:'hotpot-booking',type:'booking:completed',status:'confirmed',partySize:4,extra:'not-allowed'}, '*');
      document.querySelector('#request-close').onclick=()=>parent.postMessage({source:'hotpot-booking',type:'booking:request-close'}, '*');
    <\/script>`,
  }));

  try {
    await page.goto(`${origin}/?utm_source=google&utm_medium=cpc&utm_campaign=test&utm_content=ad-one&utm_id=123&creative=456&network=x&device=m&matchtype=e&gclid=test_click`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("a[href='tel:+14034553188']").count() > 0, true);
    assert.equal(await page.locator(".nav-actions .nav-book[data-reservation-launcher]").isVisible(), true, "the header keeps online booking as its primary action");
    assert.equal(await page.locator(".nav-actions .nav-phone").count(), 0, "the header does not duplicate the phone action beside online booking");
    assert.equal(await page.locator(".reserve-sticky-book").count(), 1, "the mobile booking action is present");
    assert.equal(await page.locator(".reserve-sticky-phone[href='tel:+14034553188']").count(), 1, "the mobile call action is present");

    const snackHeading = page.locator("#snack-title");
    assert.equal(await snackHeading.textContent(), "19 AYCE Snacks · +$5.99");
    const snackHeadingMetrics = await snackHeading.evaluate((element) => {
      const style = getComputedStyle(element);
      return { height: element.getBoundingClientRect().height, lineHeight: Number.parseFloat(style.lineHeight) };
    });
    assert.ok(snackHeadingMetrics.height <= snackHeadingMetrics.lineHeight * 2.1, "the snack upgrade heading fits within two mobile lines");

    const launcher = page.locator("a[data-reservation-launcher]").first();
    assert.equal(await launcher.count(), 1, "the online booking link is present");
    const launcherUrl = new URL(await launcher.getAttribute("href"));
    assert.equal(launcherUrl.origin + launcherUrl.pathname, `${bookingOrigin}/book`);
    assert.equal(launcherUrl.searchParams.get("source"), "google");
    assert.equal(launcherUrl.searchParams.get("campaignName"), "test");
    assert.equal(launcherUrl.searchParams.get("content"), "ad-one");
    assert.equal(launcherUrl.searchParams.get("creativeId"), "456");
    assert.equal(launcherUrl.searchParams.get("clickId"), "test_click");
    await launcher.click();
    await page.waitForTimeout(100);
    assert.deepEqual(pageErrors, []);

    const dialog = page.locator("[data-reservation-dialog] .reservation-dialog");
    assert.equal(await dialog.isVisible(), true);
    await page.waitForFunction(() => document.querySelector("link[data-reservation-modal-styles]")?.sheet?.cssRules.length);
    assert.equal(page.url(), `${origin}/?utm_source=google&utm_medium=cpc&utm_campaign=test&utm_content=ad-one&utm_id=123&creative=456&network=x&device=m&matchtype=e&gclid=test_click`);
    const bounds = await dialog.boundingBox();
    assert.ok(bounds);
    if (viewportWidth <= 600) {
      assert.equal(Math.round(bounds.width), viewportWidth);
      assert.equal(Math.round(bounds.height), Math.min(640, viewportHeight - 8));
    } else {
      assert.ok(bounds.width <= 640, `desktop dialog width was ${bounds.width}px`);
      assert.ok(bounds.height <= 760, `desktop dialog height was ${bounds.height}px`);
      assert.equal(bounds.x > 0, true);
    }
    const embeddedUrl = new URL(await page.locator("[data-reservation-dialog] iframe").getAttribute("src"));
    assert.equal(embeddedUrl.origin + embeddedUrl.pathname, `${bookingOrigin}/embed/book`);
    assert.equal(embeddedUrl.searchParams.get("content"), "ad-one");
    assert.equal(await page.locator("[data-reservation-dialog] iframe").getAttribute("sandbox"), "allow-forms allow-scripts allow-same-origin");
    assert.equal(await page.locator("[data-reservation-problem] a[data-reservation-direct]").getAttribute("data-reservation-direct"), "");
    assert.equal(await page.locator("[data-reservation-problem] a[href='tel:+14034553188']").count(), 1, "the loading fallback keeps phone booking available");
    assert.equal(await page.evaluate(() => document.body.style.position), "fixed");

    await page.locator("[data-reservation-dialog-backdrop]").dispatchEvent("click");
    assert.equal(await dialog.isVisible(), true);

    await page.frameLocator("[data-reservation-dialog] iframe").locator("#dirty").click();
    await page.waitForTimeout(50);
    await page.locator("[data-reservation-close]").focus();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[data-reservation-discard]").isVisible(), true);
    await page.locator("[data-reservation-discard] button").last().click();
    assert.equal(await dialog.isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement?.matches("a[data-reservation-launcher]")), true);

    await launcher.click();
    await page.waitForFunction(() => document.querySelector("link[data-reservation-modal-styles]")?.sheet?.cssRules.length);
    await page.evaluate(() => {
      window.__untrustedBookingCompletion = false;
      addEventListener("hotpot:booking-completed", () => { window.__untrustedBookingCompletion = true; }, { once: true });
    });
    await page.evaluate(() => window.postMessage({ source: "hotpot-booking", type: "booking:completed", status: "pending" }, "*"));
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.__untrustedBookingCompletion), false);
    await page.evaluate(() => {
      window.__unexpectedBookingCompletion = false;
      addEventListener("hotpot:booking-completed", () => { window.__unexpectedBookingCompletion = true; });
    });
    await page.frameLocator("[data-reservation-dialog] iframe").locator("#bad-done").click();
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.__unexpectedBookingCompletion), false, "rejects trusted-frame messages with extra fields");
    const completion = page.evaluate(() => new Promise((resolve) => {
      addEventListener("hotpot:booking-completed", (event) => resolve(event.detail), { once: true });
    }));
    await page.frameLocator("[data-reservation-dialog] iframe").locator("#done").click();
    assert.deepEqual(await completion, { status: "confirmed", partySize: 4 });
    assert.equal(await page.evaluate(() => window.dataLayer.some((entry) => entry?.[1] === "online_booking_completed" && entry?.[2]?.booking_source === "google" && entry?.[2]?.booking_medium === "cpc" && entry?.[2]?.party_size === 4)), true);
    assert.equal(await page.evaluate(() => Object.keys(Array.from(window.dataLayer).find((entry) => entry?.[1] === "online_booking_completed")?.[2] || {}).length <= 25), true, "booking events must fit GA4's 25-parameter limit");
    assert.equal(await page.evaluate(() => window.dataLayer.some((entry) => entry?.[1] === "reservation_completed" && entry?.[2]?.party_size === 4)), true);
    assert.equal(await page.evaluate(() => JSON.stringify(window.dataLayer).includes("email")), false);
    await page.frameLocator("[data-reservation-dialog] iframe").locator("#request-close").click();
    await page.waitForTimeout(50);
    assert.equal(await dialog.isVisible(), false);
  } finally {
    await page.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
