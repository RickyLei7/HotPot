# Safari booking keyboard and security check — 2026-10-29

## Released correction

The public booking form previously treated the Enter event used to confirm an IME candidate as ordinary field navigation. The change returns early for `event.isComposing` or Safari's final `keyCode === 229` event. Ordinary Enter still moves from name to telephone or blurs the telephone field, without implicitly submitting the form. Textarea and radio behavior remain native.

- Worker: `hotpot-seat-manager-production`.
- Baseline: `1a43f696-609e-4dcb-8cfb-dc767cdae43a` (the current 25-module measurement-enabled release at inspection).
- Released version: `f3b78313-278a-4b21-a5be-0a87ae1ab909`.
- Changed module only: `server/booking-measurement-booking.txt`.
- Public client SHA-256: `5a1a736c3b0900837f0eeda799f7d03078419e38b32f4f88226a1155f129e786`.

The 24 other modules match the baseline byte for byte. Bindings, existing assets, runtime, observability, and settings were independently compared after activation. Seven public booking pages/assets returned HTTP 200; the other public JS/CSS hashes match the baseline. The initial immediate read still returned the old edge response; an independent subsequent verification confirmed the new public hash and effective version. No further activation was required.

## Verification and limits

Eight keyboard regression checks pass against the downloaded released script. The four IME composition cases fail against the original public script. Eight isolated security checks pass against the released script: expiry, timeout, unsupported browser, callback failure, script download failure/timeout, late callbacks after closure, and selection changes. They check that submission remains blocked until a fresh token, stale tokens are ignored, retry recovers, and guest fields remain intact.

In native iOS Simulator Safari on iPhone Duo iOS 27.1, the published homepage opens the booking form; name typing, the keyboard Next action, telephone numeric keys, keyboard dismissal and formatted retained values were exercised after release. The focused fields remain visible. The form was discarded without submission. Device Hub did not provide reliable scroll gestures for reaching the lower security section; this is a test-tool limitation, not evidence of a customer scrolling failure. The iPhone 15 iOS 17 device did not provide usable touch input and is not counted as passing coverage.

This run did not complete a physical iPhone Cloudflare challenge, create a reservation, send an SMS, or verify server persistence of a new booking. Mocked security callbacks do not establish real-provider acceptance.

Both simulators started by this task were shut down; the user's original Device Hub selection was restored. No desktop browser tabs were created or closed. The existing simulator Safari tab was preserved on the homepage with no unfinished booking form.

## Maintenance and evidence

- Patch: `seat-manager/patches/booking-keyboard.mjs`.
- Regression checks: `seat-manager/e2e/booking-keyboard.mjs` and `seat-manager/e2e/booking-security-callbacks.mjs`.
- Local release evidence: `/Users/rickymini/Developer/HotPot-safari-qa-20261029/current-verified.json` and `current-candidate.json`.
- Exact baseline source copies and the narrowly scoped release helper are retained in the same local task directory; no credentials are stored in the repository.
- Native Safari proof: `/Users/rickymini/Developer/HotPot-safari-qa-20261029/safari-live-phone-keyboard.png`.

Do not redeploy the historical 19-module daily-trial builder over this 25-module release. Future work must export and compare the then-current active version before applying patches and running the client regression checks.
