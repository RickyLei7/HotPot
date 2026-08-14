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
      ...(data.path === "/zh-hant/" ? { hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "鼎鑽火鍋用餐選擇",
        itemListElement: [
          { "@type": "Offer", name: "個人火鍋", price: "19.99", priceCurrency: "CAD", description: "包含 15 款湯底任選一款、一份大份菜盤、一份肉和一份主食。" },
          { "@type": "Offer", name: "火鍋自助", price: "28.99", priceCurrency: "CAD", description: "包含鍋底，肉品由服務員協助下單。" },
          { "@type": "Offer", name: "19 款小吃任點升級", price: "3.99", priceCurrency: "CAD", description: "每位加價，同桌客人必須一起升級。" },
        ],
      } } : {}),
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

const homeMeals = [
  ["braised-pork-rice", "台式滷肉飯", "$12.99", "香濃滷肉配白飯"],
  ["fried-chicken-rice-noodle", "台式鹽酥雞或雞排飯麵", "$14.99", "酥脆鹽酥雞或雞排搭配白飯或麵"],
  ["wonton-rice-noodle", "雲吞湯飯或麵", "$14.99", "暖心雲吞湯搭配白飯或麵"],
  ["unagi-rice", "日式蒲燒鰻魚飯", "$18.99", "蒲燒鰻魚配熱白飯"],
  ["beef-brisket-rice", "紅燒牛腩飯", "$16.99", "軟嫩入味的紅燒牛腩配白飯"],
  ["sukiyaki-beef-rice", "日式壽喜燒牛肉飯", "$16.99", "香甜壽喜燒牛肉配白飯"],
];

const homeDrinks = [
  ["經典茶飲", "$4.95"], ["調味紅茶或綠茶", "$5.95"], ["奶茶系列", "$5.95"],
  ["海鹽奶蓋系列", "$6.95"], ["特調茶飲", "$5.95"], ["優格飲品", "$5.95"],
  ["冰沙系列", "$7.95"], ["特調氣泡飲", "$6.95"], ["汽水", "$2.00"],
];

function renderSocialLinks() {
  return `<div class="social-links" aria-label="社群平台連結"><a class="social-link social-instagram" href="https://www.instagram.com/centrestreetjapanesehotpot/" target="_blank" rel="noreferrer"><span class="social-icon" aria-hidden="true">◎</span><span>Instagram</span></a><a class="social-link social-facebook" href="https://www.facebook.com/CentreStreetJapaneseHotPot" target="_blank" rel="noreferrer"><span class="social-icon" aria-hidden="true">f</span><span>Facebook</span></a><a class="social-link social-threads" href="https://www.threads.com/@centrestreetjapanesehotpot" target="_blank" rel="noreferrer"><span class="social-icon" aria-hidden="true">@</span><span>Threads</span></a><a class="social-link social-tiktok" href="https://www.tiktok.com/@stjapanesehotpot" target="_blank" rel="noreferrer"><span class="social-icon" aria-hidden="true">♪</span><span>TikTok</span></a><a class="social-link social-red" href="https://www.xiaohongshu.com/user/profile/65408e340000000030030828" target="_blank" rel="noreferrer"><span class="social-icon" aria-hidden="true">XHS</span><span>小紅書</span></a></div>`;
}

function renderHomePage(data) {
  const snackCards = [
    ["招牌台式鹽酥雞", "/assets/ayce-fried-chicken-320.webp", "/assets/ayce-fried-chicken-224.webp 224w, /assets/ayce-fried-chicken-320.webp 320w, /assets/ayce-fried-chicken-640.webp 640w", true],
    ["章魚小丸子", "/assets/ayce-takoyaki-320.webp", "/assets/ayce-takoyaki-224.webp 224w, /assets/ayce-takoyaki-320.webp 320w, /assets/ayce-takoyaki-640.webp 640w", false],
    ["香酥雞排", "/assets/ayce-snacks/crispy-chicken-cutlet-320.webp", "", false],
    ["黃金炸饅頭", "/assets/ayce-snacks/golden-fried-buns-320.webp", "", false],
    ["酥炸魷魚鬚", "/assets/ayce-snacks/crispy-squid-legs-320.webp", "", false],
  ];
  const story = data.featureStory;
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
    <meta property="og:image" content="${origin}/assets/ayce-hotpot.webp" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preload" as="image" href="/assets/ayce-hotpot.webp" />
    <link rel="stylesheet" href="/site.css?v=20260813-snack-ratio" />
    <script defer src="/language-routes.js?v=20260813-bilingual"></script>
    <script defer src="/site-events.js?v=20260813-bilingual"></script>
    <script type="application/ld+json">${jsonLd(data)}</script>
  </head>
  <body>
    ${renderNav(data)}
    <main>
      <section id="ayce" class="homepage-ayce"><div class="homepage-ayce-copy"><p class="eyebrow">卡加利火鍋自助</p><h1>$28.99 火鍋自助</h1><p class="homepage-lead">15 款湯底自由選擇，AAA 牛肉、羊肉、豬肉或雞肉由服務員協助新鮮下單。</p><p>鍋底已包含在價格內，適合家庭聚餐、朋友相聚與多人用餐。</p><div class="hero-actions"><a class="primary-action" href="tel:+14034553188">致電預訂火鍋自助</a><a class="secondary-action" href="/zh-hant/ayce-hot-pot-calgary/">查看火鍋自助詳情</a></div></div><div class="homepage-ayce-media"><img src="/assets/ayce-hotpot.webp" alt="鼎鑽火鍋火鍋自助" width="1024" height="1536" fetchpriority="high" decoding="async" /><span>15 款湯底</span></div></section>
      <section class="ayce-snack-feature" aria-labelledby="snack-title"><div class="section-heading compact"><p class="eyebrow">火鍋自助加點選擇</p><h2 id="snack-title">+$3.99 升級 19 款小吃任點</h2><p>先吃招牌台式鹽酥雞，再選章魚小丸子、香酥雞排、黃金炸饅頭、酥炸魷魚鬚等小吃。</p></div><div class="snack-showcase">${snackCards.map(([name, src, srcset, featured]) => `<article class="snack-card${featured ? " is-featured" : ""}"><img src="${src}"${srcset ? ` srcset="${srcset}"` : ""} sizes="${featured ? "(max-width: 760px) 88vw, 420px" : "(max-width: 760px) 44vw, 220px"}" alt="${name}" width="320" height="220" loading="lazy" decoding="async" /><h3>${name}</h3></article>`).join("")}</div><p class="snack-rule"><strong>小吃任點升級每位 +$3.99，同桌客人必須一起升級。</strong> 沒有升級小吃任點也可以按菜單單點各款小吃。</p><a class="text-action" href="/zh-hant/menu/">查看完整菜單</a></section>
      <section id="personal-hot-pot" class="personal-value"><div class="personal-value-copy"><p class="eyebrow">完整一餐超值選擇</p><h2>$19.99 個人火鍋</h2><p class="homepage-lead">$19.99 包含 15 款湯底任選一款、一份大份菜盤、一份肉和一份主食。</p><div class="inclusion-grid"><article><span>1</span><p>15 款湯底任選一款</p></article><article><span>2</span><p>一份大份菜盤</p></article><article><span>3</span><p>一份肉可選 AAA 牛肉 羊肉 豬肉或雞肉</p></article><article><span>4</span><p>一份主食可選白飯或麵</p></article></div><p class="split-pot-note">想同時吃兩款湯底，可加 $2 升級鴛鴦鍋。</p><small>另有 $24.99 單人套餐配一杯飲料，以及 $58.99 雙人套餐配兩杯飲料和一份小吃。</small><div class="hero-actions"><a class="primary-action" href="/zh-hant/menu/">查看個人火鍋菜單</a></div></div><div class="soup-preview-strip"><img src="/assets/soup-lineup.webp" alt="鼎鑽火鍋 15 款湯底" width="1400" height="839" loading="lazy" decoding="async" /></div></section>
      <section id="beef-noodle" class="beef-noodle-feature"><div class="beef-noodle-feature-media"><img src="${story.image}" srcset="/assets/taiwanese-beef-noodle-story-360.webp 360w, /assets/taiwanese-beef-noodle-story-480.webp 480w, /assets/taiwanese-beef-noodle-story-720.webp 720w" sizes="(max-width: 760px) 88vw, 520px" alt="${escapeHtml(story.imageAlt)}" width="1122" height="1402" loading="lazy" decoding="async" /></div><div class="beef-noodle-feature-copy"><p class="eyebrow">讓人想起家的經典味道</p><h2>招牌台式紅燒牛肉麵</h2><strong class="menu-price">$16.99</strong><h3>${escapeHtml(story.title)}</h3>${story.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph.replaceAll("「", "").replaceAll("」", ""))}</p>`).join("")}</div></section>
      <section id="light-meals" class="light-meals-section"><div class="section-heading compact"><p class="eyebrow">不只火鍋</p><h2>台式招牌飯麵</h2><p>想吃得快速簡單，也有暖胃又有飽足感的台式飯麵選擇。</p></div><div class="light-meal-grid">${homeMeals.map(([slug, name, price, description]) => `<article class="light-meal-card"><img src="/assets/light-meals/${slug}-640.webp" srcset="/assets/light-meals/${slug}-320.webp 320w, /assets/light-meals/${slug}-640.webp 640w" sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 30vw" alt="鼎鑽火鍋${name}" width="640" height="440" loading="lazy" decoding="async" /><div><h3>${name}</h3><strong>${price}</strong><p>${description}</p></div></article>`).join("")}</div><a class="primary-action" href="/zh-hant/menu/">查看完整菜單</a></section>
      <section id="drinks" class="drink-feature"><div class="drink-feature-copy"><p class="eyebrow">茶飲 奶茶與特色飲品</p><h2>每桌都能找到喜歡的飲料</h2><p>甜度和冰量都可以選擇，茶飲與奶茶也可以做熱飲。</p><strong class="drink-discount">任點火鍋或招牌餐點 飲料可享九折優惠</strong><div class="drink-category-grid">${homeDrinks.map(([name, price]) => `<p><span>${name}</span><strong>${price}</strong></p>`).join("")}</div></div><img src="/assets/milk-tea-photo-640.webp" srcset="/assets/milk-tea-photo-320.webp 320w, /assets/milk-tea-photo-640.webp 640w, /assets/milk-tea-photo.webp 900w" sizes="(max-width: 760px) 74vw, 380px" alt="鼎鑽火鍋奶茶與特色飲品" width="900" height="1200" loading="lazy" decoding="async" /></section>
      <section id="visit" class="homepage-visit"><div class="section-heading compact"><p class="eyebrow">到店用餐</p><h2>位於卡加利 Centre Street</h2></div><div class="visit-grid"><article><h3>營業時間</h3><p>週一至週五 5:00 PM-10:30 PM</p><p>週六及週日 12:00 PM-10:30 PM</p></article><article><h3>預訂座位</h3><p>訂位、團體聚餐或想確認今天座位，歡迎直接致電。</p><a href="tel:+14034553188">致電 (403) 455-3188</a></article><article><h3>Google 地圖導航</h3><p>2213 Centre St N #2243, Calgary, AB T2E 2T4</p><a href="https://www.google.com/maps/dir/?api=1&amp;destination=2213+Centre+St+N+%232243%2C+Calgary%2C+AB+T2E+2T4" target="_blank" rel="noreferrer">Google 地圖導航</a></article><article><h3>讓更多卡加利客人找到我們</h3><p>用餐後歡迎在 Google 分享你的體驗。</p><a href="https://www.google.com/maps/place/Centre+Street+Japanese+Hotpot/@51.072234,-114.0656247,17z" target="_blank" rel="noreferrer">前往 Google 留下評論</a></article></div><div class="social-follow"><div><p class="eyebrow">追蹤我們</p><h3>看看新菜品 店內消息與日常分享</h3></div>${renderSocialLinks()}</div></section>
    </main>
    <a class="reserve-sticky" href="tel:+14034553188">致電訂位 · (403) 455-3188</a>
  </body>
</html>
`;
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

for (const [key, data] of Object.entries(pages)) {
  const directory = path.join(root, "public", data.path.slice(1));
  await mkdir(directory, { recursive: true });
  const html = (key === "home" ? renderHomePage(data) : renderPage(data)).replace(/[ \t]+$/gm, "");
  await writeFile(path.join(directory, "index.html"), html);
}

console.log(`Built ${Object.keys(pages).length} Traditional Chinese pages.`);
