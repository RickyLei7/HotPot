# Booking security recovery — 2026-10-20

The public booking application is deployed from the separate, reviewed daily
release builder in `Documents/HotPot/tmp/pos-daily-release-20261016/daily-build.mjs`.
The older `seat-manager/src` snapshot in this checkout is not that release.

`booking-security.mjs` updates only the reviewed booking client. It offers retry
after challenge expiry, timeout or unsupported-browser failures, clears obsolete
security messages after recovery, and preserves generation checks. It does not
change Turnstile keys, verification, booking APIs, notifications or data.
It rejects unexpected source instead of applying an unreviewed replacement.

Run the isolated acceptance against a prepared release asset fixture:

```sh
BOOKING_QA_FIXTURE=/path/to/reviewed/assets \
BOOKING_QA_PACKAGE=/path/to/package-with-matching-playwright/package.json \
node seat-manager/e2e/booking-security.mjs
```

The check covers Chrome and WebKit at 390, 768 and 1440 pixels, directly and
inside the production iframe sandbox. All booking APIs are local fixtures.
Set `BOOKING_QA_REAL_TEST_KEY=1` to load the real Cloudflare widget using its
official always-pass **test** key in those isolated pages. The production key
is never replaced. Confirmation here is simulated; real Safari verification
must be checked separately.

## Booking copy — 2026-10-20

`booking-copy.mjs` applies reviewed text replacements to the current booking
client and HTML. Review-required slots say `Request a table / 提交訂位` and
explicitly await restaurant confirmation. Immediate bookings keep `Book now`.
The changes clarify result, link, edit/cancel, retry and form hints without
changing consent, security, payloads or reservation state transitions.

The persistent daily builder applies the client copy after `bookingSecurity`
and applies the HTML copy to `/book.html`. Its existing preservation test
asserts both exact transformations. The recovered source has the same copy
changes while retaining its separate, previously pending paused-booking UI.
Release evidence and isolated flow checks are retained in
`Documents/HotPot/tmp/reservation-booking-copy-20261020-release/`.
