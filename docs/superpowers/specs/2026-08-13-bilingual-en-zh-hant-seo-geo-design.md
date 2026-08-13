# English and Traditional Chinese Website Design

## Objective

Turn Centre Street Japanese HotPot / 鼎鑽火鍋 into a complete English and Traditional Chinese website without changing the existing English URLs or weakening the current Calgary SEO, Google Ads landing page, phone conversion tracking, mobile usability, or GEO citation surfaces.

Success means guests can switch the current page between English and Traditional Chinese, search engines can index the correct language URL, AI answer engines can retrieve consistent facts in either language, and GA4 can separate language usage and language-switch behaviour.

## Approaches Considered

### Recommended: paired URLs under `/zh-hant/`

- Keep English at the current root URLs.
- Add one Traditional Chinese equivalent for every indexed English page under `/zh-hant/`.
- Connect every pair with reciprocal `hreflang`, self-canonical tags, visible language links, sitemap alternates, and translated metadata.
- Keep navigation, calls to action, internal links, and structured data in the page language.

This is the clearest guest experience and the most reliable structure for crawling, indexing, analytics, and future maintenance.

### Rejected: side-by-side English and Chinese on every page

This avoids extra URLs but makes already long mobile pages longer, weakens page-language clarity, and creates a poor scanning experience. The current site already shows the limits of mixed-language pages.

### Rejected: JavaScript language toggle on one URL

This is compact but creates weak crawlability, unstable shareable URLs, ambiguous metadata, and unreliable language-specific search results. It also makes server-rendered and static production surfaces harder to keep consistent.

## URL and Page Scope

English remains unchanged:

- `/`
- `/about/`
- `/menu/`
- `/faq/`
- `/contact/`
- `/restaurant-info/`
- `/calgary-hot-pot-guide/`
- `/calgary-taiwanese-hot-pot/`
- `/first-time-hot-pot-calgary/`
- `/ayce-hot-pot-calgary/`

Traditional Chinese equivalents use the same slugs under `/zh-hant/`:

- `/zh-hant/`
- `/zh-hant/about/`
- `/zh-hant/menu/`
- `/zh-hant/faq/`
- `/zh-hant/contact/`
- `/zh-hant/restaurant-info/`
- `/zh-hant/calgary-hot-pot-guide/`
- `/zh-hant/calgary-taiwanese-hot-pot/`
- `/zh-hant/first-time-hot-pot-calgary/`
- `/zh-hant/ayce-hot-pot-calgary/`

The existing `/google-ads-ayce-hot-pot/` page stays English and `noindex, follow`. It will not get a Chinese duplicate until a Chinese-language campaign exists.

OAuth callback pages remain unchanged and are excluded from guest-facing language requirements.

## Guest Experience

### Language control

- Add a compact `EN | 繁中` segmented language control beside the Reserve button.
- Keep it directly visible on desktop and mobile; do not hide it in the More menu.
- Each language link opens the equivalent current page.
- Use text labels, not flags.
- Mark the active language with `aria-current="page"`.
- Give the control a translated accessible label.

### Navigation continuity

- English navigation always links to English URLs.
- Traditional Chinese navigation always links to `/zh-hant/` URLs.
- Telephone, map, PDF, email, and external social URLs remain shared.
- Do not auto-redirect by IP, browser language, or `Accept-Language`.
- Do not show a blocking language modal.

### Content language

- English pages become primarily English. The brand name 鼎鑽火鍋 and proper menu names may remain where useful.
- Traditional Chinese pages use Traditional Chinese for navigation, headings, body copy, CTAs, FAQ answers, and accessibility text.
- Prices, AYCE terms, address, phone, and hours must be identical across languages.
- The menu PDF may remain shared because it is a restaurant artifact; the surrounding web menu content must be localized.

## SEO Architecture

Every paired page must include:

- a self-referencing canonical;
- reciprocal `hreflang="en-CA"` and `hreflang="zh-Hant-CA"` links;
- `hreflang="x-default"` pointing to the English equivalent;
- a unique translated title and meta description;
- matching Open Graph title, description, URL, and locale;
- correct `<html lang="en-CA">` or `<html lang="zh-Hant">` in deployed static HTML;
- crawlable HTML links between language versions.

The sitemap will include all 20 indexed URLs and XHTML language alternates. English URLs retain their history and authority; no redirects or slug migrations are introduced.

## Local SEO and GEO

### Shared entity

Both languages describe the same Restaurant entity using `https://centrestjhotpot.ca/#restaurant`. Name, alternate name, phone, address, geo coordinates, hours, cuisine, offers, menu URLs, and social profiles must remain consistent.

### Language-specific page entities

- Add `inLanguage` to WebPage, AboutPage, FAQPage, Article, and menu-related page entities.
- Translate page names, descriptions, FAQ questions, and FAQ answers.
- Keep factual values such as prices and opening times unchanged.
- Use the Chinese restaurant information page as the concise citation target for Chinese AI answers.

### AI-readable content

- Expand `llms.txt` with explicit English and Traditional Chinese citation targets.
- Link to both language versions of restaurant facts, menu, AYCE, FAQ, contact, and first-visit guidance.
- Keep claims factual and avoid unverifiable superlatives such as best or number one.
- Preserve direct answers for Calgary hot pot, AYCE, individual hot pot, Taiwanese-style hot pot, family/group dining, location, reservations, and current pricing.

## Traffic and Measurement

Use the existing GA4 and Google Ads tags. Do not create a separate GA4 property.

Add these parameters to existing click events:

- `site_language`: `en` or `zh-Hant`;
- `page_language`: derived from `<html lang>`;
- existing `page_path`, CTA text, CTA location, and destination remain intact.

Add a `language_switch` event containing:

- `from_language`;
- `to_language`;
- `source_path`;
- `destination_path`.

Track English and Chinese conversion paths separately in GA4 explorations:

- page views;
- language switches;
- menu views and downloads;
- phone clicks;
- directions clicks;
- engagement with AYCE pages.

No conversion or ROAS claim may be made without Ads, GA4, and actual reservation or in-store evidence.

## Search Console and Launch

- The existing domain property covers both language directories; no new property is required.
- Submit the updated sitemap after deployment.
- Inspect the Traditional Chinese home, menu, AYCE, contact, and restaurant-info URLs first.
- Monitor indexed pages, queries, impressions, clicks, and language-specific landing pages.
- Do not request indexing for the noindex Google Ads landing page.

## Source and Production Architecture

- `app/` remains the Next/Vinext source surface.
- `public/` remains the GitHub Pages production surface.
- Add reusable language route metadata and language navigation helpers in `app/`.
- Add Traditional Chinese app routes and matching static production pages.
- Keep shared CSS and tracking logic centralized.
- Keep unrelated marketing, publisher, API, package, and generated files out of the website commit.

## Accessibility and Responsive Requirements

- Language controls must have at least a 44px interactive height on mobile.
- Active language must not rely only on colour.
- Chinese text must wrap naturally without clipping or horizontal scrolling.
- Sticky Reserve text must be localized.
- Every translated image alt must describe the image rather than repeat keywords.
- Full-page layouts must remain compact and avoid duplicating English below Chinese.

## Automated Validation

Add a bilingual site check that verifies:

- every English indexed route has a Chinese equivalent and vice versa;
- correct `lang`, canonical, reciprocal hreflang, and x-default values;
- exactly one H1;
- titles and meta descriptions exist and fit expected limits;
- internal navigation stays in the current language;
- Restaurant facts match across languages;
- Google Ads page remains noindex;
- analytics and language-switch tracking are present.

Expand Playwright visual checks to all English and Chinese indexed pages at 390px and 1440px. Verify no broken images, overflow, console errors, hidden language control, or broken current-page switching. Run build, lint, HTML validation, attribution tests, bilingual SEO tests, visual checks, and Lighthouse before deployment.

## Rollout and Risk Control

1. Add shared language helpers, controls, analytics dimensions, and tests.
2. Add all Traditional Chinese routes and production pages.
3. Add reciprocal metadata to English pages.
4. Update sitemap and AI-readable facts.
5. Validate locally on mobile and desktop.
6. Commit only bilingual website files.
7. Push to `main`, wait for GitHub Pages, bypass stale CDN cache during verification, and verify the live HTML.
8. Submit the sitemap and monitor Search Console after launch.

The change is additive. Existing English URLs, Ads final URLs, phone numbers, menus, and analytics IDs do not change, which keeps rollback straightforward and limits ranking risk.
