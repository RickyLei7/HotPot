import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const origin = "https://centrestjhotpot.ca";
const pairs = new Map([
  ["/", "/zh-hant/"],
  ["/about/", "/zh-hant/about/"],
  ["/menu/", "/zh-hant/menu/"],
  ["/faq/", "/zh-hant/faq/"],
  ["/contact/", "/zh-hant/contact/"],
  ["/restaurant-info/", "/zh-hant/restaurant-info/"],
  ["/calgary-hot-pot-guide/", "/zh-hant/calgary-hot-pot-guide/"],
  ["/calgary-taiwanese-hot-pot/", "/zh-hant/calgary-taiwanese-hot-pot/"],
  ["/first-time-hot-pot-calgary/", "/zh-hant/first-time-hot-pot-calgary/"],
  ["/ayce-hot-pot-calgary/", "/zh-hant/ayce-hot-pot-calgary/"],
]);

function fileForRoute(route) {
  return route === "/"
    ? path.join(publicDir, "index.html")
    : path.join(publicDir, route.slice(1), "index.html");
}

function absolute(route) {
  return `${origin}${route}`;
}

function attribute(html, elementPattern, attributeName) {
  const element = html.match(elementPattern)?.[0] || "";
  return element.match(new RegExp(`${attributeName}=["']([^"']+)["']`, "i"))?.[1] || "";
}

function canonical(html) {
  return attribute(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/i, "href");
}

function alternates(html) {
  const result = {};
  for (const tag of html.match(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi) || []) {
    const hreflang = attribute(tag, /<link\b[^>]*>/i, "hreflang");
    const href = attribute(tag, /<link\b[^>]*>/i, "href");
    if (hreflang && href) result[hreflang] = href;
  }
  return result;
}

function textValue(html, pattern) {
  return html.match(pattern)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
}

function validateHeadingPunctuation(html, route) {
  const displayHeadingHtml = html.replace(/<div class="faq-list">[\s\S]*?<\/div>\s*<\/section>/gi, "");
  const headings = displayHeadingHtml.match(/<h[1-3]\b[^>]*>[\s\S]*?<\/h[1-3]>/gi) || [];
  for (const headingHtml of headings) {
    const heading = headingHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();

    // Addresses keep punctuation for meaning. FAQ questions are removed above.
    if (/Centre St/i.test(heading)) continue;

    const withoutDecimals = heading.replace(/\d+\.\d+/g, "");
    assert.doesNotMatch(
      withoutDecimals,
      /[，。、,.!?！？]/u,
      `${route} display heading uses decorative punctuation: ${heading}`,
    );
  }
}

function validateDocument(html, route, language, pair) {
  const expectedLang = language === "en" ? "en-CA" : "zh-Hant";
  const htmlLang = attribute(html, /<html\b[^>]*>/i, "lang");
  assert.equal(htmlLang, expectedLang, `${route} must use lang=${expectedLang}`);
  assert.equal(canonical(html), absolute(route), `${route} must self-canonicalize`);

  const links = alternates(html);
  assert.equal(links["en-CA"], absolute(pair.en), `${route} has the wrong en-CA alternate`);
  assert.equal(links["zh-Hant-CA"], absolute(pair.zhHant), `${route} has the wrong zh-Hant-CA alternate`);
  assert.equal(links["x-default"], absolute(pair.en), `${route} has the wrong x-default alternate`);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${route} must contain exactly one H1`);
  assert.ok(html.includes('class="language-switch"'), `${route} is missing the visible language switch`);
  assert.ok(html.includes(`hreflang="en-CA" lang="en-CA" href="${pair.en}"`), `${route} has the wrong English switch destination`);
  assert.ok(html.includes(`hreflang="zh-Hant-CA" lang="zh-Hant" href="${pair.zhHant}"`), `${route} has the wrong Traditional Chinese switch destination`);
  const activeLabel = language === "en" ? "EN" : "中文";
  assert.match(html, new RegExp(`class="language-option is-active"[^>]*>${activeLabel}<`), `${route} has the wrong active language`);
  assert.ok(html.includes("/language-routes.js"), `${route} must load the shared language route manifest`);
  assert.ok(html.includes("+14034553188"), `${route} must preserve the reservation phone`);
  assert.ok(textValue(html, /<title>([\s\S]*?)<\/title>/i), `${route} is missing a title`);
  assert.ok(attribute(html, /<meta\b[^>]*name=["']description["'][^>]*>/i, "content"), `${route} is missing a description`);
  const robots = attribute(html, /<meta\b[^>]*name=["']robots["'][^>]*>/i, "content");
  for (const directive of ["index", "follow", "max-image-preview:large", "max-snippet:-1", "max-video-preview:-1"]) {
    assert.ok(robots.includes(directive), `${route} is missing robots directive: ${directive}`);
  }
  validateHeadingPunctuation(html, route);
}

function validateHomepageMenuStructure(enHtml, zhHtml) {
  const sectionIds = ["ayce", "personal-hot-pot", "beef-noodle", "light-meals", "drinks", "visit"];
  for (const [route, html] of [["/", enHtml], ["/zh-hant/", zhHtml]]) {
    let previous = -1;
    for (const id of sectionIds) {
      const position = html.indexOf(`id="${id}"`);
      assert.ok(position > previous, `${route} homepage section order is missing or incorrect: ${id}`);
      previous = position;
    }
  }

  assert.match(enHtml, /\$19\.99[\s\S]*15 soup bases[\s\S]*vegetable set[\s\S]*one meat[\s\S]*(rice|noodle)/i);
  assert.match(zhHtml, /\$19\.99[\s\S]*15 款湯底[\s\S]*菜盤[\s\S]*一份肉[\s\S]*一份主食/);
  assert.match(enHtml, /\$24\.99[\s\S]*\$58\.99/);
  assert.match(zhHtml, /\$24\.99[\s\S]*\$58\.99/);
  assert.match(enHtml, /Signature Taiwanese Fried Chicken/);
  assert.match(zhHtml, /招牌台式鹽酥雞/);

  const lightMealSlugs = [
    "braised-pork-rice",
    "fried-chicken-rice-noodle",
    "wonton-rice-noodle",
    "unagi-rice",
    "beef-brisket-rice",
    "sukiyaki-beef-rice",
  ];
  for (const slug of lightMealSlugs) {
    assert.match(enHtml, new RegExp(`/assets/light-meals/${slug}-480\\.webp`));
    assert.match(enHtml, new RegExp(`/assets/light-meals/${slug}-1024\\.webp`));
    assert.match(zhHtml, new RegExp(`/assets/light-meals/${slug}-480\\.webp`));
    assert.match(zhHtml, new RegExp(`/assets/light-meals/${slug}-1024\\.webp`));
  }
}

for (const [enRoute, zhRoute] of pairs) {
  const [enHtml, zhHtml] = await Promise.all([
    readFile(fileForRoute(enRoute), "utf8"),
    readFile(fileForRoute(zhRoute), "utf8"),
  ]);
  const pair = { en: enRoute, zhHant: zhRoute };
  validateDocument(enHtml, enRoute, "en", pair);
  validateDocument(zhHtml, zhRoute, "zh-Hant", pair);
  const timeLimitPattern = /1\.5\s*(?:hours?|hrs?|小時)|time limit|限時\s*1\.5|用餐時間(?:為)?\s*1\.5/iu;
  assert.doesNotMatch(enHtml, timeLimitPattern, `${enRoute} must not emphasize the AYCE time limit`);
  assert.doesNotMatch(zhHtml, timeLimitPattern, `${zhRoute} must not emphasize the AYCE time limit`);
  assert.doesNotMatch(zhHtml, /[税稅]/u, `${zhRoute} must not contain Chinese tax characters`);
  assert.doesNotMatch(
    enHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replaceAll(">中文<", "><"),
    /[\u3400-\u9fff]/u,
    `${enRoute} must not contain Chinese text outside the language switch`,
  );
}

const [englishHome, chineseHome] = await Promise.all([
  readFile(fileForRoute("/"), "utf8"),
  readFile(fileForRoute("/zh-hant/"), "utf8"),
]);
validateHomepageMenuStructure(englishHome, chineseHome);
assert.ok(englishHome.includes("Traditional Taiwanese Beef Noodle Soup"), "English home must preserve the beef noodle story");
assert.ok(englishHome.includes("A Bowl That Feels Like Home"), "English home must preserve the full beef noodle story copy");
assert.ok(!englishHome.includes('<details class="story-details">'), "English home must show the beef noodle story without a collapsed disclosure");
assert.ok(chineseHome.includes("一碗讓人想起家的台灣傳統牛肉麵"), "Chinese home must include the beef noodle story");
assert.ok(chineseHome.includes("慢火熬出的濃郁湯頭"), "Chinese home must preserve the full beef noodle story copy");
for (const html of [englishHome, chineseHome]) {
  assert.match(html, /AYCE|火鍋自助/u, "Home pages must preserve AYCE content while restoring beef noodle content");
}

const chineseMenu = await readFile(fileForRoute("/zh-hant/menu/"), "utf8");
for (const menuHref of [
  "/menu/hotpot-menu.jpg",
  "/menu/drink-menu.jpg",
  "/menu/centre-street-japanese-hotpot-menu.pdf",
]) {
  assert.ok(chineseMenu.includes(`href="${menuHref}"`), `Chinese menu is missing visible menu link: ${menuHref}`);
}
assert.equal((chineseMenu.match(/class="card-action"/g) || []).length, 2, "Chinese menu must show two page-specific menu buttons");

const factualPages = [
  "/zh-hant/",
  "/zh-hant/menu/",
  "/zh-hant/contact/",
  "/zh-hant/restaurant-info/",
  "/zh-hant/ayce-hot-pot-calgary/",
];
for (const route of factualPages) {
  const html = await readFile(fileForRoute(route), "utf8");
  for (const fact of ["(403) 455-3188", "2213 Centre St N #2243", "$28.99", "$5.99"]) {
    assert.ok(html.includes(fact), `${route} is missing shared fact: ${fact}`);
  }
  assert.ok(html.includes("https://centrestjhotpot.ca/#restaurant"), `${route} must use the shared Restaurant entity`);
}

const adsHtml = await readFile(fileForRoute("/google-ads-ayce-hot-pot/"), "utf8");
assert.ok(adsHtml.includes('content="noindex, follow"'), "Google Ads landing page must remain noindex, follow");
assert.equal([...pairs.values()].includes("/zh-hant/google-ads-ayce-hot-pot/"), false, "Ads page must not have a Chinese pair");
assert.doesNotMatch(adsHtml, /[\u3400-\u9fff]/u, "Google Ads landing page must be English-only");

const posterPages = new Map([
  ["/", ["#homepage-ayce-image", "#personal-menu-image", "#beef-noodle-story-image"]],
  ["/ayce-hot-pot-calgary/", ["#ayce-poster"]],
  ["/menu/", ["#combo-poster", "#hotpot-menu-poster", "#drink-menu-poster"]],
  ["/zh-hant/", ["#homepage-ayce-image", "#personal-menu-image", "#beef-noodle-story-image"]],
  ["/zh-hant/ayce-hot-pot-calgary/", ["#localized-menu-poster"]],
  ["/google-ads-ayce-hot-pot/", ["#ads-ayce-menu-poster"]],
]);
for (const [route, targets] of posterPages) {
  const html = await readFile(fileForRoute(route), "utf8");
  for (const target of targets) {
    assert.ok(html.includes(`href="${target}"`), `${route} is missing poster trigger ${target}`);
    assert.ok(html.includes(`id="${target.slice(1)}"`), `${route} is missing poster modal ${target}`);
  }
}

const aycePosterRoutes = [
  "/",
  "/ayce-hot-pot-calgary/",
  "/first-time-hot-pot-calgary/",
  "/google-ads-ayce-hot-pot/",
  "/zh-hant/",
  "/zh-hant/ayce-hot-pot-calgary/",
];
const legacyAycePoster = /ayce-hotpot(?:-menu|-preview|-360|-480|-720)?\.webp/u;
for (const route of aycePosterRoutes) {
  const html = await readFile(fileForRoute(route), "utf8");
  assert.match(
    html,
    /ayce-menu-2026-08-(?:24-599|25-fast)/u,
    `${route} must use the current AYCE poster`,
  );
  assert.doesNotMatch(html, legacyAycePoster, `${route} still references a legacy AYCE poster`);
}
for (const asset of [
  "ayce-menu-2026-08-24-599-360.webp",
  "ayce-menu-2026-08-24-599-480.webp",
  "ayce-menu-2026-08-24-599-720.webp",
  "ayce-menu-2026-08-24-599.webp",
  "ayce-menu-2026-08-25-fast-360.webp",
  "ayce-menu-2026-08-25-fast-480.webp",
  "ayce-menu-2026-08-25-fast-720.webp",
]) {
  await readFile(path.join(publicDir, "assets", asset));
}
await readFile(path.join(publicDir, "menu", "centre-street-ayce-menu-2026-08.pdf"));

for (const route of ["/", "/ayce-hot-pot-calgary/", "/zh-hant/"]) {
  const html = await readFile(fileForRoute(route), "utf8");
  assert.ok(html.includes("ayce-signature-fried-chicken-2026-08-18"), `${route} must use the current signature fried chicken image`);
  assert.doesNotMatch(html, /ayce-fried-chicken(?:-\d+)?\.webp/u, `${route} still references the old signature fried chicken image`);
}
for (const width of [160, 224, 320, 640]) {
  await readFile(path.join(publicDir, "assets", `ayce-signature-fried-chicken-2026-08-18-${width}.webp`));
}

const sitemap = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");
const llms = await readFile(path.join(publicDir, "llms.txt"), "utf8");
assert.doesNotMatch(llms, /[税稅]/u, "llms.txt must not contain Chinese tax characters");
for (const [enRoute, zhRoute] of pairs) {
  for (const route of [enRoute, zhRoute]) {
    assert.ok(sitemap.includes(`<loc>${absolute(route)}</loc>`), `sitemap is missing ${route}`);
  }
  assert.ok(sitemap.includes(`hreflang="en-CA" href="${absolute(enRoute)}"`), `sitemap is missing the English alternate for ${enRoute}`);
  assert.ok(sitemap.includes(`hreflang="zh-Hant-CA" href="${absolute(zhRoute)}"`), `sitemap is missing the Chinese alternate for ${enRoute}`);
}
for (const route of ["/zh-hant/", "/zh-hant/menu/", "/zh-hant/faq/", "/zh-hant/contact/", "/zh-hant/restaurant-info/", "/zh-hant/ayce-hot-pot-calgary/"]) {
  assert.ok(llms.includes(absolute(route)), `llms.txt is missing ${route}`);
}

for (const route of ["/facebook-auth/", "/google-business-auth/", "/instagram-auth/", "/threads-auth/"]) {
  const html = await readFile(fileForRoute(route), "utf8");
  assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*nofollow/i, `${route} must remain noindex, nofollow`);
}

const homeSchema = textValue(englishHome, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
for (const required of ["WebSite", "Restaurant", "鼎鑽火鍋", '"menu"', "dish-spicy.webp"]) {
  assert.ok(homeSchema.includes(required), `English homepage schema is missing ${required}`);
}
const chineseFaq = await readFile(fileForRoute("/zh-hant/faq/"), "utf8");
assert.equal((chineseFaq.match(/"@type":"FAQPage"/g) || []).length, 1, "Chinese FAQ must not duplicate its FAQPage entity");

console.log(`Bilingual checks passed for ${pairs.size} English/Traditional Chinese route pairs.`);
