import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const origin = "https://centrestjhotpot.ca";
const pages = JSON.parse(await readFile(path.join(root, "app", "zh-hant", "page-data.json"), "utf8"));

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function jsonLd(data) {
  const pageEntity = {
    "@type": data.schemaType,
    "@id": `${origin}${data.path}#webpage`,
    url: `${origin}${data.path}`,
    name: data.title,
    description: data.description,
    inLanguage: "zh-Hant",
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#restaurant` },
  };
  if (data.schemaType === "Article") {
    pageEntity.headline = data.h1;
    pageEntity.datePublished = "2026-08-13";
    pageEntity.dateModified = "2026-08-13";
    pageEntity.author = { "@id": `${origin}/#restaurant` };
    pageEntity.publisher = { "@id": `${origin}/#restaurant` };
  }

  const graph = [
    pageEntity,
    {
      "@type": "Restaurant",
      "@id": `${origin}/#restaurant`,
      name: "Centre Street Japanese HotPot",
      alternateName: ["鼎鑽火鍋", "Centre Street Japanese Hotpot"],
      url: `${origin}/`,
      inLanguage: ["en-CA", "zh-Hant"],
      telephone: "+1-403-455-3188",
      email: "CentreStJHotpot@gmail.com",
      image: `${origin}/assets/ayce-hotpot-menu-preview.webp`,
      servesCuisine: ["台式火鍋", "日式風格火鍋", "一人一鍋", "台式小吃", "奶茶"],
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "2213 Centre St N #2243",
        addressLocality: "Calgary",
        addressRegion: "AB",
        postalCode: "T2E 2T4",
        addressCountry: "CA",
      },
      geo: { "@type": "GeoCoordinates", latitude: 51.0722307, longitude: -114.0630498 },
      hasMenu: `${origin}/zh-hant/menu/`,
      acceptsReservations: true,
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "17:00", closes: "22:30" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "12:00", closes: "22:30" },
      ],
      sameAs: [
        "https://www.instagram.com/centrestreetjapanesehotpot/",
        "https://www.facebook.com/CentreStreetJapaneseHotPot",
        "https://www.threads.com/@centrestreetjapanesehotpot",
        "https://www.tiktok.com/@stjapanesehotpot",
        "https://www.xiaohongshu.com/user/profile/65408e340000000030030828",
      ],
    },
  ];

  if (data.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${origin}${data.path}#faq`,
      inLanguage: "zh-Hant",
      mainEntity: data.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
}

function renderNav(data) {
  const links = [
    ["首頁", "/zh-hant/"],
    ["火鍋自助", "/zh-hant/ayce-hot-pot-calgary/"],
    ["菜單", "/zh-hant/menu/"],
  ];
  return `<nav class="site-nav" aria-label="主要導覽">
      <a class="brand-mark" href="/zh-hant/" aria-label="鼎鑽火鍋首頁"><img src="/assets/brand-logo-wide-300.webp" srcset="/assets/brand-logo-wide-300.webp 300w, /assets/brand-logo-wide-480.webp 480w, /assets/brand-logo-wide.webp 600w" sizes="(max-width: 760px) 34vw, 260px" alt="Centre Street Japanese HotPot 鼎鑽火鍋" width="600" height="184" /></a>
      <div class="nav-links">${links.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}<details class="nav-more"><summary>更多</summary><div class="nav-more-links"><a href="/zh-hant/about/">關於我們</a><a href="/zh-hant/faq/">常見問題</a><a href="/zh-hant/contact/">聯絡與地址</a><a href="/zh-hant/#visit">到店資訊</a></div></details></div>
      <div class="language-switch" aria-label="切換網站語言"><a class="language-option" hreflang="en-CA" lang="en-CA" href="${data.englishPath}">EN</a><a class="language-option is-active" aria-current="page" hreflang="zh-Hant-CA" lang="zh-Hant" href="${data.path}">中文</a></div>
      <a class="nav-call" href="tel:+14034553188">訂位</a>
    </nav>`;
}

function renderActions(actions) {
  return actions.map((action) => {
    const external = action.href.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
    return `<a class="${action.style}" href="${escapeHtml(action.href)}"${external}>${escapeHtml(action.label)}</a>`;
  }).join("");
}

function renderPage(data) {
  const sections = data.sections.map((section, index) => `<section class="content-section localized-section${index % 2 ? " is-dark" : ""}">
      <div class="section-heading compact"><p class="eyebrow">${escapeHtml(section.eyebrow)}</p><h2>${escapeHtml(section.title)}</h2></div>
      <div class="localized-copy">${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      ${section.actions?.length ? `<div class="menu-download-actions localized-section-actions">${renderActions(section.actions)}</div>\n      ` : ""}${section.cards?.length ? `<div class="recommendation-grid localized-card-grid">${section.cards.map((card) => `<article><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p>${card.href && card.actionLabel ? `<a class="card-action" href="${escapeHtml(card.href)}" target="_blank" rel="noreferrer">${escapeHtml(card.actionLabel)}</a>` : ""}</article>`).join("")}</div>` : ""}
    </section>`).join("\n");
  const faqSection = data.faqs.length ? `<section class="content-section localized-faq" id="faq"><div class="section-heading compact"><p class="eyebrow">常見問題</p><h2>快速找到用餐前需要的答案</h2></div><div class="faq-list">${data.faqs.map((faq) => `<article><h2>${escapeHtml(faq.question)}</h2><p>${escapeHtml(faq.answer)}</p></article>`).join("")}</div></section>` : "";
  const featureStory = data.featureStory ? `<section class="beef-noodle-story" aria-label="台灣傳統牛肉麵故事"><div class="beef-noodle-story-media"><img src="${escapeHtml(data.featureStory.image)}" alt="${escapeHtml(data.featureStory.imageAlt)}" width="1122" height="1402" loading="lazy" decoding="async" /></div><div class="beef-noodle-story-copy"><p class="eyebrow">${escapeHtml(data.featureStory.eyebrow)}</p><h2>${escapeHtml(data.featureStory.title)}</h2><div class="story-language">${data.featureStory.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div></div></section>` : "";

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(data.title)}</title>
    <meta name="description" content="${escapeHtml(data.description)}" />
    <link rel="canonical" href="${origin}${data.path}" />
    <link rel="alternate" hreflang="en-CA" href="${origin}${data.englishPath}" />
    <link rel="alternate" hreflang="zh-Hant-CA" href="${origin}${data.path}" />
    <link rel="alternate" hreflang="x-default" href="${origin}${data.englishPath}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CA" />
    <meta property="og:locale:alternate" content="en_CA" />
    <meta property="og:title" content="${escapeHtml(data.title)}" />
    <meta property="og:description" content="${escapeHtml(data.description)}" />
    <meta property="og:url" content="${origin}${data.path}" />
    <meta property="og:image" content="${origin}${data.image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="stylesheet" href="/site.css?v=20260813-bilingual" />
    <script defer src="/language-routes.js?v=20260813-bilingual"></script>
    <script defer src="/site-events.js?v=20260813-bilingual"></script>
    <script type="application/ld+json">${jsonLd(data)}</script>
  </head>
  <body>
    ${renderNav(data)}
    <main>
      <section class="localized-hero">
        <div class="localized-hero-copy"><p class="eyebrow">${escapeHtml(data.eyebrow)}</p><h1>${escapeHtml(data.h1)}</h1><p class="hero-text">${escapeHtml(data.lead)}</p><div class="hero-actions">${renderActions(data.actions)}</div></div>
        <div class="localized-hero-media"><img src="${data.image}" alt="${escapeHtml(data.imageAlt)}" width="900" height="675" fetchpriority="high" decoding="async" /></div>
      </section>
      <section class="quick-info" aria-label="餐廳重點">${data.facts.map((fact) => `<div><span>${escapeHtml(fact.value)}</span>${escapeHtml(fact.label)}</div>`).join("")}</section>
      ${sections}${featureStory ? `\n      ${featureStory}` : ""}
      ${faqSection}
      <section class="localized-visit" id="visit"><div><p class="eyebrow">到店用餐</p><h2>2213 Centre St N #2243, Calgary</h2><p>週一至週五 17:00-22:30｜週六、週日 12:00-22:30</p></div><div class="hero-actions"><a class="primary-action" href="tel:+14034553188">致電 (403) 455-3188 訂位</a><a class="secondary-action" href="https://www.google.com/maps/dir/?api=1&amp;destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4" target="_blank" rel="noreferrer">Google 地圖導航</a></div></section>
    </main>
    <a class="reserve-sticky" href="tel:+14034553188">致電訂位 · (403) 455-3188</a>
  </body>
</html>
`;
}

for (const data of Object.values(pages)) {
  const directory = path.join(root, "public", data.path.slice(1));
  await mkdir(directory, { recursive: true });
  const html = renderPage(data).replace(/[ \t]+$/gm, "");
  await writeFile(path.join(directory, "index.html"), html);
}

console.log(`Built ${Object.keys(pages).length} Traditional Chinese pages.`);
