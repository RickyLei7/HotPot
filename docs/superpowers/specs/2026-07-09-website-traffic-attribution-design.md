# Website Traffic and Attribution Design

## Goal

Increase measurable website visits from Centre Street Japanese HotPot's social profiles and daily posts while making sure Google Analytics records landing traffic and high-intent actions reliably.

## Findings

- The live site returns successfully and already has dedicated menu and AYCE landing pages.
- The live page contains Google Analytics script tags, but the inspected Chrome session did not expose an initialized `window.dataLayer` or `window.gtag`. Tracking may be undercounting in some browser conditions.
- Instagram and TikTok display the domain as profile text rather than a clear clickable tracked link.
- Facebook has a clickable untagged website link.
- Threads already has a clickable UTM-tagged link.
- The currently logged-in Google account does not expose the restaurant's Google Analytics property, so current 7-day and 28-day reporting cannot yet be verified from Chrome.

## Design

### Reliable client tracking

Replace the inline GA initializer and generic `/analytics.js` include with one same-origin `/site-events.js` file. The file will initialize `dataLayer` and `gtag`, configure measurement ID `G-JN2E0S7E36` once, record UTM landing information, and keep the existing reservation, menu, directions, AYCE, and social click events.

All deployable HTML pages in `public/` and the parallel Next layout will reference the same script so future edits do not leave the two site versions out of sync.

### Trackable platform links

Use the existing AYCE landing page as the destination. Each platform gets a distinct `utm_source`, `utm_medium=social`, and an evergreen `utm_campaign=ayce_always_on` value. Post-specific links may replace the campaign value with the current campaign name.

The profile destinations are:

- Instagram: `utm_source=instagram`
- Facebook: `utm_source=facebook`
- Threads: `utm_source=threads`
- TikTok: `utm_source=tiktok`
- Google Business Profile: `utm_source=google_business`
- Xiaohongshu: `utm_source=xiaohongshu` when an external profile link is supported

### Website-first post CTA

Facebook, Threads, and Google Business posts will use a direct tracked link. Instagram will use a clickable profile link and Story link sticker. TikTok will use a profile website field when the account exposes it. Xiaohongshu will use a profile-based call to action without forcing an unsupported external link.

Posts should leave one useful detail for the website: full AYCE details, all soup-base choices, menu images, directions, and reservation phone action. The website remains the source of truth rather than hiding essential price or offer conditions.

## Safety and constraints

- Do not collect personal information in custom analytics events.
- Do not change prices, hours, reservation policy, or offer terms.
- Do not bypass platform verification, account permissions, or profile-link eligibility rules.
- Google Business changes remain blocked until an account with management access is active.
- Paid advertising is deferred until attribution is verified.

## Verification

- Every deployable HTML page loads `/site-events.js` exactly once.
- A local browser visit exposes `window.dataLayer`, `window.gtag`, and `window.__hotpotAnalyticsReady`.
- A local UTM visit queues one `campaign_landing` event with the expected source, medium, and campaign values.
- Existing click events still queue for phone, menu, directions, and AYCE actions.
- HTML, lint, visual checks, and production deployment complete successfully.
