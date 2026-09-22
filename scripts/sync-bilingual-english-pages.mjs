import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const origin = "https://centrestjhotpot.ca";
const routePairs = new Map([
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
    ? path.join(root, "public", "index.html")
    : path.join(root, "public", route.slice(1), "index.html");
}

for (const [englishRoute, zhHantRoute] of routePairs) {
  const file = fileForRoute(englishRoute);
  let html = await readFile(file, "utf8");
  html = html.replace(/<html lang="en">/, '<html lang="en-CA">');

  if (!html.includes('hreflang="zh-Hant-CA"')) {
    const alternates = [
      `    <link rel="alternate" hreflang="en-CA" href="${origin}${englishRoute}" />`,
      `    <link rel="alternate" hreflang="zh-Hant-CA" href="${origin}${zhHantRoute}" />`,
      `    <link rel="alternate" hreflang="x-default" href="${origin}${englishRoute}" />`,
    ].join("\n");
    html = html.replace(/(\s*<link rel="canonical"[^>]+>)/, `$1\n${alternates}`);
  }

  if (!html.includes('property="og:locale"')) {
    html = html.replace(
      /(\s*<meta property="og:type"[^>]+>)/,
      `$1\n    <meta property="og:locale" content="en_CA" />\n    <meta property="og:locale:alternate" content="zh_CA" />`,
    );
  }

  if (!html.includes("/language-routes.js")) {
    html = html.replace(
      /(\s*<script defer src="\/site-events\.js[^>]*><\/script>)/,
      `\n    <script defer src="/language-routes.js?v=20260813-bilingual"></script>$1`,
    );
  }
  html = html.replaceAll(">繁中<", ">中文<");
  html = html.replaceAll('aria-hidden="true">小</span>小紅書', 'aria-hidden="true">XHS</span>Xiaohongshu');
  html = html.replace(/\/site\.css\?v=[^" ]+/, "/site.css?v=20260922-mobile-fix");

  if (!html.includes('class="language-switch"')) {
    const switcher = `<div class="language-switch" aria-label="Switch website language"><a class="language-option is-active" aria-current="page" hreflang="en-CA" lang="en-CA" href="${englishRoute}">EN</a><a class="language-option" hreflang="zh-Hant-CA" lang="zh-Hant" href="${zhHantRoute}">中文</a></div>`;
    html = html.replace(/(<a class="nav-call")/, `${switcher}$1`);
  }

  if (!html.includes('class="nav-actions"')) {
    html = html.replace(
      /<a class="nav-call"([^>]*)>Book Online<\/a>/,
      '<div class="nav-actions"><a class="nav-call nav-book"$1>Book Online</a></div>',
    );
  }
  html = html.replace(/<a class="nav-call nav-phone"[^>]*>Call<\/a>/, "");

  if (!html.includes('class="reserve-sticky reserve-sticky-phone"')) {
    html = html.replace(
      /<a class="reserve-sticky"([^>]*)>Book Online<\/a>/,
      '<a class="reserve-sticky reserve-sticky-book"$1>Book Online</a><a class="reserve-sticky reserve-sticky-phone" href="tel:+14034553188" aria-label="Call (403) 455-3188">Call</a>',
    );
  }

  if (englishRoute === "/" && !html.includes('class="secondary-action" href="tel:+14034553188"')) {
    html = html.replace(
      /(<a class="primary-action" href="https:\/\/reservation\.centrestjhotpot\.ca\/book"[^>]*>Book Online<\/a>)/,
      '$1<a class="secondary-action" href="tel:+14034553188">Call (403) 455-3188</a>',
    );
  }

  const englishOnlyHtml = html
    .replaceAll(">中文<", "><")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  if (/[\u3400-\u9fff]/u.test(englishOnlyHtml)) {
    throw new Error(`${englishRoute} contains Chinese text outside the language switch`);
  }

  if (englishRoute === "/") {
    for (const id of ["ayce", "personal-hot-pot", "beef-noodle", "light-meals", "drinks", "visit"]) {
      if (!html.includes(`id="${id}"`)) throw new Error(`English homepage lost #${id}`);
    }
  }

  await writeFile(file, html);
}

console.log(`Updated ${routePairs.size} English pages with bilingual navigation and metadata.`);
