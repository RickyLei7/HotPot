import { chromium } from "playwright";
import { createServer } from "node:http";
import { mkdir } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outputDir = path.join(root, "reports", "visual-check");
const pages = [
  "/",
  "/menu/",
  "/about/",
  "/faq/",
  "/contact/",
  "/restaurant-info/",
  "/calgary-hot-pot-guide/",
  "/calgary-taiwanese-hot-pot/",
  "/first-time-hot-pot-calgary/",
  "/ayce-hot-pot-calgary/",
];
const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1440, height: 1000, isMobile: false },
];

const contentTypes = new Map([
  [".css", "text/css"],
  [".html", "text/html"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript"],
  [".json", "application/json"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".txt", "text/plain"],
  [".webp", "image/webp"],
  [".xml", "application/xml"],
]);

function fileForUrl(url) {
  const parsed = new URL(url, "http://127.0.0.1");
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  return path.normalize(path.join(publicDir, pathname));
}

async function startServer() {
  const server = createServer(async (req, res) => {
    if (req.url === "/t662/") {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.end("window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};");
      return;
    }
    const filePath = fileForUrl(req.url || "/");
    if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": contentTypes.get(ext) || "application/octet-stream" });
    createReadStream(filePath).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const sticky = document.querySelector(".reserve-sticky")?.getBoundingClientRect();
    const images = [...document.images].map((img) => ({
      src: img.getAttribute("src"),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      rect: img.getBoundingClientRect().toJSON(),
    }));
    const metaDescription = document.querySelector('meta[name="description"]')?.content || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
    const ogImage = document.querySelector('meta[property="og:image"]')?.content || "";
    const dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    const campaignLanding = dataLayer.find((entry) => (
      entry?.[0] === "event"
      && entry?.[1] === "campaign_landing"
    ));
    const visibleImages = images.filter((img) => (
      img.rect.width > 0
      && img.rect.height > 0
      && img.rect.bottom > 0
      && img.rect.top < innerHeight
    ));
    const largeVisibleImages = visibleImages.filter((img) => img.rect.height > innerHeight * 0.9);
    return {
      title: document.title,
      metaDescriptionLength: metaDescription.length,
      canonical,
      ogImage,
      jsonLdCount: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
      analyticsReady: window.__hotpotAnalyticsReady === true,
      gtagReady: typeof window.gtag === "function",
      campaignLandingSource: campaignLanding?.[2]?.campaign_source || "",
      horizontalOverflow: root.scrollWidth - root.clientWidth,
      scrollHeight: root.scrollHeight,
      brokenImages: visibleImages.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
      largeVisibleImages: largeVisibleImages.map((img) => ({ src: img.src, height: Math.round(img.rect.height) })),
      stickyVisible: sticky ? sticky.width > 0 && sticky.height > 0 : false,
    };
  });
}

const { server, baseUrl } = await startServer();
const browser = await chromium.launch({ headless: true });
const failures = [];
const results = [];

try {
  await mkdir(outputDir, { recursive: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      deviceScaleFactor: 1,
    });
    for (const pathname of pages) {
      const page = await context.newPage();
      const requestFailures = [];
      const consoleErrors = [];
      page.on("requestfailed", (request) => {
        const url = request.url();
        if (url.includes("google-analytics.com") || url.includes("googletagmanager.com")) return;
        requestFailures.push(url);
      });
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      const pageUrl = pathname === "/"
        ? `${baseUrl}/?utm_source=visual_check&utm_medium=test&utm_campaign=attribution_check`
        : `${baseUrl}${pathname}`;
      const response = await page.goto(pageUrl, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = "auto";
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(400, innerHeight - 120)) {
          scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
      const mobileInteraction = viewport.isMobile ? await page.evaluate(async () => {
        const sticky = document.querySelector(".reserve-sticky");
        const hero = document.querySelector(".hero, .page-hero, .ads-hero");
        const stickyHiddenAtTop = sticky ? !sticky.classList.contains("is-visible") : false;

        const more = document.querySelector(".nav-more");
        const summary = more?.querySelector("summary");
        summary?.click();
        await new Promise((resolve) => setTimeout(resolve, 50));
        const menuOpened = Boolean(more?.open);
        const menuLinksVisible = [...(more?.querySelectorAll(".nav-more-links a") || [])]
          .every((link) => link.getBoundingClientRect().height > 0);
        summary?.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        scrollTo(0, hero ? hero.offsetTop + hero.offsetHeight + 80 : innerHeight * 0.75);
        await new Promise((resolve) => setTimeout(resolve, 220));
        const stickyVisibleAfterHero = Boolean(sticky?.classList.contains("is-visible"));
        scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 180));
        return { menuOpened, menuLinksVisible, stickyHiddenAtTop, stickyVisibleAfterHero };
      }) : null;
      const data = await inspectPage(page);
      const safeName = pathname === "/" ? "home" : pathname.replaceAll("/", "-").replace(/^-|-$/g, "");
      const screenshotPath = path.join(outputDir, `${viewport.name}-${safeName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const routeFailures = [];
      if (!response || response.status() !== 200) routeFailures.push(`HTTP ${response?.status() || "no response"}`);
      if (!data.title || data.title.length > 70) routeFailures.push("missing or long title");
      if (data.metaDescriptionLength < 80 || data.metaDescriptionLength > 220) routeFailures.push("meta description length out of range");
      if (!data.canonical) routeFailures.push("missing canonical");
      if (!data.ogImage) routeFailures.push("missing og:image");
      if (!data.analyticsReady) routeFailures.push("site analytics initializer is not ready");
      if (!data.gtagReady) routeFailures.push("gtag is not available");
      if (pathname === "/" && data.campaignLandingSource !== "visual_check") {
        routeFailures.push("campaign_landing did not capture the UTM source");
      }
      if (data.horizontalOverflow > 1) routeFailures.push(`horizontal overflow ${data.horizontalOverflow}px`);
      if (data.brokenImages.length) routeFailures.push(`broken images: ${data.brokenImages.join(", ")}`);
      if (requestFailures.length) routeFailures.push(`request failures: ${requestFailures.join(", ")}`);
      if (consoleErrors.length) routeFailures.push(`console errors: ${consoleErrors.join(" | ")}`);
      if (viewport.isMobile && !mobileInteraction?.menuOpened) routeFailures.push("mobile More menu did not open");
      if (viewport.isMobile && !mobileInteraction?.menuLinksVisible) routeFailures.push("mobile More links are not visible");
      if (viewport.isMobile && !mobileInteraction?.stickyHiddenAtTop) routeFailures.push("sticky reserve is visible over the first screen");
      if (viewport.isMobile && !mobileInteraction?.stickyVisibleAfterHero) routeFailures.push("sticky reserve did not appear after the hero");

      const result = { viewport: viewport.name, pathname, screenshotPath, ...data, mobileInteraction, failures: routeFailures };
      results.push(result);
      failures.push(...routeFailures.map((failure) => `${viewport.name} ${pathname}: ${failure}`));
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(JSON.stringify({ ok: failures.length === 0, failures, results }, null, 2));
if (failures.length) process.exit(1);
