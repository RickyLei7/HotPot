# Analytics Event Map

Status: Updated 2026-07-09. GA initialization and events are implemented in `public/site-events.js`.

## Events

| Event | Trigger | Revenue Meaning |
| --- | --- | --- |
| `campaign_landing` | Page opens with a valid `utm_source` | Attributes website visits to a platform and campaign |
| `reservation_click` | Any phone reservation CTA | Main reservation intent |
| `phone_click` | Any phone link | High-intent call |
| `generate_lead` | Any phone link | GA4 recommended lead event; use for reporting |
| `email_click` | Email link | Contact intent |
| `directions_click` | Google Maps link | Visit intent |
| `google_review_click` | Google Maps review link | Review-growth signal |
| `menu_click` | Menu link | Food decision intent |
| `menu_download` | Menu PDF download button | Strong menu interest |
| `menu_pdf_open` | Menu PDF open button | Strong menu interest |
| `social_click` | Any social profile link | Cross-platform discovery |
| `instagram_click` | Instagram link | Social follow/engagement |
| `facebook_click` | Facebook link | Social follow/engagement |
| `threads_click` | Threads link | Social follow/engagement |
| `tiktok_click` | TikTok link | Social follow/engagement |
| `xiaohongshu_click` | Xiaohongshu link | Chinese-audience social interest |
| `ayce_interest_click` | AYCE CTA or AYCE text link | AYCE demand |
| `ayce_poster_click` | AYCE poster link | Deeper AYCE interest |

## Mark These As GA4 Key Events

In GA4 Admin -> Data display -> Events, mark these as key events once they appear:

- `reservation_click`
- `phone_click`
- `generate_lead`
- `directions_click`
- `menu_download`
- `google_review_click`

Optional key events if you want to measure social growth:

- `social_click`
- `xiaohongshu_click`
- `instagram_click`

## Weekly Use

Compare these events against weekly revenue:

- Use `campaign_landing` to compare Facebook, Instagram, Threads, TikTok, Google Business, and Xiaohongshu traffic.
- If `reservation_click` and `phone_click` rise, the website is helping drive reservations.
- If `directions_click` rises and revenue rises, local intent is converting.
- If `menu_download` or `menu_pdf_open` rises but calls do not, the menu may need stronger call/reserve prompts.
- If `ayce_interest_click` rises, publish more AYCE-focused Google Business Profile and social posts.
- If social clicks rise but calls/directions do not, social profiles need stronger menu/call links.

## Required Manual Data

Analytics cannot prove revenue alone. Combine with:

- POS revenue.
- Number of orders.
- Average order value.
- Staff notes on AYCE questions.
- Google Business Profile calls and directions clicks.
