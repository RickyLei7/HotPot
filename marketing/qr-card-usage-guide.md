# Menu QR Card Usage Guide

## Current destination

All tables use the same QR card. The encoded destination is the original website menu:

`https://centrestjhotpot.ca/menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu`

Guests can browse the original English and Traditional Chinese menus, open the full-menu PDF, and book online. Dine-in orders are placed with a server.

The separate Table Menu page was retired on 2026-10-30. Previously printed `/table-menu/` QR codes continue to redirect to `/menu/` with their tracking query preserved. Do not restore the retired page or print new cards pointing to it.

## Before batch printing

1. Generate the current cards with `npm run generate:table-menu-qr`.
2. Print one 4 × 6 inch proof at 100% scale.
3. Scan the proof and confirm it opens `/menu/` with the complete UTM query.
4. Confirm the original menu, language switch, full-menu PDF, and online booking work.
5. Only after the physical proof passes, print replacement cards. Existing cards that redirect correctly can stay in use.

## Generated files

- `marketing/qr-cards/table-menu-qr-card-4x6.html` — editable print source
- `marketing/qr-cards/table-menu-qr-card-4x6.png` — 1200 × 1800 raster at 300 DPI metadata
- `marketing/qr-cards/table-menu-qr-card-4x6.pdf` — 4 × 6 inch print PDF

The historical filenames are retained for existing print workflows. The QR destination is `/menu/`.

## Verification

The retired-page removal and original-menu QR destination were released in [PR #23](https://github.com/RickyLei7/HotPot/pull/23). Public route, menu PDF, and bilingual menu checks passed on 2026-10-30. Physical proof scans are still required before batch printing.
