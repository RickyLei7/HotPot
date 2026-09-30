# Booking attribution production patch — 2026-09-30

The independent reservation app was deployed from source newer than the repository's `seat-manager/` directory. Do not deploy that old directory over production. This patch operates on a verified snapshot of live public assets and leaves backend modules, bindings, schemas, customer records, routes and scheduled jobs intact.

## Changes

- Read ordinary UTM parameters and Google click identifiers on direct booking entry, in addition to the existing internal attribution keys.
- Capture recognizable referrers and preserve attribution across booking-page reloads for 30 minutes. No signal becomes `unknown`, rather than invented paid attribution.
- An untagged Facebook click ID is social traffic, not evidence of paid advertising. Explicit paid campaign markers retain paid credit.
- Add a read-only staff report under **More / 更多 → 订位来源与人数**, grouped by source, medium, campaign and content. Show submitted, awaiting approval, confirmed, seated and cancelled/no-show groups and reservation guest counts.
- Pending or alternative-offered approvals are not confirmed, even when the record's underlying status is `confirmed`. Deduplicate by reservation ID.
- Historical blank attribution remains unknown. Seated guest totals use reservation party size, not an independently measured actual attendance count. No advertising spend feed is connected; cost formulas require actual spend for the same period and campaign.

## Reproducible local verification

`node --test operations/booking-source-20260930/test.mjs tests/source-attribution.test.mjs`

The compressed fixture contains four public source files from the verified production baseline, with Cloudflare's injected browser challenge removed from HTML outside the fixture. Tests create a temporary asset tree, apply `patch.mjs` and clean it up. `BOOKING_ASSET_ROOT` can instead target downloaded production files for verification.

`node operations/booking-source-20260930/patch.mjs /path/to/verified/public`

Apply only to a fresh snapshot. The patch fails when expected code markers do not match. After a partial failure, recreate the snapshot before retrying.

## Production evidence

- Main-site navigation preservation: PR #5, merged commit `8b3354a630ea5291752b6c087cefdd5a5fda13ec`; deployed script SHA-256 matched the repository.
- An independent backend deployment appeared during this task: `d8d51fdf-0446-4342-8013-f15247d2d3df`. Its expired-alternative SMS check and conditional snapshot response were preserved. The original content/v2 endpoint was insufficient for retrieving an active historical version; the version-specific beta endpoint with `include=modules` supplied the exact code.
- Final reservation version: `24eba342-8ea1-481c-899f-ff96d625dcfd`, deployed at 100%.
- Final backend script etag, every binding and runtime configuration exactly matched baseline `d8d51fdf-0446-4342-8013-f15247d2d3df` before deployment.
- Four public files changed: `client/booking-client.js`, `domain/booking-attribution.js`, `client/app.js`, `sw.js`. All 38 public assets were checked against live responses (stripping only Cloudflare's injected challenge from HTML).
- No test customer reservations or Walk-in records were created; no database migration or record rewrite was performed.

Rollback: deploy baseline `d8d51fdf-0446-4342-8013-f15247d2d3df` using Wrangler versions deploy, preserving current bindings and non-versioned settings. Re-read the current production version first to avoid undoing later work.
