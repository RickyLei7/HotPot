# Local Visibility Execution Plan

Updated: 2026-07-14

## Goal

Increase qualified local discovery and measure the actions that lead to a table visit: menu views, calls, Google Maps directions, and Google reviews.

## This week

### 1. Google reviews

- Ask only guests who have finished a positive visit. Do not offer a discount, gift, or other incentive for a review.
- Use this simple staff line: "If you enjoyed your meal today, a Google review with a photo really helps a local restaurant like ours. Thank you."
- Place the Google review QR beside the bill folder and host stand. Invite a photo of a favorite dish, not a scripted review.
- Check each new review daily. Escalate any unhappy review for an owner-approved reply; do not reply automatically.

### 2. Website link rules

- Facebook, Threads, and Google Business posts use the matching tracked link from `website-traffic-link-kit.md`.
- Instagram uses the profile link and a Story link sticker when available. Caption CTA: "See the full AYCE menu and all 15 soup bases through the link in our bio."
- TikTok uses the profile website field only when the account offers it.
- Xiaohongshu uses the natural CTA: `完整 AYCE 菜单和 15 种锅底可以在主页查看。` Do not paste long tracking links into ordinary post copy.

### 3. Priority local listings

Use the exact same NAP on every listing:

- Name: Centre Street Japanese HotPot
- Alternate name: 鼎鑽火鍋
- Address: 2213 Centre St N #2243, Calgary, AB T2E 2T4
- Phone: (403) 455-3188
- Website: https://centrestjhotpot.ca/
- Primary categories: Hot pot restaurant; Japanese restaurant; Taiwanese restaurant

| Priority | Directory | Action |
| --- | --- | --- |
| 1 | Google Business Profile | Keep hours, menu, phone, website, photos, and weekly updates current. |
| 1 | Apple Business Connect / Apple Maps | Claim or verify, then use the same NAP and website. |
| 1 | Bing Places | Claim or create the listing with the same NAP and website. |
| 2 | Yelp for Business | Claim the existing listing, correct NAP, add current menu and photos. |
| 2 | TripAdvisor | Claim or create, add current hours, cuisine, menu URL, and restaurant photos. |
| 2 | YellowPages Canada | Claim or create with exact NAP, categories, and website. |
| 3 | Calgary-focused food/community listings | Submit only to real local directories or food guides that allow a restaurant profile and a website link. |

Do not pay for bulk directory packages, purchased backlinks, copied reviews, or creator posts that do not disclose sponsorship when disclosure is required.

## GA4 scorecard

Review weekly by `Session source / medium` and compare these events:

| Intent | GA4 event | What it means |
| --- | --- | --- |
| Website interest | `menu_click`, `menu_pdf_open`, `menu_download`, `view_item` | Visitor looked for details before deciding. |
| Ready to visit | `directions_click`, `generate_lead` with `lead_type=directions` | Strong local-intent signal. |
| Ready to contact | `phone_click`, `reservation_click`, `generate_lead` with `lead_type=phone` | Strong reservation or availability signal. |
| Reputation interest | `google_review_click` | Visitor is considering or completing a Google review. |

Mark `generate_lead` as a key event in GA4. Do not use total users alone to judge the site: report source, sessions, calls, directions, and menu actions together.
