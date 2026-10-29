# Local Visibility Execution Plan

Updated: 2026-10-29

## Goal

Increase qualified local discovery and measure the actions that lead to a table visit: menu views, calls, Google Maps directions, and Google reviews.

## This week

### 1. Google reviews

- Invite all guests after their visit to leave an honest review, regardless of satisfaction. Participation is optional. Do not offer a discount, gift, or other incentive, ask for a particular rating, or filter guests before showing the Google link.
- Staff line: "Thank you for visiting. If you would like to, you can scan this code to share an honest Google review."
- 中文：謝謝光臨。如果願意，歡迎掃碼在 Google 分享真實用餐體驗。
- Place the review card beside the bill folder or host stand. Let guests choose their own rating, wording and whether to include a photo.
- Verified owner-provided review link: https://g.page/r/CbP5h_QDhEEaEBM/review
- Print-ready 4 × 6 inch card: `qr-cards/google-review-card-4x6.pdf` (PNG and printable HTML also available).
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
| 1 | Google Business Profile | Keep hours, menu, phone, website and photos current. Daily posts already exist; publish only useful, accurate updates and avoid duplicates. |
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
| Ready to visit | `directions_click` | Guest opened directions; not proof of arrival. |
| Ready to contact | `phone_click` | Guest tapped the telephone link; not proof of a connected call. |
| Booking interest | `online_booking_click` | Guest opened the online booking flow. |
| Booking request | `online_booking_submitted` | A pending request was sent; not a confirmed reservation. |
| Confirmed booking | `online_booking_completed`, `reservation_completed`, `generate_lead` with `lead_type=online_booking` | Booking provider reported a confirmed booking. |
| Reputation interest | `google_review_click` | Visitor is considering or completing a Google review. |

Use confirmed booking events for booking outcomes; keep review clicks and pending requests separate. A review click is not proof that a review was published. Do not use total users alone to judge the site: report source, sessions, calls, directions, and menu actions together.

## Current execution record

See `local-search-followup-20261029.md` for verified profile details, submitted menu edits, blocked third-party corrections, and the current Search Console baseline.

Google policy: [Review link and QR code](https://support.google.com/business/answer/16816815?hl=en), [genuine, unbiased contributions](https://support.google.com/contributionpolicy/answer/7400114).
