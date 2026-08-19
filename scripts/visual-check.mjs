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
  "/zh-hant/",
  "/zh-hant/menu/",
  "/zh-hant/about/",
  "/zh-hant/faq/",
  "/zh-hant/contact/",
  "/zh-hant/restaurant-info/",
  "/zh-hant/calgary-hot-pot-guide/",
  "/zh-hant/calgary-taiwanese-hot-pot/",
  "/zh-hant/first-time-hot-pot-calgary/",
  "/zh-hant/ayce-hot-pot-calgary/",
  "/google-ads-ayce-hot-pot/",
];
const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
];
const posterCounts = new Map([
  ["/", 3],
  ["/menu/", 3],
  ["/ayce-hot-pot-calgary/", 1],
  ["/zh-hant/", 3],
  ["/zh-hant/ayce-hot-pot-calgary/", 1],
  ["/google-ads-ayce-hot-pot/", 1],
]);

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
    const activeLanguage = document.querySelector(".language-option.is-active");
    const languageOptions = [...document.querySelectorAll(".language-option")];
    const visibleImages = images.filter((img) => (
      img.rect.width > 0
      && img.rect.height > 0
      && img.rect.bottom > 0
      && img.rect.top < innerHeight
    ));
    const largeVisibleImages = visibleImages.filter((img) => img.rect.height > innerHeight * 0.9);
    const homepageSectionIds = ["ayce", "personal-hot-pot", "beef-noodle", "light-meals", "drinks", "visit"];
    const homepageSectionPositions = homepageSectionIds.map((id) => ({
      id,
      top: document.getElementById(id)?.offsetTop ?? -1,
    }));
    const lightMealImages = [...document.querySelectorAll(".light-meal-card img")].map((img) => ({
      src: img.getAttribute("src"),
      currentSrc: img.currentSrc,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
    }));
    const snackImageHeights = [...document.querySelectorAll(".snack-card img")]
      .map((img) => Math.round(img.getBoundingClientRect().height));
    const soupMenuImage = document.querySelector(".soup-preview-strip img");
    const soupMenuRect = soupMenuImage?.getBoundingClientRect();
    const homepageAyceImage = document.querySelector(".homepage-ayce-media img");
    const homepageAyceRect = homepageAyceImage?.getBoundingClientRect();
    const visitCardColors = [...document.querySelectorAll(".homepage-visit .visit-grid article")].map((card) => ({
      heading: getComputedStyle(card.querySelector("h3")).color,
      body: getComputedStyle(card.querySelector("p")).color,
    }));
    return {
      title: document.title,
      metaDescriptionLength: metaDescription.length,
      canonical,
      ogImage,
      jsonLdCount: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
      analyticsReady: window.__hotpotAnalyticsReady === true,
      gtagReady: typeof window.gtag === "function",
      campaignLandingSource: campaignLanding?.[2]?.campaign_source || "",
      documentLanguage: document.documentElement.lang,
      activeLanguage: activeLanguage?.textContent?.trim() || "",
      languageSwitchVisible: languageOptions.length === 2
        && languageOptions.every((option) => option.getBoundingClientRect().height > 0),
      horizontalOverflow: root.scrollWidth - root.clientWidth,
      scrollHeight: root.scrollHeight,
      brokenImages: visibleImages.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
      largeVisibleImages: largeVisibleImages.map((img) => ({ src: img.src, height: Math.round(img.rect.height) })),
      stickyVisible: sticky ? sticky.width > 0 && sticky.height > 0 : false,
      homepageSectionPositions,
      lightMealImages,
      snackImageHeights,
      visitCardColors,
      soupMenuImage: soupMenuImage ? {
        src: soupMenuImage.getAttribute("src"),
        naturalWidth: soupMenuImage.naturalWidth,
        naturalHeight: soupMenuImage.naturalHeight,
        displayedWidth: soupMenuRect.width,
        displayedHeight: soupMenuRect.height,
      } : null,
      homepageAyceImage: homepageAyceImage ? {
        src: homepageAyceImage.currentSrc || homepageAyceImage.getAttribute("src"),
        naturalWidth: homepageAyceImage.naturalWidth,
        naturalHeight: homepageAyceImage.naturalHeight,
        displayedWidth: homepageAyceRect.width,
        displayedHeight: homepageAyceRect.height,
        objectFit: getComputedStyle(homepageAyceImage).objectFit,
      } : null,
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
        const hero = document.querySelector(".hero, .page-hero, .ads-hero, .homepage-ayce, .localized-hero");
        const stickyHiddenAtTop = sticky ? !sticky.classList.contains("is-visible") : false;

        const more = document.querySelector(".nav-more");
        const summary = more?.querySelector("summary");
        summary?.click();
        await new Promise((resolve) => setTimeout(resolve, 50));
        const menuOpened = !more || Boolean(more.open);
        const menuLinksVisible = !more || [...more.querySelectorAll(".nav-more-links a")]
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
      const posterInteraction = await page.evaluate(async () => {
        const triggers = [...document.querySelectorAll(".poster-thumbnail")];
        const posterResults = [];
        for (const trigger of triggers) {
          trigger.click();
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const modal = document.querySelector(".poster-modal:target");
          const modalImage = modal?.querySelector(".poster-frame img");
          const opened = Boolean(modal && getComputedStyle(modal).display !== "none");
          if (modalImage && (!modalImage.complete || modalImage.naturalWidth === 0)) {
            await Promise.race([
              modalImage.decode().catch(() => {}),
              new Promise((resolve) => setTimeout(resolve, 1200)),
            ]);
          }
          const fullImageLoaded = Boolean(modalImage?.complete && modalImage.naturalWidth > 0 && modalImage.naturalHeight > 0);
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          posterResults.push({ opened, fullImageLoaded, closedWithEscape: !document.querySelector(".poster-modal:target") });
        }
        return { triggerCount: triggers.length, posterResults };
      });
      const data = await inspectPage(page);
      const navTopAfterScroll = await page.evaluate(async () => {
        scrollTo(0, 900);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const top = document.querySelector(".site-nav")?.getBoundingClientRect().top;
        scrollTo(0, 0);
        return top;
      });
      const safeName = pathname === "/" ? "home" : pathname.replaceAll("/", "-").replace(/^-|-$/g, "");
      const screenshotPath = path.join(outputDir, `${viewport.name}-${safeName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const routeFailures = [];
      if (!response || response.status() !== 200) routeFailures.push(`HTTP ${response?.status() || "no response"}`);
      if (!data.title || data.title.length > 70) routeFailures.push("missing or long title");
      const isTraditionalChinese = pathname.startsWith("/zh-hant/");
      const descriptionIsOutOfRange = isTraditionalChinese
        ? data.metaDescriptionLength < 45 || data.metaDescriptionLength > 110
        : data.metaDescriptionLength < 80 || data.metaDescriptionLength > 220;
      if (descriptionIsOutOfRange) routeFailures.push("meta description length out of range");
      if (!data.canonical) routeFailures.push("missing canonical");
      if (!data.ogImage) routeFailures.push("missing og:image");
      if (!data.analyticsReady) routeFailures.push("site analytics initializer is not ready");
      if (!data.gtagReady) routeFailures.push("gtag is not available");
      if (pathname !== "/google-ads-ayce-hot-pot/" && !data.languageSwitchVisible) {
        routeFailures.push("language switch is missing or hidden");
      }
      if (pathname.startsWith("/zh-hant/") && data.documentLanguage !== "zh-Hant") {
        routeFailures.push(`unexpected document language ${data.documentLanguage}`);
      }
      if (pathname.startsWith("/zh-hant/") && data.activeLanguage !== "中文") {
        routeFailures.push("Traditional Chinese language state is not active");
      }
      if (!pathname.startsWith("/zh-hant/") && pathname !== "/google-ads-ayce-hot-pot/" && data.activeLanguage !== "EN") {
        routeFailures.push("English language state is not active");
      }
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
      const expectedPosterCount = posterCounts.get(pathname) || 0;
      if (posterInteraction.triggerCount !== expectedPosterCount) routeFailures.push(`expected ${expectedPosterCount} poster thumbnails, found ${posterInteraction.triggerCount}`);
      posterInteraction.posterResults.forEach((poster, index) => {
        if (!poster.opened) routeFailures.push(`poster ${index + 1} did not open`);
        if (!poster.fullImageLoaded) routeFailures.push(`poster ${index + 1} full image did not load`);
        if (!poster.closedWithEscape) routeFailures.push(`poster ${index + 1} did not close with Escape`);
      });
      if (["/", "/zh-hant/"].includes(pathname)) {
        const positions = data.homepageSectionPositions;
        if (positions.some(({ top }) => top < 0)) routeFailures.push("homepage section is missing");
        if (positions.some(({ top }, index) => index > 0 && top <= positions[index - 1].top)) routeFailures.push("homepage section order is incorrect");
        if (data.lightMealImages.length !== 6) routeFailures.push(`expected 6 light meal images, found ${data.lightMealImages.length}`);
        if (data.lightMealImages.some((image) => !image.complete || image.naturalWidth === 0)) routeFailures.push("a light meal image did not load");
        if (data.lightMealImages.some((image) => !image.src?.includes("-1024.webp"))) routeFailures.push("a light meal image is not using the HD source set");
        if (data.snackImageHeights.length !== 5) routeFailures.push(`expected 5 snack images, found ${data.snackImageHeights.length}`);
        if (data.snackImageHeights.length && Math.max(...data.snackImageHeights) - Math.min(...data.snackImageHeights) > 3) {
          routeFailures.push(`snack image heights are inconsistent: ${data.snackImageHeights.join(", ")}`);
        }
        if (data.visitCardColors.length !== 4) routeFailures.push(`expected 4 visit cards, found ${data.visitCardColors.length}`);
        if (data.visitCardColors.some(({ heading, body }) => heading !== "rgb(255, 248, 234)" || body !== "rgb(239, 226, 203)")) {
          routeFailures.push(`visit card text contrast is incorrect: ${JSON.stringify(data.visitCardColors)}`);
        }
        if (!data.soupMenuImage || data.soupMenuImage.naturalWidth === 0) {
          routeFailures.push("full personal hot pot menu image did not load");
        } else {
          const naturalRatio = data.soupMenuImage.naturalWidth / data.soupMenuImage.naturalHeight;
          const displayedRatio = data.soupMenuImage.displayedWidth / data.soupMenuImage.displayedHeight;
          if (Math.abs(naturalRatio - displayedRatio) > 0.01) {
            routeFailures.push(`personal hot pot menu image is cropped or distorted: ${displayedRatio.toFixed(3)} vs ${naturalRatio.toFixed(3)}`);
          }
        }
        if (!data.homepageAyceImage || data.homepageAyceImage.naturalWidth === 0) {
          routeFailures.push("homepage AYCE image did not load");
        } else {
          const naturalRatio = data.homepageAyceImage.naturalWidth / data.homepageAyceImage.naturalHeight;
          const displayedRatio = data.homepageAyceImage.displayedWidth / data.homepageAyceImage.displayedHeight;
          if (Math.abs(naturalRatio - displayedRatio) > 0.01 || data.homepageAyceImage.objectFit !== "contain") {
            routeFailures.push(`homepage AYCE image is cropped or distorted: ${displayedRatio.toFixed(3)} vs ${naturalRatio.toFixed(3)}`);
          }
        }
        if (Math.abs(navTopAfterScroll ?? 999) > 1) routeFailures.push("sticky header left viewport top");
      }

      const result = { viewport: viewport.name, pathname, screenshotPath, ...data, navTopAfterScroll, mobileInteraction, posterInteraction, failures: routeFailures };
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
