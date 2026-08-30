# Website Traffic Link Kit

Updated: 2026-08-25

Destination: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/`

Google Ads destination: `https://centrestjhotpot.ca/google-ads-ayce-hot-pot/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ayce_search&utm_content=landing_page`

## Evergreen profile links

- Instagram: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=instagram&utm_medium=social&utm_campaign=ayce_always_on&utm_content=profile_link`
- Facebook: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=facebook&utm_medium=social&utm_campaign=ayce_always_on&utm_content=profile_link`
- Threads: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=threads&utm_medium=social&utm_campaign=ayce_always_on&utm_content=profile_link`
- TikTok: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=tiktok&utm_medium=social&utm_campaign=ayce_always_on&utm_content=profile_link`
- Google Business Profile: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=google_business&utm_medium=organic&utm_campaign=ayce_always_on&utm_content=profile_link`
- Xiaohongshu: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=xiaohongshu&utm_medium=social&utm_campaign=ayce_always_on&utm_content=profile_link`

## Current post links

Use these for ordinary AYCE posts. Replace only the final `utm_content` value with the creative name, using lowercase letters, numbers, and underscores.

- Facebook: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=facebook&utm_medium=social&utm_campaign=ayce_always_on&utm_content=snack_upgrade`
- Threads: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=threads&utm_medium=social&utm_campaign=ayce_always_on&utm_content=snack_upgrade`
- Google Business Profile: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=google_business&utm_medium=organic&utm_campaign=ayce_always_on&utm_content=snack_upgrade`

## Paid social ad links

Paid ads must identify the platform directly. Never use `utm_source=meta`,
because that combines Instagram and Facebook traffic in GA4.

- Instagram: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=instagram&utm_medium=paid_social&utm_campaign=ayce_paid_social&utm_content=menu_carousel`
- Facebook: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=facebook&utm_medium=paid_social&utm_campaign=ayce_paid_social&utm_content=menu_carousel`
- Threads: `https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=threads&utm_medium=paid_social&utm_campaign=ayce_paid_social&utm_content=menu_carousel`

Current Instagram AYCE carousel ad:

```text
https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=instagram&utm_medium=paid_social&utm_campaign=ayce_menu_aug2026&utm_content=pinned_ayce_carousel
```

Paid social rules:

- Use `utm_medium=paid_social` only for paid or boosted placements.
- Use `utm_medium=social` for ordinary posts, profile links, and Stories.
- Use `utm_source=instagram`, `facebook`, or `threads`; never use `meta`.
- Keep one `utm_campaign` value for all ads in the same campaign.
- Give each creative a unique `utm_content` value.

## Google Ads final URLs

Use the dedicated landing page for Search Ads so the ad promise and first screen match.

- Main AYCE Search Ad: `https://centrestjhotpot.ca/google-ads-ayce-hot-pot/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ayce_search&utm_content=main_ad`
- Price-focused ad: `https://centrestjhotpot.ca/google-ads-ayce-hot-pot/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ayce_search&utm_content=price_28_99`
- Directions/call-focused ad: `https://centrestjhotpot.ca/google-ads-ayce-hot-pot/?utm_source=google_ads&utm_medium=cpc&utm_campaign=ayce_search&utm_content=call_directions`

Instagram caption CTA:

```text
See the full AYCE menu and all 15 soup bases through the link in our bio.
```

Instagram Story link:

```text
https://centrestjhotpot.ca/ayce-hot-pot-calgary/?utm_source=instagram&utm_medium=social&utm_campaign=ayce_always_on&utm_content=story_link
```

TikTok caption CTA when the profile website field is available:

```text
Full AYCE details and all 15 soup bases in our profile link.
```

Xiaohongshu CTA:

```text
完整 AYCE 菜单和 15 种锅底可以在主页查看。
```

## Daily publishing rules

- Use direct tracked links in Facebook, Threads, and Google Business posts.
- Instagram captions say `link in bio`; Stories use the matching Story link sticker.
- TikTok uses the profile website field only when the account is eligible.
- Xiaohongshu does not receive long UTM URLs in ordinary post copy.
- Replace `utm_content` with a short lowercase name for each creative.
- Never reuse expired promotion names or date-specific UTM campaigns.
- Run `npm run check:social-attribution` before launching or editing paid social ads.
