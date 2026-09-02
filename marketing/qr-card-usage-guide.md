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

Production deployment evidence, device names, and the physical proof result should be recorded here after release.
