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

      const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(400, innerHeight - 120)) {
          scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        scrollTo(0, 0);
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
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
      if (data.horizontalOverflow > 1) routeFailures.push(`horizontal overflow ${data.horizontalOverflow}px`);
      if (data.brokenImages.length) routeFailures.push(`broken images: ${data.brokenImages.join(", ")}`);
      if (requestFailures.length) routeFailures.push(`request failures: ${requestFailures.join(", ")}`);
      if (consoleErrors.length) routeFailures.push(`console errors: ${consoleErrors.join(" | ")}`);

      const result = { viewport: viewport.name, pathname, screenshotPath, ...data, failures: routeFailures };
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
