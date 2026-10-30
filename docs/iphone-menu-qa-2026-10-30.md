# iPhone menu and booking review — 2026-10-30

## Changes

- Correct the photo-menu card and preview image height: explicit HTML height attributes previously held mobile images at 480 px; CSS now scales height with width.
- Preserve complete price-bearing posters with opt-in contained thumbnails. Regular food photographs keep their existing crop.
- Refresh the photo-menu stylesheet version so existing visitors receive the layout fix.
- Version card, preview and structured-data image URLs: live browser verification showed an old cropped thumbnail surviving in cache after its public file had been updated. The release revision forces a fresh request for the complete poster.

## Verification

- Reviewed the local photo menu at widths 320, 375, 390, 430 and 844 px: no horizontal overflow; images retain a 4:3 display area, and combo prices align within each row.
- English/Traditional Chinese switching, category selection, Chinese search, image dialog opening/closing and focus return work through the rendered UI.
- Live main-menu and booking form checked at 390 px. Date/time fields, name/phone borders and submit button fit their containers. Starting booking from chat closes chat before opening the reservation modal.
- Selected a weekend date, time and four guests, entered synthetic contact data with texts disabled, and stopped before submitting. Seven-guest selection correctly changes the action to Request a table and shows the restaurant-confirmation notice. Test form was discarded.
- iPhone Duo iOS 27.1 Safari opened the live booking form. Native automated text entry was unreliable; it is not evidence of a complete real-device keyboard or CAPTCHA pass.
- The current public booking-client.js passes all 16 isolated keyboard and security-callback tests, including IME handling, token expiry, retry, stale callbacks and preservation of guest fields. No booking worker was deployed.
- All 25 related menu/chat/modal tests pass, including a pixel-content regression proving contained posters retain their top and bottom information.
- Static SEO, bilingual routes, price consistency, HTML, assistant content and attribution checks pass. No tax-price wording found in published text sources.

No real reservation or SMS was submitted. Production CAPTCHA completion and reservation persistence were not exercised.
