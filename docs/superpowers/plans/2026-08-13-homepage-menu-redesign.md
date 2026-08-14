# Bilingual Homepage Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the English and Traditional Chinese homepages into a conversion-focused six-section menu experience led by $28.99 AYCE and the complete $19.99 personal hot pot.

**Architecture:** Keep the existing Next/Vinext source and GitHub Pages static output in sync. Add a focused bilingual homepage content module and shared React renderer, generate real dish crops from the approved menu image, mirror the final markup into `public/`, and strengthen the existing bilingual validation so stale prices or missing sections fail before deployment.

**Tech Stack:** Next.js 16, React 19, TypeScript, JSON content data, CSS, Sharp, static HTML, Node validation scripts, Playwright visual checks, GitHub Pages.

## Global Constraints

- The same six-part structure must exist in English and Traditional Chinese.
- Section order is AYCE and +$3.99 snack upgrade, $19.99 personal hot pot, $16.99 beef noodle soup, six light meals, drinks, then visit and reserve.
- $19.99 includes one of 15 soup bases, one large vegetable set, one meat, and one rice or noodle side.
- $24.99 solo and $58.99 couple combos remain valid but appear only as secondary text below the $19.99 offer.
- AYCE is $28.99; the 19-snack upgrade is +$3.99 per person and the same table must upgrade together.
- Signature Taiwanese Fried Chicken is the featured AYCE snack.
- Every light meal must have a real crop from `public/menu/drink-menu.jpg`; do not fabricate food photography.
- Preserve the beef noodle story in both languages.
- Do not show the Chinese character `稅` in prominent Chinese copy.
- Do not add decorative punctuation to large Chinese headings.
- Keep the sticky header, mobile phone CTA, language switch, menu links, directions, social links, schema, and analytics.
- Keep `app/` source and `public/` deployment output synchronized.
- Do not add dependencies.

---

### Task 1: Add Failing Homepage Content Regression Checks

**Files:**
- Modify: `scripts/check-bilingual-site.mjs`

**Interfaces:**
- Consumes: generated English HTML at `public/index.html` and Traditional Chinese HTML at `public/zh-hant/index.html`.
- Produces: `validateHomepageMenuStructure(enHtml: string, zhHtml: string): void`, called from the existing bilingual validation run.

- [ ] **Step 1: Add exact section, price, image, and ordering assertions**

Add a validator that requires stable section IDs and verifies their order:

```js
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

  const lightMealSlugs = ["braised-pork-rice", "fried-chicken-rice-noodle", "wonton-rice-noodle", "unagi-rice", "beef-brisket-rice", "sukiyaki-beef-rice"];
  for (const slug of lightMealSlugs) {
    assert.match(enHtml, new RegExp(`/assets/light-meals/${slug}-640\\.webp`));
    assert.match(zhHtml, new RegExp(`/assets/light-meals/${slug}-640\\.webp`));
  }
}
```

Call it after both home files have been read. Keep existing punctuation, language parity, metadata, and route checks.

- [ ] **Step 2: Run the check and confirm it fails for the current homepage**

Run: `node scripts/check-bilingual-site.mjs`

Expected: FAIL because `personal-hot-pot`, `light-meals`, and the required dish images do not exist yet.

- [ ] **Step 3: Commit the failing regression check**

```bash
git add scripts/check-bilingual-site.mjs
git commit -m "Test bilingual homepage menu structure"
```

---

### Task 2: Generate Light Meal and Supporting Snack Crops

**Files:**
- Create: `scripts/generate-homepage-menu-crops.mjs`
- Create: `public/assets/light-meals/braised-pork-rice-320.webp`
- Create: `public/assets/light-meals/braised-pork-rice-640.webp`
- Create: `public/assets/light-meals/fried-chicken-rice-noodle-320.webp`
- Create: `public/assets/light-meals/fried-chicken-rice-noodle-640.webp`
- Create: `public/assets/light-meals/wonton-rice-noodle-320.webp`
- Create: `public/assets/light-meals/wonton-rice-noodle-640.webp`
- Create: `public/assets/light-meals/unagi-rice-320.webp`
- Create: `public/assets/light-meals/unagi-rice-640.webp`
- Create: `public/assets/light-meals/beef-brisket-rice-320.webp`
- Create: `public/assets/light-meals/beef-brisket-rice-640.webp`
- Create: `public/assets/light-meals/sukiyaki-beef-rice-320.webp`
- Create: `public/assets/light-meals/sukiyaki-beef-rice-640.webp`
- Create: `public/assets/ayce-snacks/crispy-chicken-cutlet-320.webp`
- Create: `public/assets/ayce-snacks/golden-fried-buns-320.webp`
- Create: `public/assets/ayce-snacks/crispy-squid-legs-320.webp`

**Interfaces:**
- Consumes: `public/menu/drink-menu.jpg`, `public/menu/hotpot-menu.jpg`, and the repository's available Sharp runtime.
- Produces: deterministic WebP crops at the exact paths above; the homepage consumes the `320` and `640` light-meal variants and `320` supporting-snack variants.

- [ ] **Step 1: Create a deterministic crop script**

Use Sharp and crop the menu photography, not the item text. Define the source-space crop map explicitly:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const riceMenu = path.join(root, "public/menu/drink-menu.jpg");
const hotpotMenu = path.join(root, "public/menu/hotpot-menu.jpg");

const lightMeals = [
  ["braised-pork-rice", 474, 295, 222, 145],
  ["fried-chicken-rice-noodle", 704, 295, 222, 145],
  ["wonton-rice-noodle", 934, 295, 222, 145],
  ["unagi-rice", 474, 576, 222, 145],
  ["beef-brisket-rice", 704, 576, 222, 145],
  ["sukiyaki-beef-rice", 934, 576, 222, 145],
];

const snacks = [
  ["crispy-chicken-cutlet", 527, 1376, 194, 130],
  ["golden-fried-buns", 730, 1376, 194, 130],
  ["crispy-squid-legs", 936, 1376, 194, 130],
];
```

For each light meal, extract the rectangle, resize with `fit: "cover"` to `320x220` and `640x440`, and save WebP at quality 86. For each snack, resize to `320x220`. Ensure output directories are created with `fs.mkdir({ recursive: true })`.

- [ ] **Step 2: Run the crop generator**

Run: `node scripts/generate-homepage-menu-crops.mjs`

Expected: all 15 files are written without changing either source JPG.

- [ ] **Step 3: Validate dimensions and visually inspect a contact sheet**

Run:

```bash
sips -g pixelWidth -g pixelHeight public/assets/light-meals/*.webp public/assets/ayce-snacks/*.webp
```

Expected: light meal files are `320x220` or `640x440`; snack files are `320x220`.

Open all generated crops with the image viewer. Reject any crop that includes menu text, the wrong dish, or cuts off the main food. Adjust only the source-space rectangle for the incorrect item and rerun.

- [ ] **Step 4: Commit the crop generator and approved assets**

```bash
git add scripts/generate-homepage-menu-crops.mjs public/assets/light-meals public/assets/ayce-snacks
git commit -m "Add homepage menu dish crops"
```

---

### Task 3: Build the Shared Bilingual React Homepage

**Files:**
- Create: `app/homepage-content.ts`
- Create: `app/homepage-menu.tsx`
- Modify: `app/page.tsx`
- Modify: `app/zh-hant/page.tsx`
- Modify: `app/zh-hant/page-data.json`

**Interfaces:**
- Consumes: generated image paths from Task 2 and existing `SiteNav`, `SocialLinks`, phone, map, and menu routes.
- Produces: `HomepageMenu({ language }: { language: "en" | "zh-Hant" }): JSX.Element`, `homepageContent.en`, `homepageContent.zhHant`, and current homepage metadata/schema values.

- [ ] **Step 1: Define typed bilingual content**

Create these types and export one content object per language:

```ts
export type HomepageLanguage = "en" | "zh-Hant";
export type MealCard = { slug: string; name: string; price: string; description: string; alt: string };
export type HomepageContent = {
  ayce: { eyebrow: string; title: string; lead: string; snackTitle: string; snackRule: string };
  personal: { eyebrow: string; title: string; lead: string; inclusions: string[]; comboNote: string };
  beefNoodle: { eyebrow: string; title: string; price: string; paragraphs: string[] };
  lightMeals: { eyebrow: string; title: string; lead: string; items: MealCard[] };
  drinks: { eyebrow: string; title: string; lead: string; discount: string; categories: Array<{ name: string; price: string }> };
  visit: { eyebrow: string; title: string; hours: string[]; reserve: string; directions: string };
};
```

Populate both languages with the exact prices and inclusions from the approved design. English must use natural Calgary-facing copy. Traditional Chinese must use Traditional Chinese and must not include `稅` in display copy.

- [ ] **Step 2: Create the shared six-section renderer**

Implement:

```tsx
export function HomepageMenu({ language }: { language: HomepageLanguage }) {
  const content = homepageContent[language === "en" ? "en" : "zhHant"];
  const isZh = language === "zh-Hant";
  return <main>
    <SiteNav currentPath={isZh ? "/zh-hant/" : "/"} language={language} />
    <section id="ayce" className="homepage-ayce"><h1>{content.ayce.title}</h1><p>{content.ayce.lead}</p><h2>{content.ayce.snackTitle}</h2><p>{content.ayce.snackRule}</p></section>
    <section id="personal-hot-pot" className="personal-value"><h2>{content.personal.title}</h2><p>{content.personal.lead}</p><div className="inclusion-grid">{content.personal.inclusions.map((item) => <article key={item}>{item}</article>)}</div><small>{content.personal.comboNote}</small></section>
    <section id="beef-noodle" className="beef-noodle-feature"><h2>{content.beefNoodle.title}</h2><strong>{content.beefNoodle.price}</strong>{content.beefNoodle.paragraphs.map((text) => <p key={text}>{text}</p>)}</section>
    <section id="light-meals"><h2>{content.lightMeals.title}</h2><p>{content.lightMeals.lead}</p><div className="light-meal-grid">{content.lightMeals.items.map((meal) => <article className="light-meal-card" key={meal.slug}><img src={`/assets/light-meals/${meal.slug}-640.webp`} alt={meal.alt} /><h3>{meal.name}</h3><strong>{meal.price}</strong><p>{meal.description}</p></article>)}</div></section>
    <section id="drinks" className="drink-feature"><h2>{content.drinks.title}</h2><p>{content.drinks.lead}</p><strong>{content.drinks.discount}</strong>{content.drinks.categories.map((drink) => <p key={drink.name}>{drink.name} {drink.price}</p>)}</section>
    <section id="visit" className="homepage-visit"><h2>{content.visit.title}</h2>{content.visit.hours.map((hours) => <p key={hours}>{hours}</p>)}</section>
  </main>;
}
```

Required stable IDs are `ayce`, `personal-hot-pot`, `beef-noodle`, `light-meals`, `drinks`, and `visit`. Use accessible HTML text for every price and inclusion. Use existing `ayce-fried-chicken` and `ayce-takoyaki` responsive assets plus the supporting snack crops. Use `dish-beef-noodle.webp` or the existing optimized beef noodle story image. Render all six light meals with `srcSet` using their `320` and `640` crops. Keep phone, full-menu, AYCE details, language switch, directions, social, and review actions.

- [ ] **Step 3: Update English and Traditional Chinese route wrappers**

Replace the body of `app/page.tsx` with the shared component while preserving current Restaurant JSON-LD. Add the base personal hot pot offer before the combo offers:

```ts
{
  "@type": "Offer",
  name: "Personal Hot Pot",
  price: "19.99",
  priceCurrency: "CAD",
  description: "Includes one of 15 soup bases, one large vegetable set, one meat, and one rice or noodle side."
}
```

Keep $24.99 and $58.99 as secondary offers. Update `app/zh-hant/page.tsx` to render `<HomepageMenu language="zh-Hant" />` and keep `makeZhMetadata(zhPages.home)`. Update the `home` metadata and facts in `page-data.json` so $19.99 is present and $24.99 is not described as the base personal hot pot.

- [ ] **Step 4: Build and type-check the React source**

Run: `npm run build`

Expected: build succeeds; `/` and `/zh-hant` remain listed; no missing image import or TypeScript error.

- [ ] **Step 5: Commit the React source**

```bash
git add app/homepage-content.ts app/homepage-menu.tsx app/page.tsx app/zh-hant/page.tsx app/zh-hant/page-data.json
git commit -m "Rebuild bilingual menu-led homepage"
```

---

### Task 4: Add Responsive Homepage Presentation

**Files:**
- Modify: `app/globals.css`
- Modify: `public/site.css`

**Interfaces:**
- Consumes: class names emitted by `HomepageMenu`: `.homepage-ayce`, `.ayce-snack-feature`, `.personal-value`, `.inclusion-grid`, `.soup-preview-strip`, `.beef-noodle-feature`, `.light-meal-grid`, `.light-meal-card`, `.drink-feature`, and `.homepage-visit`.
- Produces: matching source and deployed CSS with desktop, tablet, and 390px layouts.

- [ ] **Step 1: Add desktop section and card styles to both CSS files**

Use the existing black, red, cream, and gold variables. Implement:

```css
.homepage-ayce,
.personal-value,
.beef-noodle-feature,
.drink-feature { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr); }
.inclusion-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.light-meal-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.light-meal-card img { aspect-ratio: 16 / 11; object-fit: cover; width: 100%; }
```

Add section-specific spacing, color alternation, readable cards, large price treatment, focus styles, and button placement using existing variables and action classes.

- [ ] **Step 2: Add tablet and mobile behavior**

At `max-width: 1100px`, change two-column feature sections to one column and the light meal grid to two columns. At `max-width: 560px`, keep the light meal grid at two columns only if names remain readable; otherwise use one column. Keep all images bounded, preserve `overflow-x: clip`, and leave the sticky header and bottom phone CTA behavior unchanged.

- [ ] **Step 3: Run formatting and build checks**

Run:

```bash
git diff --check
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit synchronized CSS**

```bash
git add app/globals.css public/site.css
git commit -m "Style bilingual menu-led homepage"
```

---

### Task 5: Synchronize Static English and Traditional Chinese Homepages

**Files:**
- Modify: `public/index.html`
- Modify: `public/zh-hant/index.html`
- Modify: `scripts/build-zh-hant-pages.mjs`
- Modify: `scripts/sync-bilingual-english-pages.mjs`

**Interfaces:**
- Consumes: the exact content, section IDs, image paths, actions, and schema values from Tasks 2 and 3.
- Produces: GitHub Pages HTML that matches the React source and survives future bilingual regeneration.

- [ ] **Step 1: Update the Traditional Chinese static builder's home rendering**

Add a `renderHomePage(data)` branch for `key === "home"` in `build-zh-hant-pages.mjs`. It must emit the six stable section IDs, use the generated crops, preserve `renderNav`, tracking scripts, canonical/alternate metadata, and output `public/zh-hant/index.html`. Other Traditional Chinese routes continue using the existing generic renderer.

- [ ] **Step 2: Update the English static homepage**

Mirror the React English structure in `public/index.html`. Update Restaurant `OfferCatalog` with the $19.99 Personal Hot Pot offer, retain the $24.99 and $58.99 combo offers, preserve canonical metadata, analytics scripts, social links, and the mobile phone CTA.

- [ ] **Step 3: Protect the redesigned English homepage in the sync script**

Keep `sync-bilingual-english-pages.mjs` limited to language navigation and metadata replacement. Add an assertion that it does not remove any of the six homepage IDs:

```js
for (const id of ["ayce", "personal-hot-pot", "beef-noodle", "light-meals", "drinks", "visit"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`English homepage lost #${id}`);
}
```

- [ ] **Step 4: Generate Chinese output and run the bilingual test**

Run:

```bash
node scripts/build-zh-hant-pages.mjs
node scripts/check-bilingual-site.mjs
```

Expected: both exit 0; the Task 1 test now passes.

- [ ] **Step 5: Validate static HTML and attribution**

Run:

```bash
npm run check:html
npm run check:attribution
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit static output and generation scripts**

```bash
git add public/index.html public/zh-hant/index.html scripts/build-zh-hant-pages.mjs scripts/sync-bilingual-english-pages.mjs
git commit -m "Publish bilingual menu-led homepage output"
```

---

### Task 6: Rendered QA, Deployment, and Live Verification

**Files:**
- Modify: `scripts/visual-check.mjs`
- Test only: all files from Tasks 1-5

**Interfaces:**
- Consumes: completed local source and static output.
- Produces: browser evidence, passing repository checks, a pushed `main` commit set, a successful GitHub Pages workflow, and verified live English and Traditional Chinese homepages.

- [ ] **Step 1: Add homepage-specific visual assertions**

For `/` and `/zh-hant/`, assert each stable section is visible in DOM order, all light-meal images load, and the header remains at viewport top after scrolling:

```js
const navTopAfterScroll = await page.evaluate(() => {
  scrollTo(0, 900);
  return document.querySelector(".site-nav")?.getBoundingClientRect().top;
});
if (Math.abs(navTopAfterScroll ?? 999) > 1) routeFailures.push("sticky header left viewport top");
```

- [ ] **Step 2: Run complete automated checks**

Run:

```bash
npm run build
node scripts/check-bilingual-site.mjs
npm run check:html
npm run check:attribution
npm run check:visual
git diff --check
```

Expected: all exit 0 and visual output reports `"ok": true` with no failures.

- [ ] **Step 3: Perform Browser desktop QA**

Test flow: `/` loads -> scroll AYCE to personal hot pot, beef noodle, light meals, drinks, and visit -> open the full menu -> return -> switch to Traditional Chinese -> verify the same section order.

At `1440x900`, verify:

- Header remains at top after scrolling
- $28.99 and $19.99 are visible and not confused
- Salt-and-pepper chicken is the featured AYCE snack
- Six light meal images are correct and evenly cropped
- No horizontal overflow or relevant console errors

- [ ] **Step 4: Perform Browser mobile QA**

At `390x844`, repeat the flow. Verify dish names and prices do not collide, images do not crop the food incorrectly, buttons remain tappable, the sticky phone CTA does not cover content, language switching works, and no horizontal overflow or relevant console errors appears.

- [ ] **Step 5: Commit the visual assertions**

```bash
git add scripts/visual-check.mjs
git commit -m "Verify redesigned homepage interactions"
```

- [ ] **Step 6: Push and verify deployment**

Run:

```bash
git push origin main
```

Wait for `.github/workflows/pages.yml` to complete successfully. Verify `https://centrestjhotpot.ca/` and `https://centrestjhotpot.ca/zh-hant/` independently. Confirm live HTML contains all six IDs, live CSS is current, all 15 generated crops return 200, and desktop/mobile Browser checks still pass after CDN propagation.
