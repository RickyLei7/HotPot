# Table Menu QR Card Usage Guide

## Final destination

All tables use the same QR card. The encoded destination is:

`https://centrestjhotpot.ca/table-menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu`

The page is a view-only menu. Guests must order with their server; the QR code does not include a table number and cannot submit an order.

## Replacement sequence

Keep the existing `/menu/` cards on tables until the new `/table-menu/` route has passed production verification. Do not mix old and new cards during the final replacement.

Before batch printing:

1. Print one 4 × 6 inch proof at 100% scale.
2. Scan the printed proof with an iPhone and an Android phone.
3. Confirm both phones land on `/table-menu/` with the complete UTM query.
4. Confirm English loads first, Traditional Chinese switching works, photos load, and the menu contains no order-submission controls.
5. Only after both scans pass, print the full table set and remove the old `/menu/` cards.

## Generated files

- `marketing/qr-cards/table-menu-qr-card-4x6.html` — editable print source
- `marketing/qr-cards/table-menu-qr-card-4x6.png` — 1200 × 1800 raster at 300 DPI metadata
- `marketing/qr-cards/table-menu-qr-card-4x6.pdf` — 4 × 6 inch print PDF

## Release evidence

- Deployed from `main` in GitHub Actions run [33739821382](https://github.com/RickyLei7/HotPot/actions/runs/33739821382).
- Production verified at 2026-09-03 03:39 MDT: the QR destination, menu page, CSS, JavaScript, analytics script, and a representative menu image returned HTTP 200.
- Automated mobile verification passed in Chromium at 390 × 844 and 430 × 932: English default, Traditional Chinese switching, Chinese search, approved featured order, image loading, zero page overflow, and no order-submission controls.
- The committed PNG decoded to the complete UTM destination above.
- Physical 4 × 6 inch proof scans on iPhone and Android remain pending before batch printing.
