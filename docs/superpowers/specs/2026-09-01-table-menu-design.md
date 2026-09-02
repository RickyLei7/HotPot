# Centre Street Japanese HotPot Table Menu Design

**Date:** 2026-09-01

**Status:** Approved design; implementation not started

**Audience:** Dine-in guests using their own phones

## 1. Objective

Create a dedicated, mobile-first digital menu reached from one restaurant-wide QR code. Guests can browse the complete menu with a photo for every item, but cannot place an order from the page. All orders continue to be handwritten by a server.

The digital menu must be easy to update when prices, availability, promotions, descriptions, or images change.

## 2. Approved Product Decisions

- Dedicated route: `https://centrestjhotpot.ca/table-menu/`
- All tables use the same menu and the same QR code; there is no table-number logic.
- The page is view-only and contains no cart, quantity picker, checkout, payment, or order-submission controls.
- English is shown by default.
- A visible control in the upper-right switches the whole menu between English and Chinese.
- Every menu item has an image.
- Existing restaurant images and approved AI/reference images may be used for the first release.
- Images must remain independently replaceable without rebuilding the menu structure.
- The approved presentation is a hybrid layout: featured offers use large cards; regular menu items use compact two-column cards.
- The approved navigation is a featured landing view plus persistent category filters that update the visible items without requiring a back-navigation step.

## 3. Guest Experience

### 3.1 Entry and persistent messaging

After scanning the QR code, the guest lands directly on the table menu. The first screen includes:

- restaurant identity;
- the English/Chinese language switch;
- a prominent view-only notice;
- featured offers in the approved order;
- search;
- persistent category navigation.

The ordering message must be unambiguous and repeated near the bottom of the interface:

> View-only menu — please order with your server.

Chinese equivalent:

> 此菜单仅供浏览，请向服务员点单。

### 3.2 Featured content order

The landing view presents featured content in this exact order:

1. AYCE
2. AYCE For Two
3. Personal Hot Pot
4. Solo / Couple Combo
5. Current Beer Special

### 3.3 Navigation

Persistent category filters:

1. Featured
2. Personal Hot Pot
3. AYCE
4. Combos
5. Appetizers
6. Rice & Noodles
7. Drinks
8. Beer
9. Add-ons

Selecting a category filters the cards in place. The guest does not navigate to a separate category page. Search matches the active language's item names and should also recognize the alternate-language names.

### 3.4 Menu cards and details

Featured items use a wide image and prominent price. Standard items appear in a two-column mobile grid and show:

- image;
- item name in the currently selected language;
- price;
- essential serving information such as `6 pcs` or `100 g`;
- concise dietary or spice indicators where relevant.

Tapping a card opens a lightweight detail panel with a larger image, full description, serving information, tags, and relevant rules. It does not expose ordering controls.

## 4. Menu Content Scope

The implementation uses the latest supplied source menus:

- `/Users/rickymini/Downloads/AYCE_For_Two_15_Soup_Bases_US_Letter_Borderless_300DPI_副本.pdf`
- `/Users/rickymini/Downloads/ayce_menu_2026-8-24_副本.pdf`
- `/Users/rickymini/Downloads/Kokanee_Corona_Beer_Special_US_Letter_Borderless_300DPI_副本.pdf`
- `/Users/rickymini/Downloads/Menu_new_drink 3.pdf`
- `/Users/rickymini/Downloads/Menu_new_hotpot 3.pdf`
- `/Users/rickymini/Downloads/Combo.png`

### 4.1 AYCE

- Individual AYCE: `$28.99` plus tax; soup base included; meat ordered through the server.
- Meat choices: AAA beef, lamb, pork, and chicken; each serving is `100 g`.
- Appetizer upgrade: `$5.99` per person; everyone at the table must upgrade.
- Nineteen appetizer choices.
- Children `100–140 cm`: `$12.99`; under `100 cm`: free; over `140 cm`: adult price.
- Dining time: 1.5 hours.
- Excess leftovers: `$5 per 100 g`.

### 4.2 AYCE For Two

- `$66.99` plus tax: two AYCE meals and any two drinks.
- `$76.99` plus tax: two AYCE meals, any two drinks, and appetizer upgrade for both guests.
- Upgrade a drink to beer for `$1` each.
- Apply the source menu's dining-time, waste, and adult-ID rules.

### 4.3 Personal Hot Pot

- Base set: `$19.99`, including one soup, vegetable set, meat, and side.
- Split pot upgrade: `$2`.
- Fifteen soup bases: Chicken & Spicy Pot, Spicy, Sukiyaki, Tom Yum Kung, Chinese Herbs, Chicken Soup, Pork Soup, Sesame Oil, Pickled Cabbage, Curry, Satay, Kimchi, Milk, Tomato, and Miso.
- Soup labels support Popular, Spicy, and Can Be Vegetarian indicators.
- Meat choices: AAA beef, lamb, pork, and chicken; extra meat is `$3.69`.
- Sides: rice, instant noodles, glass noodles, ramen, udon, and braised pork rice (`+$1`); extra side is `$2`.
- Add-ons include vegetable set `$9`, shrimp `4 pcs` `$6`, and listed `$3` items.

### 4.4 Solo / Couple Combo

- Solo Hot Pot Combo: `$24.99`, including one personal hot pot and one drink.
- Couple Hot Pot Combo: `$58.99`, including two personal hot pots, two drinks, and one appetizer.
- Split pot upgrade: `$2`.
- Prices are before tax; appetizer availability may vary.

### 4.5 Appetizers

Include all nineteen source-menu appetizers. Serving quantities and prices must match the supplied hot-pot menu. In particular, Veggie Spring Rolls are `5 pcs` at `$8.89` in the latest source.

### 4.6 Rice & Noodles

Include Taiwanese Beef Noodle, Braised Pork Rice, Taiwanese Fried Chicken or Cutlet Rice/Noodle, Wonton Soup Rice/Noodle, Unagi Rice Bowl, Beef Brisket Rice, and Sukiyaki Beef Rice with the current source-menu prices.

### 4.7 Drinks

Include:

- classic teas;
- flavoured black/green teas;
- milk teas;
- sea salt cream teas;
- specialty teas;
- yogurt drinks;
- smoothies;
- specialty sodas;
- soft drinks;
- toppings;
- sweetness and ice choices shown as reference information only.

The current `10% off drinks within any hot pot or signature meal` rule must be visible where relevant.

The specialty-soda wording is visually ambiguous in the supplied source. Implementation must verify the exact list from the original artwork or obtain owner confirmation rather than inventing names.

### 4.8 Beer

- Kokanee, `355 ml`, `5%`, `$6.95`.
- Corona Extra, `330 ml`, `4.6%`, `$7.95`.
- Dine-in only; guests must be 18+ with valid ID.

## 5. Content and Data Architecture

Use one structured menu data source shared by the source application and the generated static page. Each item record should support:

```json
{
  "id": "takoyaki",
  "category": "appetizers",
  "name": { "en": "Takoyaki", "zh": "章鱼烧" },
  "description": { "en": "", "zh": "" },
  "price": "8.89",
  "serving": { "en": "6 pcs", "zh": "6个" },
  "image": "/assets/table-menu/takoyaki.webp",
  "tags": ["popular"],
  "featuredRank": null,
  "available": true
}
```

Recommended file responsibilities:

- `content/table-menu/menu.json`: single menu-content source of truth.
- `app/table-menu/page.tsx`: maintainable application source.
- `app/table-menu/table-menu-client.tsx`: language, search, filters, and details.
- `scripts/build-table-menu.mjs`: generate/synchronize the production static page.
- `public/table-menu/index.html`: deployed static route.
- `public/table-menu/table-menu.css`: route-specific styling.
- `public/table-menu/table-menu.js`: lightweight static interactions where required.
- `public/assets/table-menu/`: optimized menu images.

The current deployment publishes `public/` directly. The source and generated production output must therefore be updated together and validated for drift.

Availability should be data-driven. An unavailable item can be hidden or visibly marked without deleting its content. Promotions should support active/inactive state and display order.

## 6. Image System

- Every visible menu item requires an image path.
- Use stable item IDs and stable filenames so an image can be replaced independently.
- Prefer WebP delivery with mobile-appropriate dimensions and compression.
- Load only the first visible images immediately; lazy-load images below the fold.
- Use responsive image candidates where the source quality supports them.
- Keep faces, text overlays, and important food details within a center-safe crop area.
- Display this global disclaimer in both languages: `Images are for reference only. Actual presentation may vary.` / `图片仅供参考，实际出品可能略有不同。`

The first release may use existing approved reference images. Replacing an image later should require changing only the image file or the item's `image` value.

## 7. QR Code and Print Assets

After the table-menu route passes production verification, regenerate the restaurant-wide QR code to point to:

`https://centrestjhotpot.ca/table-menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu`

Produce:

- 4 × 6 inch print-ready PDF;
- high-resolution PNG;
- editable HTML source.

The printed card should state that the menu is view-only and guests order with their server. A physical print must be scanned with real iPhone and Android devices before replacing existing table cards.

## 8. Accessibility and Mobile Performance

- Design first for narrow phones, including 390 px and 430 px widths.
- No whole-page horizontal overflow.
- Category navigation remains readable and touch-friendly.
- Touch targets should be at least approximately 44 px where practical.
- Text and controls require sufficient contrast over images.
- Interactive controls must work with keyboard and assistive technology.
- Modal/detail panels must have a visible close action and sensible focus behavior.
- Avoid a large client framework payload on the deployed static route.
- Search and filtering occur locally with no server round trip.
- Initial rendering must not wait for the complete image catalog.

## 9. Analytics

Preserve QR campaign parameters and track privacy-conscious interaction events already compatible with the site's analytics approach:

- table-menu view;
- language switch;
- category selection;
- menu search;
- item-detail open.

No guest identity, table number, or order data is collected.

## 10. Verification and Release

Before release:

1. Validate all names, translations, prices, quantities, rules, and promotion order against the source menus.
2. Confirm every visible item resolves to an image.
3. Test English default and full Chinese switching.
4. Test search in English and Chinese.
5. Test all category filters and item-detail panels.
6. Assert that no cart, quantity, checkout, payment, or order-submission element exists.
7. Check 390 px and 430 px layouts for wrapping, contrast, touch targets, and overflow.
8. Test on current iPhone Safari and Android Chrome.
9. Build and validate the synchronized `app/` and `public/` outputs.
10. Deploy only table-menu-related paths.
11. Verify the production HTML, CSS, JavaScript, images, language behavior, and analytics.
12. Scan the final printed QR card against the live production URL.

## 11. Repository Safety

The working tree currently contains extensive unrelated user changes. Implementation must isolate the approved table-menu work, preferably in a clean temporary worktree based on current `main`, and bring in only the explicitly needed menu sources and images. Stage exact paths and verify the final commit diff before pushing. Do not include or revert unrelated work.

## 12. Acceptance Criteria

The design is complete when:

- one QR code opens the dedicated table menu for every table;
- English is the initial language and Chinese is available from the upper-right switch;
- featured content appears in the approved `AYCE → AYCE For Two → Personal Hot Pot → Solo / Couple Combo → Beer Special` order;
- category filters and bilingual search work without page navigation;
- every item has an image and accurate menu information;
- the page clearly and repeatedly says ordering is handled by the server;
- there is no digital-ordering capability;
- image replacement does not require restructuring the menu;
- mobile, production, and physical-QR verification all pass.
