# English and Traditional Chinese SEO/GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch paired English and Traditional Chinese versions of all indexed restaurant pages with current-page language switching, correct multilingual SEO/GEO markup, and language-aware conversion analytics.

**Architecture:** Existing English URLs remain canonical at the domain root. A route manifest maps every indexed English path to an equivalent `/zh-hant/` path; shared navigation and tracking use this manifest, while static `public/` pages remain the GitHub Pages production output and `app/` contains matching Next/Vinext source routes. Reciprocal metadata, sitemap alternates, translated structured data, and language-specific AI facts make each page independently crawlable and citable.

**Tech Stack:** Static HTML/CSS/JavaScript, Next/Vinext React source, JSON-LD, XML sitemap, Node.js validation scripts, Playwright, Lighthouse, GA4 and Google Ads gtag.

## Global Constraints

- Use English and Traditional Chinese only; do not introduce Simplified Chinese or Japanese pages.
- Keep every existing English URL, Google Ads final URL, phone number, address, menu fact, analytics ID, and conversion ID unchanged.
- Keep `/google-ads-ayce-hot-pot/` English and `noindex, follow`.
- Use `/zh-hant/` for Traditional Chinese and reciprocal `en-CA`, `zh-Hant-CA`, and `x-default` links.
- Do not auto-redirect by IP, browser language, or cookies.
- Keep the language control directly visible at 390px and 1440px.
- Synchronize matching `app/` and `public/` surfaces.
- Stage only bilingual website files; preserve unrelated dirty worktree files.

---

### Task 1: Route Manifest and Failing Multilingual SEO Test

**Files:**
- Create: `public/language-routes.js`
- Create: `scripts/check-bilingual-site.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `window.HOTPOT_LANGUAGE_ROUTES`, an object mapping normalized English paths to Traditional Chinese paths.
- Produces: `npm run check:bilingual`, which validates route pairs, metadata, navigation, facts, and the Ads noindex exception.

- [ ] **Step 1: Define the route manifest**

```js
window.HOTPOT_LANGUAGE_ROUTES = {
  "/": "/zh-hant/",
  "/about/": "/zh-hant/about/",
  "/menu/": "/zh-hant/menu/",
  "/faq/": "/zh-hant/faq/",
  "/contact/": "/zh-hant/contact/",
  "/restaurant-info/": "/zh-hant/restaurant-info/",
  "/calgary-hot-pot-guide/": "/zh-hant/calgary-hot-pot-guide/",
  "/calgary-taiwanese-hot-pot/": "/zh-hant/calgary-taiwanese-hot-pot/",
  "/first-time-hot-pot-calgary/": "/zh-hant/first-time-hot-pot-calgary/",
  "/ayce-hot-pot-calgary/": "/zh-hant/ayce-hot-pot-calgary/"
};
```

- [ ] **Step 2: Write the bilingual validator**

The validator must assert for every pair:

```js
assert.equal(enDocument.lang, "en-CA");
assert.equal(zhDocument.lang, "zh-Hant");
assert.equal(enCanonical, absolute(enPath));
assert.equal(zhCanonical, absolute(zhPath));
assert.equal(enAlternates["zh-Hant-CA"], absolute(zhPath));
assert.equal(zhAlternates["en-CA"], absolute(enPath));
assert.equal(enAlternates["x-default"], absolute(enPath));
assert.equal(zhAlternates["x-default"], absolute(enPath));
assert.equal(enH1Count, 1);
assert.equal(zhH1Count, 1);
assert.ok(enHtml.includes('class="language-switch"'));
assert.ok(zhHtml.includes('class="language-switch"'));
```

Also assert shared phone, address, AYCE price, hours, Restaurant `@id`, and that the Ads page contains `noindex, follow` and is absent from the route manifest.

- [ ] **Step 3: Add the npm command**

```json
"check:bilingual": "node scripts/check-bilingual-site.mjs"
```

- [ ] **Step 4: Run the test and confirm it fails before implementation**

Run: `npm run check:bilingual`

Expected: FAIL because the `/zh-hant/` pages and reciprocal metadata do not exist.

---

### Task 2: Shared Language Navigation and Analytics

**Files:**
- Create: `app/language-routes.ts`
- Modify: `app/site-nav.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `public/site.css`
- Modify: `public/site-events.js`
- Modify: every indexed English file under `public/`

**Interfaces:**
- Produces: `LanguageCode = "en" | "zh-Hant"` and `languagePair(pathname)`.
- Produces: `.language-switch`, `.language-option`, and `.is-active` styles.
- Produces: GA4 `language_switch` plus `site_language` on existing events.

- [ ] **Step 1: Add typed route helpers**

```ts
export type LanguageCode = "en" | "zh-Hant";
export function languagePair(pathname: string): { en: string; zhHant: string };
```

- [ ] **Step 2: Extend `SiteNav`**

```tsx
<div className="language-switch" aria-label={language === "zh-Hant" ? "切換網站語言" : "Switch website language"}>
  <Link className={language === "en" ? "language-option is-active" : "language-option"} aria-current={language === "en" ? "page" : undefined} href={pair.en}>EN</Link>
  <Link className={language === "zh-Hant" ? "language-option is-active" : "language-option"} aria-current={language === "zh-Hant" ? "page" : undefined} href={pair.zhHant}>繁中</Link>
</div>
```

- [ ] **Step 3: Add responsive styles**

The control must stay one line, use a 44px minimum height, show an explicit active state, and fit with the logo and Reserve button at 390px without horizontal overflow.

- [ ] **Step 4: Add static language controls to English pages**

Load `/language-routes.js`, link the current English page to its exact Chinese pair, and mark `EN` active.

- [ ] **Step 5: Add language-aware analytics**

```js
function pageLanguage() {
  return document.documentElement.lang === "zh-Hant" ? "zh-Hant" : "en";
}
```

Add `site_language` and `page_language` to `sendEvent`. On `.language-option` click, emit `language_switch` with `from_language`, `to_language`, `source_path`, and `destination_path`.

- [ ] **Step 6: Run existing attribution and HTML tests**

Run: `npm run check:attribution && npm run check:html`

Expected: PASS.

---

### Task 3: Core Traditional Chinese Guest Pages

**Files:**
- Create: `app/zh-hant/layout.tsx`
- Create: `app/zh-hant/site-nav-zh.tsx`
- Create: `app/zh-hant/page.tsx`
- Create: `app/zh-hant/about/page.tsx`
- Create: `app/zh-hant/menu/page.tsx`
- Create: `app/zh-hant/faq/page.tsx`
- Create: `app/zh-hant/contact/page.tsx`
- Create: `public/zh-hant/index.html`
- Create: `public/zh-hant/about/index.html`
- Create: `public/zh-hant/menu/index.html`
- Create: `public/zh-hant/faq/index.html`
- Create: `public/zh-hant/contact/index.html`

**Interfaces:**
- Consumes: route mapping and language-control styles from Tasks 1-2.
- Produces: five complete, crawlable core guest journeys in Traditional Chinese.

- [ ] **Step 1: Add the Traditional Chinese layout and navigation**

Navigation labels: `首頁`, `火鍋自助`, `菜單`, `更多`, `關於我們`, `常見問題`, `聯絡與地址`, `到店資訊`, `訂位`.

- [ ] **Step 2: Build the Chinese home page**

The first viewport must state `卡加利火鍋自助 $28.99 + 稅`, `15 款湯底`, phone reservation, and link to the Chinese AYCE and menu pages. Preserve the existing AYCE-first visual hierarchy and current factual terms.

- [ ] **Step 3: Build the Chinese menu page**

Include readable HTML sections for AYCE,套餐、湯底、肉品海鮮、飯麵、小吃、奶茶與飲品, plus the shared menu PDF links and images.

- [ ] **Step 4: Build Chinese About, FAQ, and Contact pages**

Use Traditional Chinese throughout. Include the exact address, phone, hours, directions, reservation guidance, AYCE terms, group dining, individual hot pot, Taiwanese and Japanese-style positioning, and Chinese name.

- [ ] **Step 5: Add matching Next/Vinext metadata**

Each route exports a translated title, description, canonical, alternates, Open Graph URL, and the relevant translated schema.

- [ ] **Step 6: Run the bilingual validator**

Run: `npm run check:bilingual`

Expected: still FAIL only for the five untranslated guide/fact route pairs.

---

### Task 4: Traditional Chinese GEO and Guide Pages

**Files:**
- Create: `app/zh-hant/restaurant-info/page.tsx`
- Create: `app/zh-hant/calgary-hot-pot-guide/page.tsx`
- Create: `app/zh-hant/calgary-taiwanese-hot-pot/page.tsx`
- Create: `app/zh-hant/first-time-hot-pot-calgary/page.tsx`
- Create: `app/zh-hant/ayce-hot-pot-calgary/page.tsx`
- Create: matching five `public/zh-hant/**/index.html` files

**Interfaces:**
- Produces: Chinese citation targets for restaurant facts, Calgary hot pot recommendations, Taiwanese hot pot, first-time guidance, and AYCE.

- [ ] **Step 1: Build the Chinese Restaurant Info page**

Use concise fact-first sections for name, type, address, phone, hours, pricing, AYCE terms, menu, good-for scenarios, directions, and reservations. Add `WebPage` and shared `Restaurant` JSON-LD with `inLanguage: "zh-Hant"`.

- [ ] **Step 2: Build the Chinese Calgary hot pot guide**

Answer who the restaurant suits, individual pot format, broth choice, AYCE versus sets, group dining, location, and reservation questions without unsupported ranking claims.

- [ ] **Step 3: Build the focused Taiwanese hot pot page**

Use `卡加利台式火鍋`, `台灣火鍋 卡加利`, `卡加利一人一鍋`, and `鼎鑽火鍋` naturally in headings and answers, not as a keyword list.

- [ ] **Step 4: Build first-time and AYCE pages**

Translate ordering guidance and every current AYCE term: `$28.99 + 稅`, soup base included, server-ordered meats, 1.5-hour limit, optional 19-snack upgrade `+$3.99/人`, all guests at the same table must upgrade, and kids pricing by height.

- [ ] **Step 5: Add Article and FAQ schema**

Use `inLanguage: "zh-Hant"`, translated questions and answers, shared restaurant publisher/entity IDs, and self-canonical page URLs.

- [ ] **Step 6: Run the bilingual validator**

Run: `npm run check:bilingual`

Expected: PASS for all 10 route pairs.

---

### Task 5: Reciprocal English Metadata and Language Cleanup

**Files:**
- Modify: all 10 indexed English files under `app/`
- Modify: all 10 indexed English files under `public/`

**Interfaces:**
- Consumes: all completed Chinese URLs.
- Produces: reciprocal metadata and primarily English indexed pages.

- [ ] **Step 1: Set deployed English documents to `lang="en-CA"`**

- [ ] **Step 2: Add reciprocal alternates**

For each pair add `en-CA`, `zh-Hant-CA`, and `x-default` links in HTML and Next metadata.

- [ ] **Step 3: Remove long mixed-language duplication from English content**

Keep `鼎鑽火鍋` as an alternate brand name and retain proper dish names where useful, but move long Chinese explanations and duplicated FAQs to the Chinese equivalents.

- [ ] **Step 4: Verify English internal links remain English**

Language switching is the only route from English navigation to `/zh-hant/`.

- [ ] **Step 5: Run HTML and bilingual checks**

Run: `npm run check:html && npm run check:bilingual`

Expected: PASS.

---

### Task 6: Sitemap, llms.txt, Schema and Search Discovery

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `public/llms.txt`
- Modify: `public/robots.txt` only if the sitemap reference needs correction

**Interfaces:**
- Produces: 20 indexed URLs with reciprocal sitemap alternates and explicit bilingual AI citation targets.

- [ ] **Step 1: Add the XHTML namespace and language alternates to the sitemap**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
```

Each URL entry includes all three alternates: `en-CA`, `zh-Hant-CA`, and `x-default`.

- [ ] **Step 2: Add Traditional Chinese citation targets to `llms.txt`**

Link directly to Chinese home, menu, AYCE, FAQ, contact, restaurant information, Taiwanese hot pot guide, and first-time guide. State the same current facts as the English sections.

- [ ] **Step 3: Validate factual parity**

Search both languages for the exact phone, address, hours, AYCE price, snack upgrade, time limit, soup bases, and kids pricing.

- [ ] **Step 4: Run the full metadata suite**

Run: `npm run check:bilingual && npm run check:attribution && npm run check:html`

Expected: PASS.

---

### Task 7: Responsive, Accessibility and Performance Verification

**Files:**
- Modify: `scripts/visual-check.mjs`
- Modify: `lighthouserc.cjs`

**Interfaces:**
- Produces: bilingual mobile/desktop screenshot coverage and Lighthouse coverage for core Chinese entry pages.

- [ ] **Step 1: Add all 10 Chinese URLs to Playwright coverage**

Check 390x844 and 1440x1000. Verify language control visibility, current-page switch target, sticky reserve behaviour, no overflow, no broken images, and no console errors.

- [ ] **Step 2: Add Chinese home, menu, AYCE, contact, and restaurant-info to Lighthouse**

Keep performance minimum `0.75`, accessibility minimum `0.85`, and SEO minimum `0.90`.

- [ ] **Step 3: Run all tests**

```bash
npm run check:bilingual
npm run check:attribution
npm run check:html
npm run lint
npm run build
npm run check:visual
npm run check:lighthouse
git diff --check
```

Expected: zero errors. Existing `<img>` lint warnings may remain if Lighthouse and responsive image checks pass.

- [ ] **Step 4: Inspect representative full-page screenshots**

Inspect English and Chinese home, menu, AYCE, and contact at mobile and desktop sizes. Confirm Chinese text is not clipped and language controls are visible.

---

### Task 8: Isolated Commit, Deploy and Live Verification

**Files:**
- Stage only files listed in Tasks 1-7 and the design/plan documents.

**Interfaces:**
- Produces: live bilingual production website on `https://centrestjhotpot.ca/`.

- [ ] **Step 1: Review the staged file list and diff**

Run: `git diff --cached --check && git diff --cached --name-only`

Expected: no unrelated publisher, Ads API, marketing draft, package dependency, backup, or generated social files.

- [ ] **Step 2: Commit and push**

```bash
git commit -m "Launch English and Traditional Chinese site"
git push origin main
```

- [ ] **Step 3: Wait for GitHub Pages success**

Confirm the Actions run for the new commit has `status=completed` and `conclusion=success`.

- [ ] **Step 4: Bypass stale CDN cache and verify live HTML**

Check English and Chinese home, menu, AYCE, contact, restaurant-info, `site-events.js`, `sitemap.xml`, and `llms.txt`. Verify language links, canonical, hreflang, schema language, GA4 language fields, and latest content.

- [ ] **Step 5: Run live mobile browser checks**

At 390px, verify HTTP 200, no horizontal overflow, no broken images, exact-page language switching, and a working phone CTA.

- [ ] **Step 6: Search Console follow-up**

Submit `https://centrestjhotpot.ca/sitemap.xml` and request indexing first for `/zh-hant/`, `/zh-hant/menu/`, `/zh-hant/ayce-hot-pot-calgary/`, `/zh-hant/contact/`, and `/zh-hant/restaurant-info/`. Do not request indexing for the Ads page.
