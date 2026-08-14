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
  const activeLabel = language === "en" ? "EN" : "繁中";
  assert.match(html, new RegExp(`class="language-option is-active"[^>]*>${activeLabel}<`), `${route} has the wrong active language`);
  assert.ok(html.includes("/language-routes.js"), `${route} must load the shared language route manifest`);
  assert.ok(html.includes("+14034553188"), `${route} must preserve the reservation phone`);
  assert.ok(textValue(html, /<title>([\s\S]*?)<\/title>/i), `${route} is missing a title`);
  assert.ok(attribute(html, /<meta\b[^>]*name=["']description["'][^>]*>/i, "content"), `${route} is missing a description`);
}

for (const [enRoute, zhRoute] of pairs) {
  const [enHtml, zhHtml] = await Promise.all([
    readFile(fileForRoute(enRoute), "utf8"),
    readFile(fileForRoute(zhRoute), "utf8"),
  ]);
  const pair = { en: enRoute, zhHant: zhRoute };
  validateDocument(enHtml, enRoute, "en", pair);
  validateDocument(zhHtml, zhRoute, "zh-Hant", pair);
}

const factualPages = [
  "/zh-hant/",
  "/zh-hant/menu/",
  "/zh-hant/contact/",
  "/zh-hant/restaurant-info/",
  "/zh-hant/ayce-hot-pot-calgary/",
];
for (const route of factualPages) {
  const html = await readFile(fileForRoute(route), "utf8");
  for (const fact of ["(403) 455-3188", "2213 Centre St N #2243", "$28.99", "1.5", "$3.99"]) {
    assert.ok(html.includes(fact), `${route} is missing shared fact: ${fact}`);
  }
  assert.ok(html.includes("https://centrestjhotpot.ca/#restaurant"), `${route} must use the shared Restaurant entity`);
}

const adsHtml = await readFile(fileForRoute("/google-ads-ayce-hot-pot/"), "utf8");
assert.ok(adsHtml.includes('content="noindex, follow"'), "Google Ads landing page must remain noindex, follow");
assert.equal([...pairs.values()].includes("/zh-hant/google-ads-ayce-hot-pot/"), false, "Ads page must not have a Chinese pair");

const sitemap = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");
const llms = await readFile(path.join(publicDir, "llms.txt"), "utf8");
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

console.log(`Bilingual checks passed for ${pairs.size} English/Traditional Chinese route pairs.`);
