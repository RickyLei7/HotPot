# Website Reservation Modal Design

**Date:** 2026-09-14  
**Status:** Approved in chat; awaiting written-spec review  
**Owner:** Centre Street Japanese HotPot / 鼎鑽火鍋

## 1. Objective

Change the website's top-right reservation action from a full-page navigation to a same-page reservation dialog. Guests remain on `centrestjhotpot.ca`, complete a short one-page form, and see the result without losing their place on the website.

The existing reservation service at `reservation.centrestjhotpot.ca` remains the only source of booking rules, availability, confirmation state, email delivery, and customer data. This work must not copy those rules into the public website or migrate existing reservation records.

## 2. Confirmed Product Decisions

- Clicking the website's top-right `Reserve` or `網上訂位` action opens a dialog over the current page.
- The address bar remains on `centrestjhotpot.ca` while the dialog is open.
- iPhone uses a full-screen dialog; iPad and desktop use a large centered dialog.
- The form is a single compact screen whenever the available viewport and keyboard permit it.
- Date and time use native select controls so iPhone can provide its familiar wheel-style picker.
- The separate `Find a time` step is removed. Available times refresh automatically after date or party-size changes.
- English is primary and concise Traditional Chinese is secondary.
- Copy is warm and natural, not written like a system notice.
- Existing capacity, manual-review, one-hour advance, party-size, email, 10-minute hold, security, and idempotency rules remain authoritative.
- The direct `/book` page remains available as a no-JavaScript and loading-failure fallback.
- This change does not alter the staff reservation interface, database schema, existing bookings, or stored customer data.

## 3. Approaches Considered

### 3.1 Recommended: secure embedded booking mode

The website owns the dialog shell and embeds a dedicated compact route, `/embed/book`, served by the existing reservation service. The embedded page continues to call the reservation API on its own origin.

Advantages:

- one booking implementation and one set of business rules
- no cross-origin API credentials or broad CORS policy on the website
- existing Turnstile, idempotency, confirmation, and failure recovery remain in the reservation service
- the direct booking page remains independently usable

This is the approved approach.

### 3.2 Rejected: duplicate the booking form in the website

Building a second form in the website would look integrated but would duplicate validation, availability state, submission handling, and confirmation copy. The two forms could drift and produce inconsistent bookings.

### 3.3 Rejected: navigate to a website reservation page

A dedicated website route would be simpler technically but would not satisfy the requirement that the current page remain visible underneath and return to the exact previous scroll position.

## 4. Guest Experience

### 4.1 Opening

The existing reservation anchor remains a real link to the direct booking page. A client-side controller intercepts an ordinary click and opens the dialog. If JavaScript is unavailable or the dialog cannot load, the link still navigates to the working direct booking page.

Opening the dialog:

- preserves the current page and scroll position
- locks background scrolling
- moves keyboard focus to the dialog heading
- lazily loads the embedded booking page so normal website visits do not pay its loading cost
- exposes `aria-haspopup="dialog"` and a clear accessible label

### 4.2 One-page form

The compact form contains, in this order:

1. date
2. time
3. party size, with direct buttons for 1 through 6 guests
4. name
5. mobile number
6. email
7. one short 10-minute hold note
8. one primary reservation action

There is no separate search screen. Selecting a date or party size refreshes the time select automatically. The currently selected time is retained when it remains available; otherwise the form asks the guest to choose again.

Unavailable times do not appear. A time requiring restaurant review remains selectable and is labelled `Restaurant confirmation needed / 需由餐廳確認` without a long policy paragraph.

### 4.3 Warm bilingual copy

The default copy is:

- Heading: `Reserve a Table / 預訂座位`
- Welcome: `We look forward to welcoming you. / 期待您的光臨。`
- Fields: `Date 日期`, `Time 時間`, `Guests 人數`, `Name 姓名`, `Mobile 電話`, `Email 電郵`
- Primary action: `Reserve / 預訂`
- Review note: `We'll confirm this time with you by email. / 此時段需由餐廳確認，我們會以電郵回覆您。`
- Larger parties: `For 7 or more guests, please call 403-455-3188. We'll be happy to help. / 7位或以上，歡迎致電本店，我們會為您安排。`
- Hold note: `We'll hold your table for 10 minutes. Running late? Just give us a call. / 我們會為您保留座位10分鐘。如會遲到，請致電告訴我們。`

Long explanations about lead time, private links, and request mechanics are removed from the main form. Relevant guidance appears only when it is needed.

### 4.4 Results

An automatically confirmed reservation shows:

`You're all set! We look forward to seeing you.`  
`訂位完成，期待您的光臨！`

A reservation awaiting staff confirmation shows:

`Thank you! We've received your request and will email you once it's confirmed.`  
`謝謝您！我們已收到訂位，確認後會以電郵通知您。`

The result keeps the essential booking facts and provides `Back to website / 返回網站`. Management and cancellation links remain available without exposing the private link in analytics or parent-window messages.

## 5. Responsive Layout

### 5.1 iPhone

- Use a fixed full-screen surface sized with dynamic viewport units, not legacy `100vh`.
- Respect top and bottom safe-area insets.
- Keep the dialog heading and close control visible while the form area scrolls when the keyboard reduces the viewport.
- Use one controlled vertical scroller and prevent horizontal movement.
- Inputs use at least 16px text to avoid Safari's automatic focus zoom.
- Touch targets are at least 44 CSS pixels.
- The background website cannot scroll while the dialog is open.

### 5.2 iPad and desktop

- Center a surface approximately 600–640px wide.
- Limit height to the visible viewport and allow only the form area to scroll when necessary.
- Keep the same field order and wording as iPhone; do not create a separate workflow.
- Use the website's wine red and gold as restrained accents, with a quiet light form surface for readability.

The distinctive element is a compact selection summary near the action button showing the chosen date, time, and party size. It is functional, not decorative, and uses the restaurant's gold accent.

## 6. Dialog Closing Rules

- The close control is always visible in the top-right corner.
- Clicking the shaded backdrop does not close the dialog.
- Pressing Escape closes an untouched form on hardware-keyboard devices.
- If a guest has entered or changed information, closing requires one short confirmation so unfinished details are not lost accidentally.
- After a successful booking, the dialog closes only when the guest chooses `Back to website` or the visible close control.
- Closing restores focus to the same Reserve link and returns to the exact previous scroll position.

## 7. Component Boundaries

### 7.1 Website

Add a small client component responsible only for:

- opening and closing the dialog
- focus management and background-scroll locking
- rendering the embedded page
- handling a restricted set of lifecycle messages
- falling back to the direct booking URL when loading fails

`SiteNav` continues to own placement and localized button labels. Search-engine structured data continues to point to the directly accessible `https://reservation.centrestjhotpot.ca/book` page because crawlers cannot operate a client-side dialog reliably.

### 7.2 Reservation service

Add `/embed/book` as an embedded presentation mode of the existing booking page. This mode:

- removes duplicate outer branding and excess explanatory text
- renders the approved one-page form
- preserves the same API, validation, availability, Turnstile, and result logic
- reports only generic lifecycle state to the parent window

The direct `/book` experience continues to work without a parent window.

## 8. Cross-Origin Message Contract

The iframe and parent exchange only these lifecycle events:

- `booking:ready`
- `booking:dirty` with a boolean value
- `booking:completed` with `confirmed` or `pending`
- `booking:request-close`

Both sides validate the exact other origin before accepting a message. Messages never contain a guest's name, phone number, email, booking token, private management URL, or full reservation record.

The website does not receive or store booking form data. All personal information is submitted directly from the embedded reservation page to the reservation service.

## 9. Security Headers

The reservation worker currently denies all framing with both `frame-ancestors 'none'` and `X-Frame-Options: DENY`. Those protections remain unchanged for the staff app, guest queue pages, direct booking pages, and every unrelated route.

Only `/embed/book` may be framed, and only by the exact canonical production origin:

- `https://centrestjhotpot.ca`

Before implementation, the production hostname is checked once. If `www.centrestjhotpot.ca` redirects to the canonical non-`www` hostname, it is not added to the allowlist. The embedded response uses a route-specific Content Security Policy with the canonical-origin allowlist. It omits `X-Frame-Options` because that header cannot express a modern cross-origin allowlist. Turnstile's existing challenge origin remains allowed. No wildcard frame ancestor and no broad cross-origin API policy is introduced.

The website's own security policy must allow frames only from `https://reservation.centrestjhotpot.ca`.

## 10. Loading and Error Handling

- Show a calm loading state inside the dialog while the embedded form initializes.
- If initialization takes too long or fails, show two actions: retry in the dialog or open the direct booking page.
- Availability errors retain the selected date and party size.
- Submission errors retain every entered field.
- Disable the primary action while submission is in progress.
- Reuse the existing idempotency key so a retry cannot create a duplicate booking.
- Never describe an uncertain network result as a failed reservation. Offer `Check booking status / 查看訂位狀態` using the existing recovery flow.

## 11. Analytics and Privacy

Record only non-personal funnel events already compatible with website analytics:

- reservation dialog opened
- compact form became ready
- booking completed as confirmed or pending
- dialog loading failed

Do not send names, phone numbers, email addresses, booking numbers, private URLs, selected dates, or selected times to website analytics.

## 12. Verification

### 12.1 Automated checks

- website component tests for open, close, dirty-form confirmation, focus restoration, and fallback navigation
- reservation client tests for automatic time refresh and one-page state preservation
- worker tests proving only the embedded route allows the exact website origin to frame it
- origin-validation tests for every parent/iframe message
- existing reservation domain, worker, capacity, idempotency, and email tests remain green

### 12.2 Browser checks

Test the complete flow at minimum on:

- iPhone narrow viewport
- iPhone large viewport
- iPad mini portrait
- iPad mini landscape
- desktop Safari or Chromium

For each size, verify opening from the top navigation, native select behavior, keyboard appearance, no horizontal overflow, background scroll lock, error retention, confirmed result, pending result, close restoration, direct-page fallback, and both website languages.

### 12.3 Production sequence

1. Deploy the reservation service's embedded route first.
2. Verify its framing policy allows only the production website.
3. Deploy the website dialog and updated reservation links.
4. Run one production test booking using designated test data and remove only that test record afterward.
5. Confirm the booking appears in the staff system and the expected email state is recorded.

No database migration is required. If the website deployment must be rolled back, the Reserve anchor returns to the still-working direct booking page. Existing and newly created reservation data remain in the reservation service throughout.

## 13. Acceptance Criteria

- A guest can open Reserve, choose date, time, and 1–6 guests, enter contact details, and submit without leaving the visible website.
- The address bar remains on `centrestjhotpot.ca` while the dialog is open.
- The ordinary successful path has no `Find a time` screen or other intermediate page.
- The form is readable and stable on iPhone and iPad mini with the on-screen keyboard open.
- The dialog does not scroll horizontally or move the website behind it.
- Manual-review times are clearly but gently identified.
- Closing an edited form cannot silently discard data.
- Failed or uncertain submissions retain input and cannot create duplicates through repeated taps.
- All bookings continue to enter the existing staff system and customer database.
- Existing reservations and customer data are not migrated, deleted, or rewritten.
- Direct booking remains available if the dialog cannot load.
- Unrelated reservation-system pages remain protected against framing.
