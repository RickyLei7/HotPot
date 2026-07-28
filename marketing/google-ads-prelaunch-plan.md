# Google Ads Pre-Launch Plan

## Launch Objective

Drive high-intent local actions for Centre Street Japanese HotPot:

1. Phone taps through the direct Google Ads phone conversion tag
2. Direction requests (`directions_click` from GA4)

Do not optimize to menu views, social-link taps, downloads, or duplicate phone events.

## Recommended Campaign

Use a Standard Search campaign after billing setup. Keep the current Smart Campaign as an unlaunched onboarding draft only.

- Network: Google Search only
- Disable: Display Network, YouTube, Performance Max, and Search Partners for the first test
- Location: 10 km radius around 2213 Centre St N #2243, Calgary, AB T2E 2T4
- Location option: Presence only (people in or regularly in the target area)
- Language: English initially
- Bid strategy: Maximize Clicks with a CA$3 max CPC for week 1; switch only after enough real phone/direction data
- Test budget: CA$15/day, reviewed after 14 days

## Keywords

Start with exact and phrase match only:

```text
+[all you can eat hot pot calgary]
"all you can eat hot pot calgary"
+[ayce hot pot calgary]
"ayce hot pot calgary"
+[hot pot calgary]
"hot pot calgary"
"hot pot near me"
"japanese hot pot calgary"
"taiwanese hot pot calgary"
"individual hot pot calgary"
```

## Negative Keywords

```text
recipe
recipes
homemade
how to
ingredients
job
jobs
hiring
career
delivery
takeout
frozen
instant
cookware
electric pot
happy lamb
master beef
beefun
```

## Responsive Search Ad Assets

Headlines:

```text
AYCE Hot Pot Calgary
$28.99 AYCE Hot Pot
15 Soup Bases Included
AAA Beef & Lamb Refills
Add Snacks For $3.99
Individual Hot Pot $19.99
Centre Street North Calgary
Call For Availability
```

Descriptions:

```text
Soup base included. Refills ordered fresh through your server. Dine in only.
Choose 15 soup bases, or add $2 for two flavours in one personal pot.
Add $3.99 per guest for unlimited made-to-order snacks. Whole table upgrades.
Call to reserve a table or see our full AYCE menu online.
```

## Assets

- Square food image: `marketing/social-assets/google-ads/ayce-table-square-1200.png`
- Landscape food image: `marketing/social-assets/google-ads/ayce-table-landscape-1200x628.png`
- Square logo: `marketing/social-assets/google-ads/brand-logo-square-1200.png`
- Landing page: `https://centrestjhotpot.ca/google-ads-ayce-hot-pot/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ayce_search&utm_content=landing_page`

## Measurement

GA4 key events to keep:

- `phone_click` for phone taps
- `directions_click` for map/direction intent
- `google_ads_landing` for Google Ads visitors when auto-tagging IDs are present
- `generate_lead` as a combined lead event for GA4 reporting

GA4 secondary observation events:

- `menu_click`
- `reservation_click`
- `ayce_interest_click`
- social-link clicks

Enable Google Ads auto-tagging when GA4 and Google Ads are linked.

Recommended Google Ads conversion setup:

- Keep the direct Google Ads phone conversion tag as the primary call/reservation conversion.
- Import `directions_click` from GA4 as a primary or secondary store-visit intent conversion.
- Do not import `phone_click` and `generate_lead` as primary conversions if the direct phone conversion tag is already active, because that can double-count the same phone tap.
- Keep `google_ads_landing`, `menu_click`, `phone_click`, and `generate_lead` as observation/reporting events unless you intentionally change the conversion model.

## First 14-Day Review

Every 3-4 days, review the Search Terms report. Add irrelevant queries as negatives. At day 14, assess cost per phone tap, cost per direction request, impression share, and actual in-store mentions. Keep only queries that produce local intent.
