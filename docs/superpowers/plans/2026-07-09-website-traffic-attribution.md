# Website Traffic Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reliably record website traffic and route social-profile visitors to the AYCE landing page with platform-specific attribution.

**Architecture:** A same-origin `site-events.js` file owns GA initialization, UTM landing events, and click events for every static page. Platform profile links point to the existing AYCE landing page with distinct UTM sources, while a checked-in link kit keeps daily publishing consistent.

**Tech Stack:** Static HTML, browser JavaScript, Next layout parity, Node.js validation scripts, Google Analytics 4, GitHub Pages.

## Global Constraints

- Use GA measurement ID `G-JN2E0S7E36`.
- Do not collect personal information in custom events.
- Do not change menu prices, opening hours, or promotion terms.
- Use `/ayce-hot-pot-calgary/` as the social landing page.
- Stop on platform verification, permissions, or unsupported website-link fields.

---

### Task 1: Add an attribution regression check

**Files:**
- Create: `scripts/check-attribution.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: deployable HTML files under `public/`
- Produces: `npm run check:attribution`, a zero-exit validation command

- [x] **Step 1: Write the failing validation script**

Create a Node script that recursively loads all `public/**/*.html` files and asserts:

```js
assert.equal((html.match(/src="\/site-events\.js"/g) || []).length, 1);
assert.equal(html.includes('src="/analytics.js"'), false);
assert.equal(html.includes("gtag('config', 'G-JN2E0S7E36')"), false);
```

Also load `public/site-events.js` and assert it contains the measurement ID, `campaign_landing`, `reservation_click`, `menu_click`, and `window.__hotpotAnalyticsReady`.

- [x] **Step 2: Add and run the package command**

Add:

```json
"check:attribution": "node scripts/check-attribution.mjs"
```

Run: `npm run check:attribution`

Expected: FAIL because `/site-events.js` does not exist and the HTML pages still use `/analytics.js`.

### Task 2: Centralize analytics initialization and events

**Files:**
- Create: `public/site-events.js`
- Modify: `public/index.html`
- Modify: `public/about/index.html`
- Modify: `public/ayce-hot-pot-calgary/index.html`
- Modify: `public/calgary-hot-pot-guide/index.html`
- Modify: `public/calgary-taiwanese-hot-pot/index.html`
- Modify: `public/contact/index.html`
- Modify: `public/faq/index.html`
- Modify: `public/menu/index.html`
- Modify: `public/restaurant-info/index.html`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `window.gtag`, `window.dataLayer`, and `window.__hotpotAnalyticsReady`
- Emits: `campaign_landing` and the existing click-event names

- [x] **Step 1: Implement the same-origin initializer**

Start `public/site-events.js` with:

```js
(function () {
  var measurementId = "G-JN2E0S7E36";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  if (!window.__hotpotGaConfigured) {
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    window.__hotpotGaConfigured = true;
  }
  window.__hotpotAnalyticsReady = true;
})();
```

Move the existing click-event logic from `public/analytics.js` into the same file. Read `utm_source`, `utm_medium`, and `utm_campaign` from `location.search`; when `utm_source` is present, queue one `campaign_landing` event without personal data.

- [x] **Step 2: Update every deployable page**

Keep the asynchronous Google tag loader, remove each inline initializer and `/analytics.js` include, and add:

```html
<script defer src="/site-events.js"></script>
```

Update `app/layout.tsx` to load `/site-events.js` after the Google tag loader and remove its inline initializer.

- [x] **Step 3: Run focused checks**

Run: `npm run check:attribution`

Expected: PASS.

Run: `npm run check:html`

Expected: PASS.

### Task 3: Strengthen the website destination and publish link kit

**Files:**
- Modify: `public/index.html`
- Modify: `app/page.tsx`
- Create: `marketing/website-traffic-link-kit.md`

**Interfaces:**
- Produces: one canonical AYCE destination and exact platform URLs for daily publishing

- [x] **Step 1: Make the homepage CTA explicit**

Change the homepage AYCE link label from `AYCE Hot Pot Calgary` to `Full AYCE Menu + 15 Soup Bases` in the deployable static page and the Next page.

- [x] **Step 2: Record exact profile and post URLs**

Document links using this shape:

```text
https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=instagram&utm_medium=social&utm_campaign=ayce_always_on&utm_content=profile_link
```

Provide equivalents for Facebook, Threads, TikTok, Google Business, and Xiaohongshu, plus a `stampede_ayce` post campaign variant that expires after July 12, 2026.

- [ ] **Step 3: Run repository checks**

Run: `npm run lint`

Expected: PASS.

Run: `npm run check:visual`

Expected: PASS with no overflow, broken images, or console errors.

### Task 4: Update social-profile website destinations

**External surfaces:**
- Instagram profile
- Facebook Page profile
- Threads profile
- TikTok profile when eligible
- Google Business Profile when authorized

- [ ] **Step 1: Update supported profile links**

Set Instagram, Facebook, and Threads to their `ayce_always_on` profile URLs from the link kit. Set TikTok only if its edit-profile interface exposes a website field. Do not place a long UTM URL into ordinary bio text.

- [ ] **Step 2: Respect blocked surfaces**

If TikTok does not expose a website field, keep the short domain text. If Google Business still shows no managed business, report the account blocker and make no profile change.

- [x] **Step 3: Update the daily automation**

Require direct UTM links in Facebook, Threads, and Google posts; use `link in bio` on Instagram; use the eligible profile website field on TikTok; and use a profile-based CTA on Xiaohongshu.

### Task 5: Deploy and verify production

**Files:**
- Verify: `public/site-events.js`
- Verify: `https://centrestjhotpot.ca/`

- [ ] **Step 1: Run the complete local verification**

Run:

```bash
npm run check:attribution
npm run check:html
npm run lint
npm run check:visual
```

Expected: every command exits successfully.

- [ ] **Step 2: Commit only scoped files and push `main`**

Commit message:

```text
Improve website traffic attribution
```

Push `main` so the existing GitHub Pages workflow deploys `public/`.

- [ ] **Step 3: Verify production behavior**

Open:

```text
https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=codex_test&utm_medium=test&utm_campaign=attribution_check
```

Confirm `window.__hotpotAnalyticsReady === true`, `typeof window.gtag === "function"`, and the data layer contains `campaign_landing` with source `codex_test`.
