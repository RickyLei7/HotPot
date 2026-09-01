# Hotpot Seat Manager Online Design

**Date:** 2026-09-01
**Status:** Approved in chat; awaiting written-spec review
**Owner:** Centre Street Japanese HotPot / 鼎鑽火鍋

## 1. Objective

Upgrade the existing offline Hotpot Seat Manager into a secure staff-only online application shared by Android tablets, iPads, phones, and computers. All open devices must see the same Walk-in, reservation, occupancy, and table state in near real time while preserving the existing restaurant rules and visible workflows.

The production application will use:

- `https://reservation.centrestjhotpot.ca/`
- Cloudflare Workers for static assets, API routing, authentication, and security headers
- one SQLite-backed Cloudflare Durable Object for the restaurant's persistent state, transactions, and realtime WebSocket room
- the Cloudflare Workers Free plan for the first release

The existing public website at `https://centrestjhotpot.ca/` and its GitHub Pages deployment remain independent and unchanged.

## 2. Confirmed Product Decisions

- This is an internal staff tool, not a public customer reservation form.
- The first online release uses one shared four-digit staff PIN.
- The PIN is entered once per twelve-hour staff session.
- The production database starts empty. No local QA or screenshot data is migrated.
- The application does not collect employee names, personal Apple accounts, or personal device-profile data.
- An employee audit trail is excluded from the first release.
- Existing bilingual labels and workflows remain unless the user explicitly changed them during review.
- The fixed visible version label remains `v2026.08.31` until a later explicit version decision.

## 3. Existing Behavior to Preserve

The current scheduling and table-domain modules remain the source of truth. The online work may reorganize files but must preserve the behavior covered by the existing test suite.

### 3.1 Tables and seating

- Ten tables with capacities `4, 4, 4, 6, 6, 4, 4, 4, 2, 2`, for 40 seats total.
- Main table cards display only large numeric labels `1` through `10`.
- Dining time is 90 minutes, followed by a 10-minute turn buffer.
- Two guests prefer a two-seat table, four prefer a four-seat table, and six prefer a six-seat table.
- A larger waiting party must not block a smaller party that can use a currently available table.
- Imminent confirmed reservations protect the capacity they need.
- Staff can override recommendations and manually select valid empty tables.
- Parties of 7 through 16 may use joined tables only after staff confirmation.
- Parties of 17 or more remain manual cases and are not auto-assigned.
- Walk-ins and today's eligible reservations can be dragged to valid tables with mouse or touch. Valid and invalid targets are highlighted, and seating requires confirmation.
- The `Arrived / 已到店` reservation action remains available before seating.

### 3.2 Walk-in queue

- Name may be blank.
- Blank names use `无名客人 #1`, `无名客人 #2`, and so on. Older stored `无名字客人 #N` values are normalized for display.
- Guest names are visually highlighted.
- Phone numbers appear directly on the card; there is no call-launch button.
- Live wait duration includes seconds.
- `Notify / 通知` records the notification time and shows elapsed time on the card.
- The notified return window is five minutes. After five minutes, the system may recommend the next eligible party.
- Notify again, Seat, and Left actions remain available.

### 3.3 Reservations

- Reservations support today and future dates.
- Reservation phone numbers appear directly on cards.
- The no-show grace period remains 15 minutes.
- Active reservations can be marked Arrived, Seated, No-show, or Cancelled.
- Active reservations can be edited for name, phone, party size, date, and time.
- Changing a confirmed reservation to more than six guests requires table-joining confirmation again; changing only name, phone, or time preserves an existing confirmation.
- Today and upcoming sections show group and guest totals.
- The main page previews at most five future reservations so the dashboard does not grow indefinitely.
- The 14-day trend includes zero-reservation days, highlights the busiest day, and opens a selected day's list.
- Reservations beyond 14 days remain accessible from the complete future list.

### 3.4 iPad-oriented interface

- Walk-in and reservation sections remain visually distinct with bright colored panel headers.
- Text, buttons, phone numbers, guest names, and table status must remain readable on an iPad mini in landscape orientation.
- Buttons must provide touch targets of at least 44 CSS pixels.
- Long names, dining-start labels, phone numbers, and action rows must wrap without escaping their cards.
- Compact previews and modal statistics prevent the main page from becoming excessively long.

## 4. Architecture

### 4.1 Project isolation

The online manager is a separate Cloudflare Worker application under a dedicated `seat-manager/` source directory. It is not copied into the public website's `public/` output and is not added to the existing public site's GitHub Pages artifact. Deployment configuration targets only the reservation subdomain.

No production secret is committed to Git. Local secret files are ignored.

### 4.2 Request flow

1. The browser requests the application shell from the Worker.
2. The Worker validates the staff session for all protected API and WebSocket routes.
3. Authorized requests are routed to the restaurant's single Durable Object.
4. The Durable Object reads or writes its private SQLite database.
5. Successful writes commit before a realtime message is sent.
6. The Durable Object broadcasts the new revision and current snapshot to all authenticated connected devices.

A single Durable Object is appropriate because the system represents one restaurant. It gives all commands one serialization point, preventing two devices from silently assigning the same table.

### 4.3 Client structure

The client keeps these boundaries:

- pure domain modules for scheduling, wait estimates, table combinations, status transitions, and table labels
- a remote repository interface for asynchronous reads and commands
- an authentication/session client
- a realtime connection client
- UI rendering and forms
- connection-state presentation

The current `localStorage` repository remains available only in explicit local/offline development mode. Production code uses the remote repository.

### 4.4 Server structure

The Worker exposes same-origin endpoints for:

- PIN login, session check, and logout
- initial restaurant snapshot
- Walk-in commands
- reservation commands
- seating and clearing commands
- WebSocket connection and reconnect
- an authenticated JSON backup export

The Durable Object owns schema initialization, command validation, transactions, record versions, restaurant revision, session records, rate-limit records, and broadcast messages.

## 5. Authentication and Security

### 5.1 PIN provisioning

The production PIN is never requested in chat, written in source code, placed in documentation, or included in a browser bundle.

During deployment, a local masked prompt asks the owner to enter the four-digit PIN. The setup tool generates:

- a random salt
- a random server-only pepper
- a keyed, salted HMAC-SHA-256 verifier over the PIN and salt
- a random PIN-version identifier

The verifier, salt, pepper, and PIN-version identifier are uploaded as encrypted Cloudflare Worker secrets. The plaintext PIN is held only in process memory for the duration of the prompt and is not logged or written to disk.

Because a four-digit PIN has low entropy, the secret pepper and online rate limiting are mandatory. The security model does not rely on the small PIN space alone.

Changing or recovering the PIN uses the same masked local deployment tool. Every reset generates a new PIN-version identifier. Each session records the identifier under which it was created, so a version mismatch immediately invalidates every older session without requiring the plaintext PIN.

### 5.2 Login rate limiting

- A random non-personal device identifier is created in the browser for login throttling.
- The server combines that identifier with a peppered hash of the source network address; it never stores a raw IP address.
- Five failed attempts within 15 minutes lock that source for 15 minutes.
- Continued failures use progressively longer cooldowns.
- Rate-limit entries expire automatically.
- Successful login clears the short-term failure counter for that source.
- Error messages do not reveal whether a particular digit or partial value was correct.

### 5.3 Session design

- A successful login creates a cryptographically random 256-bit session token.
- Only a SHA-256 hash of the token is stored server-side.
- The session stores the current PIN-version identifier and is rejected after a PIN reset.
- The browser receives the token only in an `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` cookie.
- The session expires after 12 hours.
- Logout deletes the current server session and expires the cookie.
- State-changing requests require an allowed same-origin `Origin` header and a session-bound CSRF token.
- API and WebSocket authorization is enforced server-side for every read and write.
- Responses containing restaurant data use `Cache-Control: no-store`.
- The application uses a restrictive Content Security Policy and does not load third-party scripts.

## 6. Data Model

SQLite tables store the existing fields plus synchronization metadata.

### 6.1 Walk-ins

- `id`
- `restaurant_id`
- `name`
- `phone`
- `party_size`
- `status`
- `notified_at`
- `table_plan_confirmed`
- `created_at`
- `updated_at`
- `version`

### 6.2 Reservations

- `id`
- `restaurant_id`
- `name`
- `phone`
- `party_size`
- `reserved_at`
- `status`
- `table_plan_confirmed`
- `created_at`
- `updated_at`
- `version`

### 6.3 Occupancies

- `table_id`
- `party_id`
- `party_kind`
- `party_name`
- `party_size`
- `seated_at`
- `expected_end_at`
- `created_at`
- `updated_at`
- `version`

An occupancy has one row per occupied physical table. A unique constraint prevents a table from having two active occupancies.

### 6.4 System records

- one restaurant metadata row containing the current global revision
- hashed sessions with expiry timestamps
- temporary hashed login-rate-limit entries
- idempotency keys for recently accepted commands

All stored timestamps are epoch milliseconds interpreted in `America/Edmonton` for restaurant-day calculations.

## 7. Command and Concurrency Model

The browser sends domain commands rather than replacing the entire database snapshot. Examples include `createWalkin`, `notifyWalkin`, `createReservation`, `editReservation`, `seatParty`, and `clearTable`.

Each command contains:

- a unique idempotency key
- the target record ID and expected record version when editing existing state
- only the fields required by that command

Inside one SQLite transaction, the server:

1. validates authentication and restaurant scope
2. checks the idempotency key
3. reloads the current target records
4. runs the relevant shared domain rules and table checks
5. verifies record versions and occupancy constraints
6. applies the change
7. increments changed record versions and the restaurant revision
8. commits

Independent creates may succeed even if another device has advanced the global revision. Conflicting edits, seating, or clearing return HTTP `409` with the current snapshot. The client keeps the user's unsaved form values visible and explains what changed.

Repeated delivery of a previously accepted command returns its existing result instead of creating a duplicate.

## 8. Realtime Synchronization

After login, the browser fetches a complete authorized snapshot and opens an authenticated WebSocket to the restaurant Durable Object.

After every committed command, the server broadcasts:

- the new restaurant revision
- the authoritative current snapshot

The dataset is small, so broadcasting the complete snapshot is intentionally preferred over complex client-side merge logic for the first release.

The interface displays:

- `Online / 在线`
- `Reconnecting / 重新连接`
- `Offline / 离线`

If the socket drops, the client reconnects with capped exponential backoff. After reconnecting, it fetches the full current snapshot before enabling write actions.

## 9. Offline and Failure Behavior

- The PWA service worker caches only the application shell, icons, and static styles/scripts.
- API responses and customer data are never placed in the service-worker cache.
- While an already-open page is offline, it may continue showing its last in-memory snapshot.
- Write actions are disabled while offline; commands are not blindly queued.
- An open form keeps its entered values in memory when a request fails.
- A failed command shows a clear Retry action.
- A `409` conflict refreshes the authoritative snapshot and asks staff to confirm the operation again when necessary.
- A server validation error identifies the affected party or table without exposing internal details.
- If the session expires, the PIN screen appears and the unfinished form remains in memory until login succeeds or the page is closed.

This design prioritizes avoiding duplicate seating over accepting offline writes.

## 10. Fresh Production Initialization and Backups

Production initialization creates only:

- the schema
- the single restaurant metadata row
- the fixed table configuration required by the domain rules

It creates no Walk-ins, reservations, occupancies, or screenshot examples. Current local test data remains local and is not imported.

The authenticated JSON export endpoint provides a manual operational backup. Cloudflare's SQLite-backed Durable Object point-in-time recovery remains an infrastructure recovery layer; it does not replace the export format.

## 11. Local Development

Local development must not require production credentials.

- The existing pure domain tests run unchanged.
- Local Worker and Durable Object emulation use test-only secrets.
- Local online-mode tests exercise the asynchronous repository, sessions, SQLite schema, commands, and WebSockets.
- Explicit offline-MVP mode can still use the existing `localStorage` repository for safe visual comparison.
- Production secrets and production storage are never used by default during local tests.

## 12. Testing Strategy

### 12.1 Existing regression coverage

The current 30 tests remain green, including table capacity, recommendations, five-minute notification expiry, anonymous-name normalization, reservation dragging, joined tables, statistics, storage, and numeric table labels.

### 12.2 New automated coverage

- correct PIN login and wrong-PIN rejection
- five-attempt lockout and cooldown expiry
- session cookie properties, expiry, logout, and PIN-reset invalidation
- authorization required on all data and WebSocket routes
- cross-restaurant scope rejection even though the first deployment has one restaurant
- CSRF and disallowed-origin rejection
- schema initialization with no QA data
- asynchronous repository behavior
- idempotent command retry
- two devices attempting to seat different parties at the same table
- two devices editing the same reservation version
- joined-table atomic occupancy writes
- broadcast only after successful commit
- realtime snapshot propagation
- reconnect followed by authoritative reload
- offline write prevention and retained form input
- API errors and retry presentation

### 12.3 Rendered device checks

Test at minimum:

- iPad mini landscape
- Android tablet landscape
- narrow phone portrait
- desktop browser

Checks cover first viewport readability, touch targets, wrapping, drag-and-drop with touch and mouse, modal overflow, connection-state visibility, PIN entry, PWA installation, and absence of console errors.

### 12.4 Acceptance flow

1. Open the same staging URL on an Android tablet, iPad, and computer.
2. Enter the shared PIN.
3. Add a Walk-in on one device and see it on the other two without refresh.
4. Notify the party and verify the displayed time and five-minute state everywhere.
5. Drag a Walk-in and a reservation to valid tables using touch and mouse.
6. Attempt a simultaneous table assignment and verify that only one succeeds.
7. Add and edit a future reservation and verify totals everywhere.
8. Disconnect and reconnect one device and verify its connection state and authoritative reload.
9. Refresh and reopen each device and verify server persistence.
10. Confirm that wrong PIN attempts are rate-limited and that no secret or PIN verifier appears in browser assets or network responses.

## 13. Deployment Sequence

1. Create the separate Cloudflare Worker project and SQLite-backed Durable Object in the existing Cloudflare account.
2. Deploy a development environment using non-production secrets.
3. Run unit, integration, concurrency, realtime, and rendered-device tests.
4. Deploy a staging `workers.dev` URL.
5. Have the owner test staging from iPad, Android, and computer.
6. Run the masked PIN provisioning tool on the owner's computer.
7. Confirm the production database is empty.
8. Attach `reservation.centrestjhotpot.ca` as the Worker custom domain and verify HTTPS.
9. Repeat the complete cross-device acceptance flow on the production domain.
10. Add the production web app to each device home screen.

No step changes or replaces the `centrestjhotpot.ca` public website deployment.

## 14. Free-Tier Operations

The first release remains within the Cloudflare Workers Free plan. The restaurant's expected request volume and connected-device count are far below the current free limits. The implementation will expose no paid third-party dependency.

Usage is checked after staging and after the first production week. If a free limit is approached, the owner is informed before any paid-plan change. The application does not automatically opt into a paid plan.

## 15. Explicitly Deferred

- individual employee accounts or roles
- employee action/audit history
- public customer self-booking
- SMS or automated phone notifications
- marketing use of customer names or phone numbers
- multiple restaurant locations
- offline queued writes
- native App Store or Google Play packages
- paid infrastructure

These items require separate approval and must not be added implicitly during the first online release.

## 16. Completion Criteria

The online upgrade is complete only when:

- all existing and new automated tests pass
- the staging acceptance flow passes on iPad, Android, and computer
- the production URL works over HTTPS
- PIN, session, rate-limit, origin, and authorization controls are verified
- cross-device writes appear without manual refresh
- simultaneous table assignments cannot create duplicate occupancy
- reconnect and failure states are clear to staff
- production starts with no QA data
- the public restaurant website is unchanged
