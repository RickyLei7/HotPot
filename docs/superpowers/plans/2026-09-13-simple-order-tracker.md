# Simple Order Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, mobile-first order-date tracker at an isolated subdomain, protected by a four-digit PIN, with manual reference intervals and transparent interval learning from order history.

**Architecture:** Add a standalone Cloudflare Worker application under `inventory/`, separate from the public restaurant app. The Worker serves static browser assets, exposes a small JSON API, stores items and order events in its own D1 database, and signs session cookies with Web Crypto. Pure date and learning rules stay in a dependency-free module tested with Node's built-in test runner.

**Tech Stack:** Cloudflare Workers, D1/SQLite, standard browser HTML/CSS/JavaScript, Web Crypto, Node.js 22 built-in test runner, Wrangler 4.92.0 already installed in the repository.

**Spec:** `docs/superpowers/specs/2026-09-13-simple-order-tracker-design.md`

## Global Constraints

- Keep all runtime code, assets, migrations, and tests under `inventory/`; do not add an inventory route or navigation entry to the public restaurant website.
- Use one four-digit PIN without creating employee accounts.
- Never place the PIN or session signing secret in source code, static assets, D1, or Git.
- Store every order event and use archive/restore for normal item removal.
- Use at most the five most recent intervals and their median for the learned interval.
- Require at least three order records before exposing a learned interval.
- A manual reference interval remains authoritative until the user accepts a suggestion.
- Do not add inventory quantity, purchasing, supplier, pricing, notification, barcode, role, chart, or machine-learning features.

---

## File Map

- `inventory/wrangler.jsonc`: Worker, static asset, D1, and migration configuration.
- `inventory/migrations/0001_initial.sql`: Items, order events, and login-attempt tables and constraints.
- `inventory/src/domain.mjs`: Date validation, elapsed-day math, median learning, suggestions, and list sorting.
- `inventory/src/auth.mjs`: PIN validation, signed session cookies, login throttling helpers, and cookie parsing.
- `inventory/src/db.mjs`: D1 queries and row-to-view-model assembly.
- `inventory/src/worker.mjs`: HTTP routing, authentication boundary, validation, JSON responses, CSV export, and static asset fallback.
- `inventory/public/index.html`: Login shell, order list, item editor, and history dialog.
- `inventory/public/app.js`: Browser state, API calls, rendering, forms, undo, and history actions.
- `inventory/public/styles.css`: Mobile-first presentation and accessible status styling.
- `inventory/public/manifest.webmanifest`: Add-to-home-screen metadata.
- `inventory/.gitignore`: Local secrets and Wrangler state exclusions.
- `inventory/test/domain.test.mjs`: Date, learning, suggestion, and sorting tests.
- `inventory/test/auth.test.mjs`: PIN format and signed-session tests.
- `inventory/test/worker.test.mjs`: Request-level tests with in-memory environment doubles.
- `inventory/README.md`: Local setup, secret creation, migration, testing, deployment, and rollback instructions.

---

### Task 1: Domain Rules and Database Schema

**Files:**
- Create: `inventory/migrations/0001_initial.sql`
- Create: `inventory/src/domain.mjs`
- Create: `inventory/test/domain.test.mjs`

**Interfaces:**
- Produces: `parseISODate(value: string): Date`
- Produces: `daysBetween(fromISO: string, toISO: string): number`
- Produces: `learnedInterval(orderDates: string[]): number | null`
- Produces: `suggestInterval(manualDays: number | null, learnedDays: number | null): number | null`
- Produces: `toItemView(item: object, orderDates: string[], todayISO: string): object`
- Produces: `sortItemViews(items: object[]): object[]`

- [ ] **Step 1: Write failing domain tests**

Create `inventory/test/domain.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  daysBetween,
  learnedInterval,
  suggestInterval,
  toItemView,
  sortItemViews,
} from "../src/domain.mjs";

test("daysBetween handles month and year boundaries in UTC", () => {
  assert.equal(daysBetween("2025-12-31", "2026-01-02"), 2);
});

test("learnedInterval uses the median of the five newest gaps", () => {
  const dates = ["2026-08-01", "2026-08-04", "2026-08-08", "2026-08-12", "2026-08-19", "2026-08-23"];
  assert.equal(learnedInterval(dates), 4);
});

test("learnedInterval stays null before three records", () => {
  assert.equal(learnedInterval(["2026-09-01", "2026-09-05"]), null);
});

test("suggestion requires two days and twenty percent difference", () => {
  assert.equal(suggestInterval(7, 5), 5);
  assert.equal(suggestInterval(10, 9), null);
  assert.equal(suggestInterval(30, 28), null);
});

test("manual interval controls due date while learning remains visible", () => {
  const view = toItemView(
    { id: 1, name: "Beef rolls", manual_interval_days: 7, notes: "", active: 1 },
    ["2026-09-01", "2026-09-05", "2026-09-10"],
    "2026-09-13",
  );
  assert.equal(view.learnedIntervalDays, 5);
  assert.equal(view.effectiveIntervalDays, 7);
  assert.equal(view.dueDate, "2026-09-17");
  assert.equal(view.daysUntilDue, 4);
});

test("items sort by due date and learning items stay after dated items", () => {
  const sorted = sortItemViews([
    { id: 1, dueDate: null, daysUntilDue: null, name: "Learning" },
    { id: 2, dueDate: "2026-09-20", daysUntilDue: 7, name: "Later" },
    { id: 3, dueDate: "2026-09-12", daysUntilDue: -1, name: "Overdue" },
  ]);
  assert.deepEqual(sorted.map((item) => item.id), [3, 2, 1]);
});
```

- [ ] **Step 2: Run tests and verify the missing module failure**

Run: `node --test inventory/test/domain.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `inventory/src/domain.mjs`.

- [ ] **Step 3: Implement the pure domain module**

Create `inventory/src/domain.mjs` with UTC-only date parsing, sorted unique order dates, recent-gap median calculation, suggestion thresholds, and `status` values `overdue`, `today`, `soon`, `later`, or `learning`. `soon` means 1–3 days until due. `toItemView` must return camel-cased browser data while retaining the item's database ID, name, notes, and active state.

```js
const DAY_MS = 86_400_000;

export function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid date");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid date");
  }
  return date;
}

export function daysBetween(fromISO, toISO) {
  return Math.round((parseISODate(toISO) - parseISODate(fromISO)) / DAY_MS);
}

export function learnedInterval(orderDates) {
  const dates = [...new Set(orderDates)].sort();
  if (dates.length < 3) return null;
  const gaps = dates.slice(1).map((date, index) => daysBetween(dates[index], date)).slice(-5).sort((a, b) => a - b);
  const middle = Math.floor(gaps.length / 2);
  return gaps.length % 2 ? gaps[middle] : Math.round((gaps[middle - 1] + gaps[middle]) / 2);
}

export function suggestInterval(manualDays, learnedDays) {
  if (!manualDays || !learnedDays) return null;
  const difference = Math.abs(manualDays - learnedDays);
  return difference >= 2 && difference / manualDays >= 0.2 ? learnedDays : null;
}

function addDays(dateISO, days) {
  return new Date(parseISODate(dateISO).valueOf() + days * DAY_MS).toISOString().slice(0, 10);
}

export function toItemView(item, orderDates, todayISO) {
  const dates = [...new Set(orderDates)].sort();
  const lastOrderDate = dates.at(-1) ?? null;
  const learnedIntervalDays = learnedInterval(dates);
  const effectiveIntervalDays = item.manual_interval_days ?? learnedIntervalDays;
  const dueDate = lastOrderDate && effectiveIntervalDays ? addDays(lastOrderDate, effectiveIntervalDays) : null;
  const daysUntilDue = dueDate ? daysBetween(todayISO, dueDate) : null;
  const status = daysUntilDue === null ? "learning" : daysUntilDue < 0 ? "overdue" : daysUntilDue === 0 ? "today" : daysUntilDue <= 3 ? "soon" : "later";
  return {
    id: item.id,
    name: item.name,
    notes: item.notes ?? "",
    active: Boolean(item.active),
    manualIntervalDays: item.manual_interval_days ?? null,
    learnedIntervalDays,
    suggestedIntervalDays: suggestInterval(item.manual_interval_days, learnedIntervalDays),
    effectiveIntervalDays,
    lastOrderDate,
    daysSinceOrder: lastOrderDate ? daysBetween(lastOrderDate, todayISO) : null,
    dueDate,
    daysUntilDue,
    status,
  };
}

export function sortItemViews(items) {
  return [...items].sort((a, b) => {
    if (a.dueDate === null) return b.dueDate === null ? a.name.localeCompare(b.name) : 1;
    if (b.dueDate === null) return -1;
    return a.dueDate.localeCompare(b.dueDate) || a.name.localeCompare(b.name);
  });
}
```

- [ ] **Step 4: Add the initial D1 migration**

Create `inventory/migrations/0001_initial.sql`:

```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE,
  manual_interval_days INTEGER CHECK (manual_interval_days IS NULL OR manual_interval_days BETWEEN 1 AND 365),
  notes TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  order_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (item_id, order_date)
);

CREATE INDEX order_events_item_date ON order_events(item_id, order_date DESC);

CREATE TABLE login_attempts (
  client_key TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  window_started_at INTEGER NOT NULL,
  locked_until INTEGER
);
```

- [ ] **Step 5: Run domain tests**

Run: `node --test inventory/test/domain.test.mjs`

Expected: 6 tests PASS.

- [ ] **Step 6: Commit the domain foundation**

```bash
git add inventory/migrations/0001_initial.sql inventory/src/domain.mjs inventory/test/domain.test.mjs
git commit -m "feat(inventory): add order interval domain rules"
```

---

### Task 2: Four-Digit PIN Authentication

**Files:**
- Create: `inventory/src/auth.mjs`
- Create: `inventory/test/auth.test.mjs`

**Interfaces:**
- Produces: `isFourDigitPin(value: unknown): boolean`
- Produces: `safeEqualText(left: string, right: string): boolean`
- Produces: `createSession(secret: string, nowMs?: number): Promise<string>`
- Produces: `verifySession(token: string, secret: string, nowMs?: number): Promise<boolean>`
- Produces: `readCookie(request: Request, name: string): string | null`
- Produces: `sessionCookie(token: string): string`
- Produces: `expiredSessionCookie(): string`
- Produces: `clientKey(request: Request, secret: string): Promise<string>`
- Produces: `checkLoginAllowed(db: D1Database, key: string, nowMs?: number): Promise<boolean>`
- Produces: `recordLoginFailure(db: D1Database, key: string, nowMs?: number): Promise<void>`
- Produces: `clearLoginFailures(db: D1Database, key: string): Promise<void>`

- [ ] **Step 1: Write failing authentication tests**

Create `inventory/test/auth.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { isFourDigitPin, safeEqualText, createSession, verifySession, readCookie } from "../src/auth.mjs";

test("accepts exactly four ASCII digits", () => {
  assert.equal(isFourDigitPin("0123"), true);
  assert.equal(isFourDigitPin("123"), false);
  assert.equal(isFourDigitPin("24680"), false);
  assert.equal(isFourDigitPin("12a4"), false);
});

test("constant-time text comparison reports equality", () => {
  assert.equal(safeEqualText("2468", "2468"), true);
  assert.equal(safeEqualText("2468", "9999"), false);
});

test("signed sessions verify, expire, and reject tampering", async () => {
  const now = Date.UTC(2026, 8, 13);
  const token = await createSession("a sufficiently long test secret", now);
  assert.equal(await verifySession(token, "a sufficiently long test secret", now + 1000), true);
  assert.equal(await verifySession(`${token}x`, "a sufficiently long test secret", now + 1000), false);
  assert.equal(await verifySession(token, "a sufficiently long test secret", now + 8 * 86_400_000), false);
});

test("reads one named cookie", () => {
  const request = new Request("https://inventory.example", { headers: { cookie: "other=x; inventory_session=abc.def" } });
  assert.equal(readCookie(request, "inventory_session"), "abc.def");
});
```

- [ ] **Step 2: Run tests and verify the missing module failure**

Run: `node --test inventory/test/auth.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `inventory/src/auth.mjs`.

- [ ] **Step 3: Implement signed sessions and PIN helpers**

Create `inventory/src/auth.mjs`. Use seven-day sessions, HMAC-SHA-256 signatures, base64url encoding, a maximum of five failed attempts in fifteen minutes, and a fifteen-minute lock. Hash the connecting IP with the session secret before using it as a D1 key. Cookie functions must emit `Path=/; HttpOnly; Secure; SameSite=Strict`.

```js
const encoder = new TextEncoder();
const SESSION_MS = 7 * 86_400_000;
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

const bytesToBase64url = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

async function hmac(secret, text) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
}

export const isFourDigitPin = (value) => typeof value === "string" && /^\d{4}$/.test(value);

export function safeEqualText(left, right) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

export async function createSession(secret, nowMs = Date.now()) {
  const payload = bytesToBase64url(encoder.encode(JSON.stringify({ exp: nowMs + SESSION_MS })));
  return `${payload}.${bytesToBase64url(await hmac(secret, payload))}`;
}

export async function verifySession(token, secret, nowMs = Date.now()) {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature || !safeEqualText(signature, bytesToBase64url(await hmac(secret, payload)))) return false;
    const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0))));
    return Number.isFinite(decoded.exp) && decoded.exp > nowMs;
  } catch {
    return false;
  }
}

export function readCookie(request, name) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

export const sessionCookie = (token) => `inventory_session=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`;
export const expiredSessionCookie = () => "inventory_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";

export async function clientKey(request, secret) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return bytesToBase64url(await hmac(secret, ip));
}

export async function checkLoginAllowed(db, key, nowMs = Date.now()) {
  const row = await db.prepare("SELECT locked_until FROM login_attempts WHERE client_key = ?").bind(key).first();
  return !row?.locked_until || row.locked_until <= nowMs;
}

export async function recordLoginFailure(db, key, nowMs = Date.now()) {
  const row = await db.prepare("SELECT failures, window_started_at FROM login_attempts WHERE client_key = ?").bind(key).first();
  const inWindow = row && nowMs - row.window_started_at < WINDOW_MS;
  const failures = inWindow ? row.failures + 1 : 1;
  const started = inWindow ? row.window_started_at : nowMs;
  const lockedUntil = failures >= MAX_FAILURES ? nowMs + WINDOW_MS : null;
  await db.prepare("INSERT INTO login_attempts (client_key, failures, window_started_at, locked_until) VALUES (?, ?, ?, ?) ON CONFLICT(client_key) DO UPDATE SET failures=excluded.failures, window_started_at=excluded.window_started_at, locked_until=excluded.locked_until").bind(key, failures, started, lockedUntil).run();
}

export async function clearLoginFailures(db, key) {
  await db.prepare("DELETE FROM login_attempts WHERE client_key = ?").bind(key).run();
}
```

- [ ] **Step 4: Run authentication tests**

Run: `node --test inventory/test/auth.test.mjs`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit authentication**

```bash
git add inventory/src/auth.mjs inventory/test/auth.test.mjs
git commit -m "feat(inventory): add PIN session security"
```

---

### Task 3: D1 Repository and JSON API

**Files:**
- Create: `inventory/src/db.mjs`
- Create: `inventory/src/worker.mjs`
- Create: `inventory/test/worker.test.mjs`

**Interfaces:**
- Consumes: domain exports from Task 1.
- Consumes: authentication exports from Task 2.
- Produces: `listItems(db, todayISO, activeOnly?): Promise<object[]>`
- Produces: `createItem(db, input): Promise<number>`
- Produces: `updateItem(db, id, input): Promise<void>`
- Produces: `recordOrder(db, itemId, date): Promise<number>`
- Produces: `deleteOrder(db, itemId, orderId): Promise<void>`
- Produces: `listOrders(db, itemId): Promise<object[]>`
- Produces: Worker default export `{ fetch(request, env): Promise<Response> }`

- [ ] **Step 1: Write failing request-level tests**

Create `inventory/test/worker.test.mjs` with a small fake D1 object that records SQL calls and returns configured rows. Test these boundaries without a network connection:

```js
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

function env(overrides = {}) {
  return {
    INVENTORY_PIN: "2468",
    SESSION_SECRET: "a sufficiently long test secret",
    DB: overrides.DB,
    ASSETS: { fetch: async () => new Response("asset") },
  };
}

test("rejects protected API calls without a session", async () => {
  const response = await worker.fetch(new Request("https://inventory.example/api/items"), env({ DB: {} }));
  assert.equal(response.status, 401);
});

test("rejects future order dates before writing", async () => {
  const testEnv = env({ DB: { prepare() { throw new Error("must not query before validation"); } } });
  const response = await worker.fetch(new Request("https://inventory.example/api/items/1/orders", {
    method: "POST",
    headers: { cookie: "inventory_session=invalid", "content-type": "application/json" },
    body: JSON.stringify({ date: "2999-01-01" }),
  }), testEnv);
  assert.equal(response.status, 401);
});

test("serves browser assets outside the API", async () => {
  const response = await worker.fetch(new Request("https://inventory.example/"), env({ DB: {} }));
  assert.equal(await response.text(), "asset");
});
```

- [ ] **Step 2: Run the request tests and verify failure**

Run: `node --test inventory/test/worker.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `inventory/src/worker.mjs`.

- [ ] **Step 3: Implement D1 repository functions**

Create `inventory/src/db.mjs`. Use parameterized statements only. `listItems` loads item rows and their order dates, groups dates by item ID, calls `toItemView`, and calls `sortItemViews`. `createItem` and `updateItem` normalize names with `trim()`. `recordOrder` inserts one event. `deleteOrder` requires both item and event ID. `listOrders` returns newest first.

The item write statements are:

```js
const insert = "INSERT INTO items (name, manual_interval_days, notes) VALUES (?, ?, ?) RETURNING id";
const update = "UPDATE items SET name = ?, manual_interval_days = ?, notes = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
const insertOrder = "INSERT INTO order_events (item_id, order_date) VALUES (?, ?) RETURNING id";
const deleteOrder = "DELETE FROM order_events WHERE id = ? AND item_id = ?";
```

Map a D1 unique-constraint failure to an application error with code `DUPLICATE`, and a missing updated row to `NOT_FOUND`.

- [ ] **Step 4: Implement Worker routing and validation**

Create `inventory/src/worker.mjs` with:

- Public routes: `POST /api/login`, `POST /api/logout`, and static assets.
- Protected routes: `GET/POST /api/items`, `PATCH /api/items/:id`, `GET /api/items/:id/orders`, `POST /api/items/:id/orders`, `DELETE /api/items/:id/orders/:orderId`, and `GET /api/export.csv`.
- JSON response shape: success `{ data: ... }`; failure `{ error: "human-readable message", code: "STABLE_CODE" }`.
- Item validation: non-empty name up to 120 characters, notes up to 500 characters, manual interval either `null` or an integer from 1 through 365, active a boolean.
- Date validation: exact ISO date, not after Calgary's current calendar date. Derive the date with `new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit" })` and format parts explicitly as `YYYY-MM-DD`.
- Login validation: missing environment secrets return status 500 without naming the secret; malformed or wrong PIN returns 401; locked clients return 429; successful login clears failures and sets the session cookie.
- D1 duplicate item/event errors return status 409.
- CSV columns: `item_name,active,manual_interval_days,order_date,notes`, with RFC 4180 quote escaping and UTF-8 BOM.
- All protected responses set `Cache-Control: no-store`.
- Unknown API routes return 404; non-API routes call `env.ASSETS.fetch(request)`.

- [ ] **Step 5: Run request-level and domain tests**

Run: `node --test inventory/test/*.test.mjs`

Expected: all tests PASS.

- [ ] **Step 6: Commit the API**

```bash
git add inventory/src/db.mjs inventory/src/worker.mjs inventory/test/worker.test.mjs
git commit -m "feat(inventory): add D1 order tracker API"
```

---

### Task 4: Mobile-First Browser Interface

**Files:**
- Create: `inventory/public/index.html`
- Create: `inventory/public/app.js`
- Create: `inventory/public/styles.css`
- Create: `inventory/public/manifest.webmanifest`

**Interfaces:**
- Consumes: JSON and CSV endpoints from Task 3.
- Produces: `api(path, options): Promise<unknown>`
- Produces: `renderItems(items: object[]): void`
- Produces: `openItemEditor(item?: object): void`
- Produces: `showHistory(itemId: number): Promise<void>`

- [ ] **Step 1: Build the semantic page shell**

Create `inventory/public/index.html` with Chinese UI copy, a `main` landmark, a login form using `inputmode="numeric"`, `pattern="[0-9]{4}"`, `maxlength="4"`, and `autocomplete="current-password"`; an authenticated application section; status filter buttons; an item list; one item editor dialog; one history dialog; and a polite `aria-live` status region. Load `/styles.css` and `/app.js` as a module, and link `/manifest.webmanifest`.

The primary controls are:

```html
<form id="login-form">
  <label for="pin">4 位密码</label>
  <input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="current-password" required>
  <button type="submit">登录</button>
</form>

<header class="app-header">
  <div><p class="eyebrow">内部叫货记录</p><h1>叫货清单</h1></div>
  <button id="add-item" type="button">＋ 添加货品</button>
</header>

<section id="item-list" aria-label="货品"></section>
```

- [ ] **Step 2: Implement browser state and API handling**

Create `inventory/public/app.js` with one state object `{ items: [], filter: "active", lastCreatedOrder: null }`. On startup call `GET /api/items`; show login on 401 and the application on success. Send JSON with `credentials: "same-origin"`. Render every user-provided string through `textContent`, never `innerHTML`.

Each item card must show:

- large item name;
- `已经 N 天` or `还没有叫货记录`;
- last order date;
- `已超过 N 天`, `今天检查`, `还有 N 天`, or `学习中`;
- manual and learned interval values when present;
- suggestion buttons only when `suggestedIntervalDays` is not null;
- a large `今天已叫货` button;
- secondary `补录日期`, `历史`, and `编辑` controls.

After a successful order write, refetch items and show a ten-second undo bar containing the returned item and order IDs. Undo sends the exact protected DELETE endpoint and refetches. Disable a submitting button until its request finishes to prevent duplicate taps.

- [ ] **Step 3: Implement item editor, archive, restore, and history**

The item editor creates or patches `{ name, manualIntervalDays, notes, active }`. Accepting a system suggestion sends the existing item fields with `manualIntervalDays` set to `suggestedIntervalDays`. The history dialog lists newest dates first, permits date correction by deleting the incorrect event and posting the corrected date, and requires an explicit confirmation before the delete half of that correction. Archive and restore use the same PATCH endpoint.

If the correction insert fails after delete, immediately repost the original date and show an error; this prevents a failed edit from silently losing history.

- [ ] **Step 4: Add restrained mobile-first styling**

Create `inventory/public/styles.css` using system fonts, a maximum content width of 760px, 44px minimum tap targets, visible focus outlines, high-contrast status labels, and one-column cards. Use color plus text, never color alone. At 700px and wider, allow card metadata and controls to share a row. Respect `prefers-reduced-motion` and do not add decorative animation.

- [ ] **Step 5: Add install metadata**

Create `inventory/public/manifest.webmanifest`:

```json
{
  "name": "Centre Street 叫货清单",
  "short_name": "叫货清单",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f6f3ee",
  "theme_color": "#7a241c",
  "lang": "zh-CN"
}
```

- [ ] **Step 6: Run all automated tests**

Run: `node --test inventory/test/*.test.mjs`

Expected: all tests PASS.

- [ ] **Step 7: Commit the browser UI**

```bash
git add inventory/public
git commit -m "feat(inventory): add mobile order tracker UI"
```

---

### Task 5: Local Configuration, End-to-End Verification, and Handoff

**Files:**
- Create: `inventory/wrangler.jsonc`
- Create: `inventory/.gitignore`
- Create: `inventory/README.md`
- Modify: `inventory/test/worker.test.mjs`

**Interfaces:**
- Consumes: Worker, D1 migration, browser assets, and tests from Tasks 1–4.
- Produces: documented local and deployment commands with no checked-in secrets.

- [ ] **Step 1: Add isolated Wrangler configuration**

Create `inventory/wrangler.jsonc`:

```jsonc
{
  "$schema": "../node_modules/wrangler/config-schema.json",
  "name": "centre-street-order-tracker",
  "main": "src/worker.mjs",
  "compatibility_date": "2026-09-13",
  "assets": {
    "directory": "public",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "centre-street-order-tracker",
      "database_id": "local-order-tracker",
      "migrations_dir": "migrations"
    }
  ]
}
```

The deliberate `local-order-tracker` identifier supports local development without creating a remote database. Replace it with the real UUID only during the separately approved deployment step; the identifier is deployment configuration, not a secret.

Create `inventory/.gitignore`:

```gitignore
.dev.vars
.wrangler/
```

- [ ] **Step 2: Expand request-level tests around validation and auth**

Add fake-D1 cases to `inventory/test/worker.test.mjs` that assert:

- a valid login sets an `inventory_session` cookie;
- a sixth failed login within fifteen minutes returns 429;
- empty names and intervals outside 1–365 return 400;
- duplicate items and same-day order events return 409;
- a valid order event returns its new order ID;
- CSV values containing commas and quotes are escaped;
- unknown API paths return 404.

Use deterministic fake statement responses and assert exact status codes and stable error codes.

- [ ] **Step 3: Run the complete automated suite**

Run: `node --test inventory/test/*.test.mjs`

Expected: all tests PASS with zero skipped tests.

- [ ] **Step 4: Apply migrations to the local D1 database**

Run:

```bash
npx wrangler d1 migrations apply centre-street-order-tracker --local --config inventory/wrangler.jsonc
```

Expected: Wrangler creates the local D1 state and applies `0001_initial.sql` successfully without creating a remote resource.

- [ ] **Step 5: Set local-only secrets and start the app**

Create `inventory/.dev.vars` locally with `INVENTORY_PIN` and a randomly generated `SESSION_SECRET`; ensure the file is ignored before writing it. Do not print either value in command output. Start with:

```bash
npx wrangler dev --config inventory/wrangler.jsonc
```

Expected: local Worker URL starts and `/` displays the PIN screen.

- [ ] **Step 6: Run browser verification at mobile and desktop widths**

Use Playwright against the local URL at 390×844 and 1440×900. Verify login, wrong-PIN handling, item creation, manual reference interval, three historical dates, learned interval, suggestion acceptance, due-date sorting, today order, undo, archive/restore, CSV download, logout, and session rejection after logout. Save screenshots under `outputs/inventory-verification/` and confirm no console errors.

- [ ] **Step 7: Verify public-site isolation**

Run:

```bash
npm run build
git diff --name-only HEAD -- app public db drizzle.config.ts next.config.ts vite.config.ts
```

Expected: the public site build succeeds and the diff command prints no paths caused by the inventory implementation.

- [ ] **Step 8: Write the operator README**

Create `inventory/README.md` documenting exact test, local migration, local secret, development, production secret, production migration, deploy, custom-domain, CSV export, PIN rotation, and rollback commands. State clearly that a four-digit PIN is suitable only for this low-sensitivity internal list and that the system does not know actual stock levels.

- [ ] **Step 9: Commit the verified application**

```bash
git add inventory/.gitignore inventory/wrangler.jsonc inventory/README.md inventory/test/worker.test.mjs
git commit -m "docs(inventory): add deployment and verification guide"
```

- [ ] **Step 10: Deploy only after explicit deployment approval**

Run `npx wrangler d1 create centre-street-order-tracker --location wnam`, replace the local database ID in `inventory/wrangler.jsonc` with the returned UUID, set production secrets with `wrangler secret put`, apply D1 migrations remotely, deploy the Worker, attach `inventory.centrestjhotpot.ca`, and repeat the mobile smoke test. Deployment is an external state change and is not included in implementation approval unless the user separately approves it at action time.
