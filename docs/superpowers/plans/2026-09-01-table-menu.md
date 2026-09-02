# Centre Street Japanese HotPot Table Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and release a mobile-first, bilingual, photo-rich, view-only table menu at `/table-menu/`, then regenerate the one restaurant-wide QR card to open it.

**Architecture:** Keep all bilingual menu facts in one JSON source, validate it with Node tests, render the same semantic markup into both the maintainable app route and the deployed static `public/` route, and use a small route-specific JavaScript file for language switching, search, filters, and item details. Generate optimized WebP images and QR print assets with reproducible scripts; deploy only the isolated table-menu commit set after mobile and production verification.

**Tech Stack:** Node.js 22.13+, React 19 / Next-compatible `app/` source, static HTML/CSS/JavaScript under `public/`, Node test runner, Playwright, Sharp, `qrcode`, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-01-table-menu-design.md`

## Global Constraints

- Production route is exactly `https://centrestjhotpot.ca/table-menu/`.
- The same QR code and menu are used at every table; do not add table-number state.
- English is the initial language; the upper-right switch changes the complete interface to Traditional Chinese matching the supplied artwork and existing `zh-Hant` site convention.
- The menu is view-only: no cart, quantity picker, checkout, payment, order form, or order-submission control.
- Show `View-only menu — please order with your server.` and `此菜单仅供浏览，请向服务员点单。` prominently and repeat the active-language message near the bottom.
- Featured order is exactly `AYCE → AYCE For Two → Personal Hot Pot → Solo / Couple Combo → Current Beer Special`.
- Use the approved hybrid presentation: large featured cards and two-column standard item cards.
- Use the approved in-place navigation: featured landing content, bilingual search, and persistent category filters with no category-page back navigation.
- Every visible item must resolve to a real image; first-release reference images are allowed and must carry the bilingual image disclaimer.
- Menu data and image paths must be independently replaceable.
- The deployed site is the committed `public/` tree; application source and generated production output must stay synchronized.
- Do not add a database, account system, server API, ordering backend, or new client framework.
- Preserve all unrelated user changes. Execute in a clean worktree from `main`, on branch `codex/table-menu`, using `superpowers:using-git-worktrees`; cherry-pick only the approved design and plan commits before implementation.
- Stage exact paths for every commit. Never stage the dirty source workspace wholesale.

## File Structure

### New source and test files

- `content/table-menu/menu.json` — one bilingual source of truth for settings, categories, promotions, rules, and menu items.
- `content/table-menu/image-manifest.json` — maps every item ID to an approved local source image and crop focus.
- `scripts/lib/table-menu-data.mjs` — schema validation, flattening, lookup, and image-path helpers.
- `scripts/lib/table-menu-renderer.mjs` — pure escaping, semantic markup, metadata, and Menu JSON-LD rendering.
- `scripts/lib/table-menu-renderer.d.mts` — TypeScript declarations for the renderer imported by the app route.
- `scripts/build-table-menu-images.mjs` — validates source images and emits `320` and `640` pixel WebP derivatives.
- `scripts/build-table-menu.mjs` — validates JSON and writes the production static HTML route.
- `scripts/check-table-menu.mjs` — focused Playwright verification and mobile screenshots.
- `app/table-menu/page.tsx` — maintainable app route using the shared data and renderer.
- `public/table-menu/table-menu.css` — mobile-first layout and component states.
- `public/table-menu/table-menu.js` — language, category, search, dialog, and analytics behavior.
- `public/table-menu/index.html` — generated production page; never hand-edit after the generator exists.
- `public/assets/table-menu/*-320.webp` and `public/assets/table-menu/*-640.webp` — optimized menu images.
- `marketing/scripts/generate-table-menu-qr-card.mjs` — reproducible 4 × 6 inch QR HTML, PNG, and PDF generator.
- `tests/table-menu-data.test.mjs` — schema and exact business-rule regression tests.
- `tests/table-menu-renderer.test.mjs` — markup, escaping, featured order, and no-ordering regression tests.
- `tests/table-menu-images.test.mjs` — manifest coverage and generated image integrity tests.

### Existing files to modify

- `package.json` — add focused build/check/QR scripts and declare Sharp directly.
- `scripts/check-price-consistency.mjs` — include `content/` so source-of-truth prices are checked.
- `public/sitemap.xml` — add the canonical table-menu route.
- `marketing/qr-cards/table-menu-qr-card-4x6.html` — generated editable card source.
- `marketing/qr-cards/table-menu-qr-card-4x6.png` — generated print raster.
- `marketing/qr-cards/table-menu-qr-card-4x6.pdf` — generated print PDF.
- `marketing/qr-card-usage-guide.md` — document the final URL, one-code-for-all-tables rule, and physical scan checklist.

## Execution Preflight

Before Task 1, read the spec completely and create an isolated worktree with `superpowers:using-git-worktrees`. Start from current `main`, create `codex/table-menu`, and cherry-pick the design commit `d7fb872` plus the implementation-plan commit containing this file. Copy only the six user-supplied menu sources and the selected image inputs needed by `image-manifest.json`; do not copy the dirty repository state.

Run these read-only checks in the worktree:

```bash
git status --short
node --version
npm --version
```

Expected: clean worktree; Node version satisfies `>=22.13.0`.

---

### Task 1: Establish the validated bilingual menu source

**Files:**
- Create: `content/table-menu/menu.json`
- Create: `scripts/lib/table-menu-data.mjs`
- Create: `tests/table-menu-data.test.mjs`
- Modify: `scripts/check-price-consistency.mjs`

**Interfaces:**
- Consumes: the six approved menu files listed in the spec.
- Produces: `validateMenu(menu): void`, `flattenMenuItems(menu): Array<MenuItem>`, `getItemById(menu, id): MenuItem`, and `imagePathsFor(item): { small: string, large: string }`.

- [ ] **Step 1: Write the failing data-contract tests**

Create `tests/table-menu-data.test.mjs` with these concrete checks:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  flattenMenuItems,
  getItemById,
  imagePathsFor,
  validateMenu,
} from "../scripts/lib/table-menu-data.mjs";

const menu = JSON.parse(await readFile(new URL(
  "../content/table-menu/menu.json",
  import.meta.url,
), "utf8"));

test("menu source is valid", () => {
  assert.doesNotThrow(() => validateMenu(menu));
});

test("featured promotions have the approved order", () => {
  assert.deepEqual(menu.featuredOrder, [
    "ayce-individual",
    "ayce-for-two",
    "personal-hot-pot",
    "solo-couple-combo",
    "beer-special",
  ]);
});

test("latest high-risk prices and quantities are locked", () => {
  assert.equal(getItemById(menu, "ayce-individual").price, "28.99");
  assert.equal(getItemById(menu, "ayce-snack-upgrade").price, "5.99");
  assert.equal(getItemById(menu, "ayce-child-100-140").price, "12.99");
  assert.equal(getItemById(menu, "personal-hot-pot").price, "19.99");
  assert.equal(getItemById(menu, "solo-hot-pot-combo").price, "24.99");
  assert.equal(getItemById(menu, "couple-hot-pot-combo").price, "58.99");
  assert.equal(getItemById(menu, "veggie-spring-rolls").serving.en, "5 pcs");
  assert.equal(getItemById(menu, "veggie-spring-rolls").price, "8.89");
});

test("every active item has bilingual copy and image derivatives", () => {
  for (const item of flattenMenuItems(menu).filter((entry) => entry.available)) {
    assert.ok(item.name.en.trim(), `${item.id} missing English name`);
    assert.ok(item.name.zh.trim(), `${item.id} missing Chinese name`);
    assert.match(item.imageId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    assert.deepEqual(imagePathsFor(item), {
      small: `/assets/table-menu/${item.imageId}-320.webp`,
      large: `/assets/table-menu/${item.imageId}-640.webp`,
    });
  }
});

test("view-only bilingual notices are exact", () => {
  assert.equal(menu.notices.order.en, "View-only menu — please order with your server.");
  assert.equal(menu.notices.order.zh, "此菜单仅供浏览，请向服务员点单。");
});
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run:

```bash
node --test tests/table-menu-data.test.mjs
```

Expected: FAIL because `scripts/lib/table-menu-data.mjs` and `content/table-menu/menu.json` do not exist.

- [ ] **Step 3: Implement the schema helpers**

Create `scripts/lib/table-menu-data.mjs`. `validateMenu` must reject duplicate IDs, duplicate category IDs, missing `en`/`zh` names, missing prices where `priceRequired` is true, unknown featured IDs, unknown category references, missing `imageId`, invalid image IDs, and any language/default mismatch. Implement `imagePathsFor` exactly as asserted above and make `getItemById` throw `Unknown table-menu item: <id>`.

The exported shape is:

```js
export function flattenMenuItems(menu) {
  return menu.items.flatMap((item) => item.variants?.length
    ? item.variants.map((variant) => ({ ...item, ...variant, parentId: item.id }))
    : [item]);
}

export function imagePathsFor(item) {
  return {
    small: `/assets/table-menu/${item.imageId}-320.webp`,
    large: `/assets/table-menu/${item.imageId}-640.webp`,
  };
}
```

- [ ] **Step 4: Transcribe the complete menu into one JSON source**

Create `content/table-menu/menu.json` with this top-level contract:

```json
{
  "version": "2026-09-01",
  "currency": "CAD",
  "defaultLanguage": "en",
  "languages": ["en", "zh"],
  "notices": {
    "order": {
      "en": "View-only menu — please order with your server.",
      "zh": "此菜单仅供浏览，请向服务员点单。"
    },
    "images": {
      "en": "Images are for reference only. Actual presentation may vary.",
      "zh": "图片仅供参考，实际出品可能略有不同。"
    }
  },
  "featuredOrder": [
    "ayce-individual",
    "ayce-for-two",
    "personal-hot-pot",
    "solo-couple-combo",
    "beer-special"
  ],
  "categories": [],
  "items": []
}
```

Use category IDs `featured`, `personal-hot-pot`, `ayce`, `combos`, `appetizers`, `rice-noodles`, `drinks`, `beer`, and `add-ons`, in that order. Transcribe every leaf choice from the approved source menus, including all 15 soups, four meats, sides, add-ons, 19 appetizers, seven rice/noodle dishes, every named drink flavour/base/topping, and both beers. Preserve source quantities and prices as strings without currency symbols.

For the specialty-soda line, render the source PDF at 600 DPI and inspect the original crop. If the exact seven names still cannot be read confidently, stop that transcription step and ask the owner to confirm only that line; do not infer or invent names. Continue all other entries while awaiting the answer.

- [ ] **Step 5: Extend active price checking to the new source directory**

In `scripts/check-price-consistency.mjs`, change:

```js
const activeRoots = ["app", "public", "scripts", "marketing/scripts"];
```

to:

```js
const activeRoots = ["app", "content", "public", "scripts", "marketing/scripts"];
```

- [ ] **Step 6: Run data and price validation**

Run:

```bash
node --test tests/table-menu-data.test.mjs
node scripts/check-price-consistency.mjs
```

Expected: both commands PASS; no retired `$3.99` appetizer-upgrade text; exact high-risk prices match the tests.

- [ ] **Step 7: Commit the validated menu source**

```bash
git add content/table-menu/menu.json scripts/lib/table-menu-data.mjs tests/table-menu-data.test.mjs scripts/check-price-consistency.mjs
git commit -m "Add validated bilingual table menu data"
```

---

### Task 2: Build the replaceable image pipeline and full image catalog

**Files:**
- Create: `content/table-menu/image-manifest.json`
- Create: `scripts/build-table-menu-images.mjs`
- Create: `tests/table-menu-images.test.mjs`
- Create: `public/assets/table-menu/*-320.webp`
- Create: `public/assets/table-menu/*-640.webp`
- Modify: `package.json`

**Interfaces:**
- Consumes: every active menu item's `imageId` and manifest entries `{ imageId, source, position }`.
- Produces: deterministic `/assets/table-menu/<imageId>-320.webp` and `-640.webp` files.

- [ ] **Step 1: Add the failing manifest-coverage test**

Create `tests/table-menu-images.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { flattenMenuItems } from "../scripts/lib/table-menu-data.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const menu = JSON.parse(await readFile(path.join(root, "content/table-menu/menu.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(root, "content/table-menu/image-manifest.json"), "utf8"));

test("manifest covers every active image ID exactly once", () => {
  const expected = [...new Set(flattenMenuItems(menu).filter((item) => item.available).map((item) => item.imageId))].sort();
  const actual = manifest.images.map((entry) => entry.imageId).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length);
});

test("all generated derivatives are valid WebP images", async () => {
  for (const { imageId } of manifest.images) {
    for (const width of [320, 640]) {
      const file = path.join(root, `public/assets/table-menu/${imageId}-${width}.webp`);
      await access(file);
      const metadata = await sharp(file).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.width, width);
      assert.ok(metadata.height > 0);
    }
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
node --test tests/table-menu-images.test.mjs
```

Expected: FAIL because the manifest and derivatives do not exist.

- [ ] **Step 3: Declare the image tool and build commands**

Add a direct current-compatible `sharp` dev dependency and these scripts to `package.json` without disturbing existing scripts:

```json
{
  "scripts": {
    "build:table-menu-images": "node scripts/build-table-menu-images.mjs",
    "build:table-menu": "node scripts/build-table-menu.mjs",
    "check:table-menu": "node scripts/check-table-menu.mjs",
    "generate:table-menu-qr": "node marketing/scripts/generate-table-menu-qr-card.mjs"
  }
}
```

Run `npm install --save-dev sharp` so `package-lock.json` records the direct dependency.

- [ ] **Step 4: Create the explicit image manifest**

Create `content/table-menu/image-manifest.json` with one entry per unique `imageId`:

```json
{
  "images": [
    {
      "imageId": "signature-taiwanese-fried-chicken",
      "source": "delivery-menu-images/ai/signature-taiwanese-fried-chicken.png",
      "position": "center"
    },
    {
      "imageId": "takoyaki",
      "source": "delivery-menu-images/ai/takoyaki.png",
      "position": "center"
    },
    {
      "imageId": "taiwanese-beef-noodle",
      "source": "delivery-menu-images/ai/taiwanese-beef-noodle-soup.png",
      "position": "center"
    }
  ]
}
```

Continue the same exact three-field shape for every unique item image. Reuse an image only where the item is a base/size variant of the same drink or where the approved source artwork itself uses one shared image. Do not silently reuse unrelated food photos.

- [ ] **Step 5: Implement deterministic image generation**

Create `scripts/build-table-menu-images.mjs`. For each manifest entry:

1. resolve `source` under the repository root and reject paths that escape it;
2. fail with `Missing source image for <imageId>: <source>` when absent;
3. auto-rotate based on metadata;
4. resize with `fit: "cover"`, aspect ratio `4:3`, width `320` or `640`, and manifest `position`;
5. encode WebP with `{ quality: 78, effort: 5 }`;
6. write to `public/assets/table-menu/<imageId>-<width>.webp`.

Use this core transform:

```js
await sharp(sourcePath)
  .rotate()
  .resize({ width, height: Math.round(width * 0.75), fit: "cover", position })
  .webp({ quality: 78, effort: 5 })
  .toFile(outputPath);
```

- [ ] **Step 6: Generate and test all menu images**

```bash
npm run build:table-menu-images
node --test tests/table-menu-images.test.mjs
```

Expected: PASS; every active image ID has readable 320 px and 640 px WebP files.

- [ ] **Step 7: Review a contact sheet before committing**

Generate a temporary contact sheet outside tracked paths and inspect every crop. Reject photos with unreadable food, unsafe text cropping, wrong dish identity, or visible generation artifacts. Correct only the affected manifest `source`/`position`, regenerate, and rerun the test.

- [ ] **Step 8: Commit the image pipeline and optimized catalog**

```bash
git add package.json package-lock.json content/table-menu/image-manifest.json scripts/build-table-menu-images.mjs tests/table-menu-images.test.mjs public/assets/table-menu
git commit -m "Add table menu image pipeline"
```

---

### Task 3: Render one semantic menu into app and deployed static routes

**Files:**
- Create: `scripts/lib/table-menu-renderer.mjs`
- Create: `scripts/lib/table-menu-renderer.d.mts`
- Create: `tests/table-menu-renderer.test.mjs`
- Create: `scripts/build-table-menu.mjs`
- Create: `app/table-menu/page.tsx`
- Create: `public/table-menu/index.html`

**Interfaces:**
- Consumes: validated `menu.json` and `imagePathsFor(item)`.
- Produces: `renderTableMenuMarkup(menu): string`, `renderTableMenuJsonLd(menu, canonicalUrl): object`, and a generated static HTML document.

- [ ] **Step 1: Write renderer tests before implementation**

Create `tests/table-menu-renderer.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  escapeHtml,
  renderTableMenuJsonLd,
  renderTableMenuMarkup,
} from "../scripts/lib/table-menu-renderer.mjs";

const menu = JSON.parse(await readFile(new URL(
  "../content/table-menu/menu.json",
  import.meta.url,
), "utf8"));

test("HTML escaping is safe", () => {
  assert.equal(escapeHtml(`<script>&"'`), "&lt;script&gt;&amp;&quot;&#39;");
});

test("rendered menu has required controls and view-only notices", () => {
  const html = renderTableMenuMarkup(menu);
  assert.match(html, /data-table-menu-language="en"/u);
  assert.match(html, /data-table-menu-language="zh"/u);
  assert.match(html, /View-only menu — please order with your server\./u);
  assert.match(html, /此菜单仅供浏览，请向服务员点单。/u);
  assert.match(html, /data-table-menu-search/u);
  assert.match(html, /data-category="appetizers"/u);
  assert.doesNotMatch(html, /add to cart|checkout|quantity|place order|<form\b/iu);
});

test("featured cards are emitted in approved order", () => {
  const html = renderTableMenuMarkup(menu);
  const ids = menu.featuredOrder.map((id) => html.indexOf(`data-featured-id="${id}"`));
  assert.ok(ids.every((index) => index >= 0));
  assert.deepEqual([...ids].sort((a, b) => a - b), ids);
});

test("JSON-LD describes a CAD Menu at the canonical route", () => {
  const jsonLd = renderTableMenuJsonLd(menu, "https://centrestjhotpot.ca/table-menu/");
  assert.equal(jsonLd["@type"], "Menu");
  assert.equal(jsonLd.url, "https://centrestjhotpot.ca/table-menu/");
  assert.match(JSON.stringify(jsonLd), /"priceCurrency":"CAD"/u);
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
node --test tests/table-menu-renderer.test.mjs
```

Expected: FAIL because the renderer does not exist.

- [ ] **Step 3: Implement the pure renderer**

Create `scripts/lib/table-menu-renderer.mjs` with the three tested exports. Render:

- one `<header>` with restaurant name, view-only notice, and two language buttons;
- one search input with bilingual labels stored in `data-en` and `data-zh`;
- one sticky category list in the approved category order;
- one featured section in exact `featuredOrder` order;
- one standard card per active leaf item;
- one native `<dialog>` detail container populated by client JavaScript;
- one repeated footer order notice and image disclaimer.

All untrusted JSON strings must pass through `escapeHtml`. Put both language strings in `data-en` and `data-zh`; put normalized searchable text in `data-search`; put the menu item ID and category in `data-item-id` and `data-category`.

- [ ] **Step 4: Add the renderer declaration file**

Create `scripts/lib/table-menu-renderer.d.mts` declaring `BilingualText`, `MenuItem`, `TableMenu`, and the exact three renderer exports. Do not use `any`; use `unknown` for optional metadata that is not rendered.

- [ ] **Step 5: Create the app route from shared markup**

Create `app/table-menu/page.tsx` with:

- metadata title `Table Menu | Centre Street Japanese HotPot`;
- canonical `/table-menu/`;
- description stating it is a view-only dine-in menu;
- Open Graph image from the AYCE featured asset;
- imported `menu.json`;
- shared `renderTableMenuMarkup` and `renderTableMenuJsonLd` output;
- `<link rel="stylesheet" href="/table-menu/table-menu.css" />`;
- `<script defer src="/table-menu/table-menu.js" />`;
- JSON-LD script and the rendered menu container.

Do not render the standard site reservation sticky control on this route because it competes with the persistent server-order notice.

- [ ] **Step 6: Implement deterministic static generation**

Create `scripts/build-table-menu.mjs` to read and validate `menu.json`, render the markup and JSON-LD, and write `public/table-menu/index.html`. The complete document must include:

```html
<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://centrestjhotpot.ca/table-menu/">
  <link rel="stylesheet" href="/table-menu/table-menu.css">
  <script src="/analytics.js" defer></script>
  <script src="/table-menu/table-menu.js" defer></script>
</head>
```

Serialize JSON-LD with `<` escaped as `\u003c`. Write only when content changes so repeated builds are deterministic.

- [ ] **Step 7: Run renderer tests and generate the static page**

```bash
node --test tests/table-menu-renderer.test.mjs
npm run build:table-menu
npm run build
```

Expected: renderer tests PASS; `public/table-menu/index.html` exists; application build succeeds.

- [ ] **Step 8: Commit semantic rendering and route generation**

```bash
git add scripts/lib/table-menu-renderer.mjs scripts/lib/table-menu-renderer.d.mts tests/table-menu-renderer.test.mjs scripts/build-table-menu.mjs app/table-menu/page.tsx public/table-menu/index.html
git commit -m "Render the bilingual table menu route"
```

---

### Task 4: Implement the approved mobile visual system

**Files:**
- Create: `public/table-menu/table-menu.css`
- Test: `scripts/check-table-menu.mjs` in Task 6

**Interfaces:**
- Consumes: renderer class names and data attributes from Task 3.
- Produces: 390 px and 430 px layouts with large featured cards, two-column standard cards, sticky category filters, dialog styling, and no horizontal overflow.

- [ ] **Step 1: Add the CSS file with mobile-first tokens**

Create `public/table-menu/table-menu.css` using a scoped `.table-menu` root. Define these tokens exactly once:

```css
.table-menu {
  --tm-ink: #2b1915;
  --tm-red: #821b17;
  --tm-red-dark: #4d0f0c;
  --tm-gold: #d2a252;
  --tm-cream: #fff8ed;
  --tm-paper: #ffffff;
  --tm-muted: #75645c;
  --tm-line: #eaded4;
  color: var(--tm-ink);
  background: var(--tm-cream);
}
```

Implement:

- edge-to-edge branded header with high-contrast language controls;
- order notice directly below the header;
- sticky horizontally scrollable category row with no page-level overflow;
- wide `4:3` featured images;
- standard two-column grid at widths `>=360px`, falling back to one column below `360px`;
- 44 px minimum button/control height;
- two-line name clamp that does not hide price or serving text;
- image `aspect-ratio: 4 / 3; object-fit: cover`;
- native dialog with backdrop, close button, safe-area bottom padding, and maximum viewport height;
- persistent bottom notice that does not cover the last item;
- focus-visible outlines and reduced-motion handling.

- [ ] **Step 2: Check the stylesheet for route scoping and overflow hazards**

```bash
rg -n "^body|^html|100vw|position: fixed" public/table-menu/table-menu.css
```

Expected: no unscoped `body`/`html` rules; no `100vw`; fixed positioning appears only on the approved bottom notice or dialog-related elements.

- [ ] **Step 3: Build and inspect the route at 390 px**

Run:

```bash
npm run build:table-menu
npm run dev
```

Open the printed local origin at `/table-menu/`, set the browser viewport to `390 × 844`, and inspect the complete page. Confirm the featured order visually and confirm two standard cards fit without compressed price text. Stop the development server after the check.

- [ ] **Step 4: Commit the approved visual system**

```bash
git add public/table-menu/table-menu.css public/table-menu/index.html
git commit -m "Style the mobile table menu"
```

---

### Task 5: Add language, filter, search, details, and analytics behavior

**Files:**
- Create: `public/table-menu/table-menu.js`
- Modify: `public/table-menu/index.html` by regeneration only
- Test: `scripts/check-table-menu.mjs` in Task 6

**Interfaces:**
- Consumes: `data-en`, `data-zh`, `data-search`, `data-category`, `data-item-id`, and dialog markup from Task 3.
- Produces: initial English state, complete Traditional Chinese switch, in-place category filtering, bilingual search, accessible details dialog, and data-layer events.

- [ ] **Step 1: Implement one explicit state model**

Create `public/table-menu/table-menu.js` around this state:

```js
const state = {
  language: "en",
  category: "featured",
  query: "",
};
```

Do not read a stored language during initialization; every new page load starts in English as approved. Keep `setLanguage(language)`, `setCategory(category)`, `setQuery(query)`, `renderVisibility()`, `openItem(itemId)`, and `closeItem()` as separate named functions.

- [ ] **Step 2: Implement complete language switching**

`setLanguage` must accept only `en` or `zh`, update `document.documentElement.lang` to `en-CA` or `zh-Hant`, update all `[data-en][data-zh]` text/labels, update active-button state and `aria-pressed`, then call:

```js
window.gtag?.("event", "table_menu_language", { language });
```

- [ ] **Step 3: Implement category and bilingual-search filtering**

Search comparisons use `element.dataset.search.toLocaleLowerCase()` and match both English and Chinese names regardless of active language. Category `featured` shows only featured cards; every other category shows active cards whose `data-category` matches. Use the `hidden` attribute rather than deleting DOM nodes.

Emit:

```js
window.gtag?.("event", "table_menu_category", { category });
window.gtag?.("event", "table_menu_search", { query_length: query.length });
```

Debounce search analytics by 400 ms, but update visible results immediately.

- [ ] **Step 4: Implement accessible item details**

Clicking a card copies its already-rendered bilingual name, description, serving, price, tags, and large image path into the native dialog, opens it with `showModal()`, and emits:

```js
window.gtag?.("event", "table_menu_item_open", { item_id: itemId });
```

Close on the close button, `Escape`, and backdrop click. Return focus to the triggering card. Do not add order actions to the dialog.

- [ ] **Step 5: Regenerate and perform a quick manual interaction check**

```bash
npm run build:table-menu
```

Verify English initial state, Chinese switch, English search, Chinese search, each category, dialog open/close, and repeated order notice.

- [ ] **Step 6: Commit interactions**

```bash
git add public/table-menu/table-menu.js public/table-menu/index.html
git commit -m "Add table menu browsing interactions"
```

---

### Task 6: Add focused automated mobile verification

**Files:**
- Create: `scripts/check-table-menu.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: built files under `public/table-menu/` and `public/assets/table-menu/`.
- Produces: nonzero exit on menu regressions plus temporary screenshots for 390 px and 430 px viewports.

- [ ] **Step 1: Create the local static test server and browser harness**

Model the HTTP server after `scripts/visual-check.mjs`, but test only `/table-menu/` and its local assets. Launch Playwright Chromium with viewports `390 × 844` and `430 × 932`. Write screenshots to `reports/table-menu-check/` and keep that directory untracked.

- [ ] **Step 2: Encode the approved browser assertions**

For each viewport, assert:

```js
assert.equal(response.status(), 200);
assert.equal(await page.locator("html").getAttribute("lang"), "en-CA");
assert.equal(await page.locator("[data-table-menu-language='en']").getAttribute("aria-pressed"), "true");
assert.equal(await page.locator("[data-featured-card]").count(), 5);
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
assert.equal(await page.locator("form, [data-cart], [data-checkout], [data-order-submit]").count(), 0);
assert.match(await page.locator("body").innerText(), /View-only menu — please order with your server\./u);
```

Then click Chinese and assert `html[lang='zh-Hant']` plus the Chinese order notice. Search for `章鱼烧` and assert that `takoyaki` remains visible while an unrelated appetizer is hidden. Clear search, select `appetizers`, open `takoyaki`, assert the dialog is visible with `$8.89` and `6个`, press `Escape`, and assert focus returns to the card.

Scroll to the bottom before collecting broken images so lazy-loaded assets are exercised. Fail on local request failures, browser console errors, zero-width images, or image natural width `0`.

- [ ] **Step 3: Add the focused check to the project scripts**

Set:

```json
{
  "scripts": {
    "check:table-menu": "node scripts/check-table-menu.mjs"
  }
}
```

Append `npm run check:table-menu` to `check:site` after `check:html` and before the broad visual/Lighthouse checks.

- [ ] **Step 4: Run all focused tests**

```bash
node --test tests/table-menu-data.test.mjs tests/table-menu-images.test.mjs tests/table-menu-renderer.test.mjs
npm run build:table-menu
npm run check:table-menu
```

Expected: all tests PASS; two screenshots exist; no broken images, console errors, overflow, or ordering controls.

- [ ] **Step 5: Commit automated browser coverage**

```bash
git add scripts/check-table-menu.mjs package.json package-lock.json
git commit -m "Test the table menu on mobile"
```

---

### Task 7: Add production metadata, sitemap entry, and final content safeguards

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `public/table-menu/index.html` by regeneration only
- Modify: `content/table-menu/menu.json` only for source-verified corrections
- Modify: `app/table-menu/page.tsx` only if metadata checks expose a mismatch

**Interfaces:**
- Consumes: canonical route, Menu JSON-LD, final verified menu data.
- Produces: indexable canonical page with matching source/static metadata and current prices.

- [ ] **Step 1: Add `/table-menu/` to the sitemap**

Add one `<url>` entry for `https://centrestjhotpot.ca/table-menu/` using the release date as `<lastmod>`. Do not add a separate Chinese URL because language switching occurs within the same route.

- [ ] **Step 2: Regenerate and validate HTML metadata**

```bash
npm run build:table-menu
npm run check:html
```

Check that the static page has exactly one title, description, canonical link, Open Graph image, viewport meta, and Menu JSON-LD script.

- [ ] **Step 3: Run all price and bilingual safeguards**

```bash
npm run check:price
npm run check:publishing-price
npm run check:bilingual
```

Expected: PASS. Correct any failure only in the source of truth, regenerate, and rerun all three commands.

- [ ] **Step 4: Commit production discovery metadata**

```bash
git add public/sitemap.xml public/table-menu/index.html content/table-menu/menu.json app/table-menu/page.tsx
git commit -m "Add table menu production metadata"
```

---

### Task 8: Generate the final restaurant-wide QR card

**Files:**
- Create: `marketing/scripts/generate-table-menu-qr-card.mjs`
- Modify: `marketing/qr-cards/table-menu-qr-card-4x6.html`
- Modify: `marketing/qr-cards/table-menu-qr-card-4x6.png`
- Modify: `marketing/qr-cards/table-menu-qr-card-4x6.pdf`
- Modify: `marketing/qr-card-usage-guide.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: exact tracked URL `https://centrestjhotpot.ca/table-menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu`.
- Produces: editable HTML, 1200 × 1800 PNG, and 4 × 6 inch PDF containing the same QR payload.

- [ ] **Step 1: Implement one-source QR asset generation**

Create `marketing/scripts/generate-table-menu-qr-card.mjs` with this single URL constant:

```js
const TABLE_MENU_URL = "https://centrestjhotpot.ca/table-menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu";
```

Generate an error-correction-level `M` QR using `qrcode`, embed it into a print-safe 4 × 6 inch HTML card, then use Playwright to produce:

- viewport/screenshot PNG at `1200 × 1800`;
- PDF with `width: "4in"`, `height: "6in"`, `printBackground: true`, and zero margins.

Card copy must include `SCAN TO VIEW MENU`, `扫码查看菜单`, `View only — order with your server`, and `仅供浏览，请向服务员点单`. Keep a light quiet zone around the QR and do not place artwork behind it.

- [ ] **Step 2: Add a deterministic QR asset test inside the generator**

Before writing outputs, assert that `new URL(TABLE_MENU_URL)` has pathname `/table-menu/` and these exact query values:

```js
assert.equal(url.searchParams.get("utm_source"), "table_qr");
assert.equal(url.searchParams.get("utm_medium"), "offline");
assert.equal(url.searchParams.get("utm_campaign"), "dine_in_menu");
```

After generation, assert that all three outputs have nonzero file size and the HTML contains the exact URL and both view-only messages.

- [ ] **Step 3: Generate and inspect the print assets**

```bash
npm run generate:table-menu-qr
```

Open the PNG and PDF at full size. Confirm the QR has a clean quiet zone, text is not clipped, and the card clearly says the menu cannot place an order.

- [ ] **Step 4: Update the usage guide**

Document that all tables use this same card, the old `/menu/` card must be replaced only after production verification, and one printed card must be scanned on both iPhone and Android before batch printing.

- [ ] **Step 5: Commit QR source and outputs**

```bash
git add package.json package-lock.json marketing/scripts/generate-table-menu-qr-card.mjs marketing/qr-cards/table-menu-qr-card-4x6.html marketing/qr-cards/table-menu-qr-card-4x6.png marketing/qr-cards/table-menu-qr-card-4x6.pdf marketing/qr-card-usage-guide.md
git commit -m "Generate the table menu QR card"
```

---

### Task 9: Run release verification and deploy the isolated change set

**Files:**
- Verify: all files from Tasks 1–8
- Do not modify unrelated paths

**Interfaces:**
- Consumes: completed `codex/table-menu` branch.
- Produces: reviewed commit range, successful GitHub Pages deployment, live route verification, and physical QR readiness decision.

- [ ] **Step 1: Run the focused and project-wide automated checks**

```bash
npm run build:table-menu-images
npm run build:table-menu
node --test tests/table-menu-data.test.mjs tests/table-menu-images.test.mjs tests/table-menu-renderer.test.mjs
npm run check:table-menu
npm run check:price
npm run check:publishing-price
npm run check:bilingual
npm run check:html
npm run build
```

Expected: every command PASS. If a broad pre-existing check fails outside the table-menu scope, record the exact failure, prove the table-menu focused checks pass, and do not alter unrelated code to conceal it.

- [ ] **Step 2: Review the complete isolated diff**

```bash
git status --short
git diff --check main...HEAD
git diff --stat main...HEAD
git log --oneline main..HEAD
```

Expected: only the approved design/plan documents and table-menu/QR implementation paths appear. No source-menu PDF from Downloads, credentials, temporary screenshots, `.superpowers/`, or unrelated marketing work is present.

- [ ] **Step 3: Perform desktop and physical-device preview checks**

Use the generated screenshots plus real iPhone Safari and Android Chrome. Verify English default, Chinese switch, search in both languages, every category, detail close/focus, image quality, bottom notice, and zero digital-order controls.

- [ ] **Step 4: Request code review before release**

Use `superpowers:requesting-code-review` on `main...HEAD`. Resolve only confirmed table-menu findings and rerun the focused checks after each fix.

- [ ] **Step 5: Finish the development branch safely**

Use `superpowers:finishing-a-development-branch` to present the integration options. Do not merge or push until the user authorizes the chosen release action.

- [ ] **Step 6: Push the approved release and wait for deployment**

After authorization, push the isolated table-menu commit range to the approved branch/`main` workflow. Monitor the GitHub Pages run to completion; a local commit or successful push is not deployment proof.

- [ ] **Step 7: Verify the live production route**

Check:

```text
https://centrestjhotpot.ca/table-menu/
https://centrestjhotpot.ca/table-menu/table-menu.css
https://centrestjhotpot.ca/table-menu/table-menu.js
https://centrestjhotpot.ca/assets/table-menu/takoyaki-320.webp
```

Verify HTTP 200, canonical URL, Menu JSON-LD, featured order, English default, Chinese switch, category/search behavior, image loading, analytics initialization, and absence of order controls in the live DOM.

- [ ] **Step 8: Scan the printed QR before replacing table cards**

Print one 4 × 6 inch proof. Scan it with iPhone and Android, confirm the complete UTM URL lands on the live table menu, and confirm both phones can switch language and browse images. Only then approve batch printing and remove the old `/menu/` QR cards from tables.

- [ ] **Step 9: Record the release evidence**

Add the deployment run URL, production verification timestamp, tested devices, and QR proof result to `marketing/qr-card-usage-guide.md`, then commit only that evidence update:

```bash
git add marketing/qr-card-usage-guide.md
git commit -m "Document table menu release verification"
```
