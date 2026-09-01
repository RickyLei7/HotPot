# Hotpot Seat Manager Online Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a secure Cloudflare-hosted Hotpot Seat Manager whose Walk-ins, reservations, occupancies, and table state synchronize in near real time across Android tablets, iPads, phones, and computers.

**Architecture:** A same-origin Cloudflare Worker serves the vanilla JavaScript client and routes protected API/WebSocket traffic to one SQLite-backed `RestaurantRoom` Durable Object. Pure scheduling and command modules remain independent of persistence; the Durable Object serializes commands, writes normalized SQLite rows transactionally, and broadcasts the authoritative snapshot after commit.

**Tech Stack:** Vanilla JavaScript ES modules, Node.js 22+, Cloudflare Workers, SQLite-backed Durable Objects, Hibernation WebSockets, Wrangler 4.97.0, Vitest 4.1+, `@cloudflare/vitest-plugin` 1.1.2, Node test runner, and Playwright 1.62.1.

**Spec:** `docs/superpowers/specs/2026-09-01-hotpot-seat-manager-online-design.md`

## Global Constraints

- Keep the public `centrestjhotpot.ca` GitHub Pages deployment unchanged; the online manager deploys only to `reservation.centrestjhotpot.ca`.
- Preserve the existing 30 scheduling, storage, static-bundle, and table-label tests before adding online behavior.
- Preserve the fixed ten-table capacities `4, 4, 4, 6, 6, 4, 4, 4, 2, 2` and 40-seat total.
- Preserve 90 minutes dining plus a 10-minute turn buffer.
- Preserve the five-minute notified-return window, the 15-minute reservation grace period, and the fixed visible version `v2026.08.31`.
- Use `无名客人 #N`; normalize legacy `无名字客人 #N` only for display and numbering.
- Keep direct phone display, highlighted guest names, bright Walk-in/reservation panels, reservation drag-to-table, and the `Arrived / 已到店` action.
- Keep the dashboard compact: no more than five future/today preview rows before a detail view.
- Production uses one shared four-digit PIN and a 12-hour session.
- Never put the PIN, PIN verifier, PIN pepper, session token, or Cloudflare administrative credentials in source, documentation, browser assets, or logs.
- Production starts with empty Walk-in, reservation, and occupancy tables; no QA data is imported.
- Interpret restaurant dates and day boundaries in `America/Edmonton`; store all timestamps as epoch milliseconds.
- Do not collect employee names, Apple-account details, or personal device-profile data; the random login-throttle device ID is not an employee identity, and action audit history is deferred.
- Customer-data responses use `Cache-Control: no-store`; the service worker caches only the application shell.
- Offline writes are disabled rather than queued.
- Every task stages exact paths only; unrelated dirty-worktree files remain untouched.

---

## Planned File Map

The implementation creates a separate project under `seat-manager/`:

```text
seat-manager/
  package.json                         project-only commands and dependencies
  package-lock.json                    locked project dependency graph
  wrangler.jsonc                       local/staging Worker and Durable Object config
  wrangler.production.jsonc            production Worker and reservation subdomain config
  vitest.config.js                     Workers-runtime test configuration
  .gitignore                           local secrets, build, and test artifacts
  src/
    domain/
      scheduler.js                     existing pure scheduling rules
      tables.js                        existing table capacities and labels
      commands.js                      pure restaurant command validation and state transitions
    shared/
      contracts.js                     snapshots, command names, errors, and connection states
    data/
      local-repository.js              async local development repository
      remote-repository.js             same-origin HTTP repository
    client/
      index.html                       staff application shell and PIN view host
      app.js                            UI state, rendering, forms, and actions
      auth.js                           login/session/logout client
      realtime.js                       WebSocket reconnect and connection states
      styles.css                        existing responsive design plus online states
      manifest.webmanifest             installable web-app metadata
      icon.svg                          non-personal restaurant manager icon
      sw.js                             application-shell-only service worker
    server/
      worker.js                         static asset, API, WebSocket, origin, and header router
      restaurant-room.js               Durable Object request and WebSocket coordinator
      schema.js                         idempotent SQLite schema initialization
      persistence.js                    normalized snapshot reads and targeted transactional writes
      auth-crypto.js                    PIN verifier, HMAC keys, token hashing, and constant-time checks
      sessions.js                       session creation, validation, logout, and cookie helpers
      rate-limit.js                     network/device/global failed-login cooldowns
      command-service.js                idempotency, version checks, persistence, and command results
  scripts/
    build-client.mjs                    copies reviewed client assets into public/
    create-local-secrets.mjs            creates deterministic non-production test secrets
    provision-pin.mjs                   masked production PIN provisioning
  public/                               generated deployable client assets
  local-preview/
    index.html                          frozen approved file:// regression fixture
  test/
    domain/                             preserved and expanded Node tests
    worker/                             Workers-runtime auth, storage, concurrency, and realtime tests
  e2e/
    online.spec.mjs                     multi-context browser acceptance flow
```

The online source of truth is always `seat-manager/src/`; `seat-manager/public/` is generated and is never edited by hand. `seat-manager/local-preview/index.html` is a frozen copy of the already-approved standalone MVP used only to keep the original file-bundle regression test and safe visual comparison.

---

### Task 1: Establish the isolated project and preserve the tested MVP

**Files:**
- Create: `seat-manager/package.json`
- Create: `seat-manager/.gitignore`
- Create: `seat-manager/scripts/build-client.mjs`
- Create: `seat-manager/src/domain/scheduler.js`
- Create: `seat-manager/src/domain/tables.js`
- Create: `seat-manager/src/client/app.js`
- Create: `seat-manager/src/client/styles.css`
- Create: `seat-manager/src/data/local-repository.js`
- Create: `seat-manager/src/client/index.html`
- Create: `seat-manager/test/domain/scheduler.test.js`
- Create: `seat-manager/test/domain/storage.test.js`
- Create: `seat-manager/test/domain/static-bundle.test.js`
- Create: `seat-manager/test/domain/table-labels.test.js`
- Create: `seat-manager/local-preview/index.html`

**Interfaces:**
- Consumes: the currently tested handoff application in `/private/tmp/hotpot-seat-review.kzqySH/release/hotpot-seat-manager-codex-handoff-v2026.08.31/app`
- Produces: `npm run build`, `npm run test:domain`, and an isolated `seat-manager/` source tree with the existing 30 tests green

- [ ] **Step 1: Add the isolated package manifest**

```json
{
  "name": "hotpot-seat-manager-online",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=22.13.0" },
  "scripts": {
    "build": "node scripts/build-client.mjs",
    "test:domain": "node --test test/domain/*.test.js",
    "test:worker": "node scripts/create-local-secrets.mjs && vitest run test/worker",
    "test": "npm run test:domain && npm run test:worker",
    "dev": "npm run build && wrangler dev --config wrangler.jsonc",
    "e2e": "node e2e/run-local.mjs",
    "deploy:staging": "npm run build && wrangler deploy --config wrangler.jsonc",
    "deploy:production": "npm run build && wrangler deploy --config wrangler.production.jsonc"
  },
  "devDependencies": {
    "@cloudflare/vitest-plugin": "1.1.2",
    "playwright": "1.62.1",
    "vitest": "^4.1.0",
    "wrangler": "4.97.0"
  }
}
```

- [ ] **Step 2: Ignore secrets and generated files**

```gitignore
node_modules/
public/
.wrangler/
.dev.vars
.dev.vars.*
!.dev.vars.example
test-results/
playwright-report/
```

- [ ] **Step 3: Port the current source and tests without changing behavior**

Copy the reviewed `scheduler.js`, `tables.js`, current UI, current responsive CSS, and all four current test files into the mapped `seat-manager/` paths. Preserve the already-approved standalone page at `seat-manager/local-preview/index.html`, and make the copied static-bundle test read that path so its original `file://` regression remains green. Replace the old synchronous storage file with an initially equivalent async wrapper:

```js
export function createLocalRepository(storage, key = 'hotpot-seat-manager-v1') {
  return {
    async load() {
      try {
        const raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    async save(snapshot) {
      storage.setItem(key, JSON.stringify(snapshot));
      return snapshot;
    }
  };
}
```

In the copied online client only, change module imports from `./domain/*` and `./data/storage.js` to `../domain/*` and `../data/local-repository.js`, rename `createStorageRepository` to `createLocalRepository`, and initialize with top-level await:

```js
const repo = createLocalRepository(window.localStorage);
const initial = await repo.load() || {walkins:[],reservations:[],occupancies:[]};
let state = {...initial};
```

Update the copied storage test so it awaits the new interface instead of importing the removed synchronous repository name:

```js
test('local repository saves and loads the preserved snapshot shape', async () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const repository = createLocalRepository(storage);
  const snapshot = {walkins:[{id:'1'}],reservations:[],occupancies:[]};
  await repository.save(snapshot);
  assert.deepEqual(await repository.load(), snapshot);
});
```

The only change to the copied static-bundle test is its fixture path:

```js
const html = await readFile(new URL('../../local-preview/index.html', import.meta.url), 'utf8');
```

Keep its original assertions for inline CSS, inline JavaScript, and no module or external-script dependency unchanged.

- [ ] **Step 4: Install the locked dependency graph**

Run: `cd seat-manager && npm install`

Expected: `seat-manager/package-lock.json` is created with only the dependencies declared in `seat-manager/package.json`.

- [ ] **Step 5: Build browser modules from reviewed source**

`scripts/build-client.mjs` must remove and recreate `public/`, copy `src/client/index.html`, `src/client/styles.css`, `src/client/app.js`, `src/data/local-repository.js`, and both domain modules while preserving their relative import paths.

```js
import { cp, mkdir, rm } from 'node:fs/promises';

await rm('public', { recursive: true, force: true });
await mkdir('public/client', { recursive: true });
await mkdir('public/data', { recursive: true });
await mkdir('public/domain', { recursive: true });
await cp('src/client/index.html', 'public/index.html');
await cp('src/client/styles.css', 'public/client/styles.css');
await cp('src/client/app.js', 'public/client/app.js');
await cp('src/data/local-repository.js', 'public/data/local-repository.js');
await cp('src/domain/scheduler.js', 'public/domain/scheduler.js');
await cp('src/domain/tables.js', 'public/domain/tables.js');
```

- [ ] **Step 6: Run the baseline tests**

Run: `cd seat-manager && npm run test:domain`

Expected: 30 tests pass, including five-minute notification expiry, reservation dragging, shorter anonymous names, direct phone presentation helpers, and numeric-only table labels.

- [ ] **Step 7: Build and smoke-check the generated shell**

Run: `cd seat-manager && npm run build`

Expected: `seat-manager/public/index.html`, client modules, styles, and domain modules exist; `public/index.html` imports `/client/app.js` as an ES module and contains no production secret.

- [ ] **Step 8: Commit the isolated baseline**

```bash
git add seat-manager/package.json seat-manager/package-lock.json seat-manager/.gitignore seat-manager/scripts/build-client.mjs seat-manager/src seat-manager/test/domain seat-manager/local-preview/index.html
git commit -m "feat: preserve seat manager baseline"
```

---

### Task 2: Add command contracts and an asynchronous local repository

**Files:**
- Create: `seat-manager/src/shared/contracts.js`
- Create: `seat-manager/src/domain/commands.js`
- Modify: `seat-manager/src/data/local-repository.js`
- Create: `seat-manager/test/domain/commands.test.js`
- Modify: `seat-manager/scripts/build-client.mjs`

**Interfaces:**
- Consumes: `RESTAURANT_TABLES`, scheduling helpers, and `{walkins,reservations,occupancies,revision}` snapshots
- Produces: `COMMAND_TYPES`, `DomainCommandError`, `RepositoryError`, `applyRestaurantCommand(snapshot, command, context)`, `applyKnownCommand(next, command, context, writes)`, and `repository.command(command)`

- [ ] **Step 1: Define exact shared command names and error shape**

```js
export const COMMAND_TYPES = Object.freeze({
  CREATE_WALKIN: 'walkin.create',
  NOTIFY_WALKIN: 'walkin.notify',
  CANCEL_WALKIN: 'walkin.cancel',
  CREATE_RESERVATION: 'reservation.create',
  EDIT_RESERVATION: 'reservation.edit',
  SET_RESERVATION_STATUS: 'reservation.status',
  CONFIRM_TABLE_PLAN: 'party.confirmTablePlan',
  SEAT_PARTY: 'party.seat',
  CLEAR_TABLE: 'table.clear'
});

export class DomainCommandError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'DomainCommandError';
    this.code = code;
    this.status = status;
  }
}

export class RepositoryError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    this.name = 'RepositoryError';
    this.status = status;
    this.code = code;
    Object.assign(this, details);
  }
}

export const emptySnapshot = () => ({
  walkins: [], reservations: [], occupancies: [], revision: 0
});
```

- [ ] **Step 2: Write failing tests for every state transition**

The test matrix must cover create Walk-in, automatic `无名客人 #N`, notify timestamp, five-minute eligibility, create/edit reservation, Arrived, No-show, Cancelled, table-plan confirmation, seat, joined-table seat, clear, stale version rejection, occupied-table rejection, and 17+ manual seating rejection.

```js
test('seat command rejects an occupied table without changing state', () => {
  const snapshot = {
    walkins: [{id:'w1',name:'A',phone:'',partySize:2,status:'waiting',tablePlanConfirmed:true,createdAt:1,updatedAt:1,version:1}],
    reservations: [],
    occupancies: [{tableId:9,partyId:'old',partyKind:'walkin',partyName:'Old',partySize:2,seatedAt:1,expectedEndAt:999999,createdAt:1,updatedAt:1,version:1}],
    revision: 1
  };
  assert.throws(() => applyRestaurantCommand(snapshot, {
    type: COMMAND_TYPES.SEAT_PARTY,
    idempotencyKey: 'seat-1',
    partyId: 'w1',
    partyKind: 'walkin',
    expectedVersion: 1,
    tableIds: [9]
  }, {now:100, uid:()=> 'o1'}), error => error.code === 'TABLE_OCCUPIED');
  assert.equal(snapshot.walkins[0].status, 'waiting');
});
```

- [ ] **Step 3: Run the command tests to verify failure**

Run: `cd seat-manager && node --test test/domain/commands.test.js`

Expected: FAIL because `src/domain/commands.js` does not exist.

- [ ] **Step 4: Implement the pure command reducer**

`applyRestaurantCommand` must clone the input, use server-supplied `context.now` and `context.uid`, increment only changed record versions, increment the global revision once, and return targeted persistence writes.

```js
export function applyRestaurantCommand(snapshot, command, context) {
  if (!command?.idempotencyKey) throw new DomainCommandError('IDEMPOTENCY_REQUIRED', '操作缺少安全编号');
  const next = structuredClone(snapshot);
  const writes = [];
  const changedAt = Number(context.now);

  switch (command.type) {
    case COMMAND_TYPES.CREATE_WALKIN: {
      const partySize = boundedPartySize(command.partySize);
      const record = {
        id: context.uid(),
        name: String(command.name || '').trim() || nextAnonymousWalkInName(next.walkins),
        phone: String(command.phone || '').trim(),
        partySize,
        status: 'waiting',
        tablePlanConfirmed: !requiresTableConfirmation(partySize),
        createdAt: changedAt,
        updatedAt: changedAt,
        version: 1
      };
      next.walkins.push(record);
      writes.push({entity:'walkin',operation:'upsert',record});
      break;
    }
    case COMMAND_TYPES.NOTIFY_WALKIN:
    case COMMAND_TYPES.CANCEL_WALKIN:
    case COMMAND_TYPES.CREATE_RESERVATION:
    case COMMAND_TYPES.EDIT_RESERVATION:
    case COMMAND_TYPES.SET_RESERVATION_STATUS:
    case COMMAND_TYPES.CONFIRM_TABLE_PLAN:
    case COMMAND_TYPES.SEAT_PARTY:
    case COMMAND_TYPES.CLEAR_TABLE:
      applyKnownCommand(next, command, context, writes);
      break;
    default:
      throw new DomainCommandError('UNKNOWN_COMMAND', '无法识别这个操作');
  }

  next.revision = Number(snapshot.revision || 0) + 1;
  return {snapshot:next,writes,result:{revision:next.revision}};
}
```

Define `applyKnownCommand(next, command, context, writes)` as a private exhaustive switch with explicit cases for `NOTIFY_WALKIN`, `CANCEL_WALKIN`, `CREATE_RESERVATION`, `EDIT_RESERVATION`, `SET_RESERVATION_STATUS`, `CONFIRM_TABLE_PLAN`, `SEAT_PARTY`, and `CLEAR_TABLE`; its `default` throws `DomainCommandError('UNKNOWN_COMMAND', '无法识别这个操作')`. The cases must use `applyReservationEdit`, `isTablePlanConfirmed`, `tableDropMode`, `canSeatWithoutReservationConflict`, and `OCCUPANCY_WINDOW_MS`; they must never accept a client-supplied creation, notification, seating, or update timestamp.

- [ ] **Step 5: Convert the local repository to the command interface**

```js
export function createLocalRepository(storage, {key='hotpot-seat-manager-v1',clock=Date.now,uid=crypto.randomUUID} = {}) {
  const listeners = new Set();
  const read = () => {
    const raw = storage.getItem(key);
    return raw ? {...emptySnapshot(),...JSON.parse(raw)} : emptySnapshot();
  };
  return {
    async load() { return read(); },
    async save(snapshot) {
      storage.setItem(key, JSON.stringify(snapshot));
      for (const listener of listeners) listener(snapshot);
      return snapshot;
    },
    async command(command) {
      const output = applyRestaurantCommand(read(), command, {now:clock(),uid});
      storage.setItem(key, JSON.stringify(output.snapshot));
      for (const listener of listeners) listener(output.snapshot);
      return output;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
```

Extend `scripts/build-client.mjs` in the same task so the browser receives the new shared and command modules:

```js
await mkdir('public/shared', {recursive:true});
await cp('src/shared/contracts.js', 'public/shared/contracts.js');
await cp('src/domain/commands.js', 'public/domain/commands.js');
```

- [ ] **Step 6: Run all domain tests**

Run: `cd seat-manager && npm run test:domain`

Expected: all 30 preserved tests plus the complete command matrix pass.

- [ ] **Step 7: Commit command behavior**

```bash
git add seat-manager/src/shared/contracts.js seat-manager/src/domain/commands.js seat-manager/src/data/local-repository.js seat-manager/scripts/build-client.mjs seat-manager/test/domain/commands.test.js
git commit -m "feat: add restaurant command model"
```

---

### Task 3: Scaffold the Worker, Durable Object, and empty SQLite schema

**Files:**
- Create: `seat-manager/wrangler.jsonc`
- Create: `seat-manager/wrangler.production.jsonc`
- Create: `seat-manager/vitest.config.js`
- Create: `seat-manager/src/server/worker.js`
- Create: `seat-manager/src/server/restaurant-room.js`
- Create: `seat-manager/src/server/schema.js`
- Create: `seat-manager/src/server/persistence.js`
- Create: `seat-manager/scripts/create-local-secrets.mjs`
- Create: `seat-manager/test/worker/schema.test.js`

**Interfaces:**
- Consumes: `emptySnapshot()` and the fixed `RESTAURANT_ID=centre-street`
- Produces: `RestaurantRoom`, `RestaurantRoom.readSnapshotForTest()`, `initializeSchema(sql)`, `readSnapshot(sql, restaurantId)`, `applyWrites(sql, restaurantId, writes, revision)`, and Worker-local bindings

- [ ] **Step 1: Add staging/local Wrangler configuration**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hotpot-seat-manager-staging",
  "main": "src/server/worker.js",
  "compatibility_date": "2026-09-01",
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*", "/ws"]
  },
  "vars": {
    "RESTAURANT_ID": "centre-street",
    "SESSION_TTL_MS": "43200000",
    "ALLOWED_ORIGIN": "self"
  },
  "secrets": {
    "required": ["PIN_SALT", "PIN_PEPPER", "PIN_VERIFIER", "PIN_VERSION"]
  },
  "durable_objects": {
    "bindings": [{"name":"RESTAURANT_ROOM","class_name":"RestaurantRoom"}]
  },
  "exports": {
    "RestaurantRoom": {"type":"durable-object","storage":"sqlite"}
  },
  "dev": {
    "ip": "127.0.0.1",
    "port": 8787,
    "local_protocol": "https"
  },
  "observability": {"enabled": true}
}
```

- [ ] **Step 2: Add a separate production configuration**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hotpot-seat-manager-production",
  "main": "src/server/worker.js",
  "compatibility_date": "2026-09-01",
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*", "/ws"]
  },
  "vars": {
    "RESTAURANT_ID": "centre-street",
    "SESSION_TTL_MS": "43200000",
    "ALLOWED_ORIGIN": "https://reservation.centrestjhotpot.ca"
  },
  "secrets": {
    "required": ["PIN_SALT", "PIN_PEPPER", "PIN_VERIFIER", "PIN_VERSION"]
  },
  "durable_objects": {
    "bindings": [{"name":"RESTAURANT_ROOM","class_name":"RestaurantRoom"}]
  },
  "exports": {
    "RestaurantRoom": {"type":"durable-object","storage":"sqlite"}
  },
  "routes": [
    {"pattern":"reservation.centrestjhotpot.ca","custom_domain":true}
  ],
  "observability": {"enabled": true}
}
```

This separate file guarantees staging and production use different Worker scripts and different Durable Object namespaces.

- [ ] **Step 3: Create deterministic local-only test secrets**

`scripts/create-local-secrets.mjs` generates `.dev.vars` for the documented non-production PIN `2468`; the file remains gitignored and is never used for staging or production:

```js
import { createHmac } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const salt = 'local-test-salt';
const pepper = 'local-test-pepper-not-for-production';
const verifier = createHmac('sha256', pepper).update(`${salt}:2468`).digest('hex');
const lines = [
  `PIN_SALT=${salt}`,
  `PIN_PEPPER=${pepper}`,
  `PIN_VERIFIER=${verifier}`,
  'PIN_VERSION=local-test-v1'
];
await writeFile('.dev.vars', `${lines.join('\n')}\n`, {mode:0o600});
```

- [ ] **Step 4: Write a failing empty-schema test**

```js
import { env } from 'cloudflare:workers';
import { runInDurableObject } from 'cloudflare:test';
import { expect, test } from 'vitest';

test('new restaurant room initializes with no QA data', async () => {
  const id = env.RESTAURANT_ROOM.idFromName('schema-empty');
  const stub = env.RESTAURANT_ROOM.get(id);
  const snapshot = await runInDurableObject(stub, async instance => instance.readSnapshotForTest());
  expect(snapshot).toEqual({walkins:[],reservations:[],occupancies:[],revision:0});
});
```

- [ ] **Step 5: Run the schema test to verify failure**

Run: `cd seat-manager && node scripts/create-local-secrets.mjs && npx vitest run test/worker/schema.test.js`

Expected: FAIL because the Worker, Durable Object, and schema modules do not exist.

- [ ] **Step 6: Implement idempotent normalized tables**

`initializeSchema(sql)` must execute these idempotent tables and indexes:

```sql
CREATE TABLE IF NOT EXISTS metadata (
  restaurant_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS walkins (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 40),
  status TEXT NOT NULL CHECK (status IN ('waiting','notified','seated','left')),
  notified_at INTEGER,
  table_plan_confirmed INTEGER NOT NULL CHECK (table_plan_confirmed IN (0,1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 40),
  reserved_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed','arrived','seated','no-show','cancelled')),
  table_plan_confirmed INTEGER NOT NULL CHECK (table_plan_confirmed IN (0,1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS occupancies (
  table_id INTEGER PRIMARY KEY CHECK (table_id BETWEEN 1 AND 10),
  restaurant_id TEXT NOT NULL,
  party_id TEXT NOT NULL,
  party_kind TEXT NOT NULL CHECK (party_kind IN ('walkin','reservation')),
  party_name TEXT NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 40),
  seated_at INTEGER NOT NULL,
  expected_end_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER NOT NULL CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  pin_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_limits (
  restaurant_id TEXT NOT NULL,
  bucket_key TEXT NOT NULL,
  window_started_at INTEGER NOT NULL,
  failures INTEGER NOT NULL DEFAULT 0 CHECK (failures >= 0),
  lock_level INTEGER NOT NULL DEFAULT 0 CHECK (lock_level >= 0),
  locked_until INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (restaurant_id, bucket_key)
);

CREATE TABLE IF NOT EXISTS command_results (
  restaurant_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (restaurant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS walkins_restaurant_created ON walkins (restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS reservations_restaurant_reserved ON reservations (restaurant_id, reserved_at);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions (expires_at);
CREATE INDEX IF NOT EXISTS login_limits_expiry ON login_limits (expires_at);
CREATE INDEX IF NOT EXISTS command_results_expiry ON command_results (expires_at);
```

Schema initialization inserts only `metadata('centre-street',0)` and no guest records. All application timestamps are epoch milliseconds; restaurant-day grouping is performed in `America/Edmonton` by the preserved scheduler helpers.

- [ ] **Step 7: Implement normalized snapshot reads and targeted writes**

`readSnapshot` maps snake_case SQLite rows to the existing camelCase client shape. `applyWrites` supports `upsert` and `delete` for each entity and updates the metadata revision in the same transaction.

```js
export function readSnapshot(sql, restaurantId) {
  const metadata = [...sql.exec('SELECT revision FROM metadata WHERE restaurant_id = ?', restaurantId)][0];
  return {
    walkins: [...sql.exec('SELECT * FROM walkins WHERE restaurant_id = ? ORDER BY created_at', restaurantId)].map(mapWalkin),
    reservations: [...sql.exec('SELECT * FROM reservations WHERE restaurant_id = ? ORDER BY reserved_at', restaurantId)].map(mapReservation),
    occupancies: [...sql.exec('SELECT * FROM occupancies WHERE restaurant_id = ? ORDER BY table_id', restaurantId)].map(mapOccupancy),
    revision: Number(metadata?.revision || 0)
  };
}
```

- [ ] **Step 8: Route the Worker to one named room**

```js
export { RestaurantRoom } from './restaurant-room.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname === '/ws') {
      const id = env.RESTAURANT_ROOM.idFromName(env.RESTAURANT_ID);
      return env.RESTAURANT_ROOM.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
```

- [ ] **Step 9: Run schema and domain tests**

Run: `cd seat-manager && npm test`

Expected: schema initializes empty, persistence round-trips normalized rows, and all domain tests remain green.

- [ ] **Step 10: Commit the Worker storage foundation**

```bash
git add seat-manager/wrangler.jsonc seat-manager/wrangler.production.jsonc seat-manager/vitest.config.js seat-manager/src/server seat-manager/scripts/create-local-secrets.mjs seat-manager/test/worker/schema.test.js seat-manager/package.json seat-manager/package-lock.json
git commit -m "feat: add durable restaurant storage"
```

---

### Task 4: Implement PIN verification, cooldowns, and 12-hour sessions

**Files:**
- Create: `seat-manager/src/server/auth-crypto.js`
- Create: `seat-manager/src/server/rate-limit.js`
- Create: `seat-manager/src/server/sessions.js`
- Modify: `seat-manager/src/server/restaurant-room.js`
- Create: `seat-manager/test/worker/auth.test.js`

**Interfaces:**
- Consumes: `PIN_SALT`, `PIN_PEPPER`, `PIN_VERIFIER`, `PIN_VERSION`, `SESSION_TTL_MS`, `CF-Connecting-IP`, and client `deviceId`
- Produces: `verifyPin(pin, env)`, `loginSourceKeys(request, deviceId, env)`, `allowedOrigin(request, env)`, `issueSession(sql, env, now)`, `requireSession(request, sql, env, now)`, and `/api/login|session|logout`

- [ ] **Step 1: Write failing auth tests**

Tests must verify correct PIN, wrong PIN, malformed PIN, five-failure 15-minute cooldown, raw-IP absence from storage, source and global cooldowns, constant response shape, 12-hour expiry, HttpOnly/Secure/SameSite cookie attributes, logout, origin rejection, CSRF rejection, and PIN-version invalidation.

```js
test('fifth wrong PIN attempt returns a fifteen-minute cooldown', async () => {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await login('0000', 'device-a', '203.0.113.10');
    expect(response.status).toBe(401);
  }
  const fifth = await login('0000', 'device-a', '203.0.113.10');
  expect(fifth.status).toBe(429);
  expect(await fifth.json()).toMatchObject({code:'LOGIN_COOLDOWN',retryAfterSeconds:900});
});
```

- [ ] **Step 2: Run auth tests to verify failure**

Run: `cd seat-manager && npx vitest run test/worker/auth.test.js`

Expected: FAIL because auth modules and routes do not exist.

- [ ] **Step 3: Implement keyed PIN verification and token hashing**

```js
const encoder = new TextEncoder();

export async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin, env) {
  if (!/^\d{4}$/.test(String(pin))) return false;
  const actual = await hmacHex(env.PIN_PEPPER, `${env.PIN_SALT}:${pin}`);
  return timingSafeEqualHex(actual, env.PIN_VERIFIER);
}

export async function hashSessionToken(token) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
```

`timingSafeEqualHex` must compare equal-length decoded byte arrays without returning early.

- [ ] **Step 4: Implement separate device, network, and global rate-limit buckets**

Store only HMAC hashes. Enforce both device and network buckets at five failures per 15 minutes. Enforce a global restaurant cooldown after 100 failures within 15 minutes. The first lock is 15 minutes; repeated post-lock failures double the source cooldown up to four hours.

```js
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const FIRST_LOCK_MS = 15 * 60 * 1000;
export const MAX_LOCK_MS = 4 * 60 * 60 * 1000;

export async function loginSourceKeys(request, deviceId, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  return [
    `device:${await hmacHex(env.PIN_PEPPER, String(deviceId))}`,
    `network:${await hmacHex(env.PIN_PEPPER, ip)}`,
    'global:centre-street'
  ];
}
```

- [ ] **Step 5: Implement sessions and exact cookie policy**

```js
export const sessionCookie = token => [
  `hsm_session=${token}`,
  'Path=/',
  'HttpOnly',
  'Secure',
  'SameSite=Strict',
  'Max-Age=43200'
].join('; ');
```

Session rows store `token_hash`, `csrf_token`, `pin_version`, `created_at`, `expires_at`, and `last_seen_at`. `requireSession` rejects missing, expired, or mismatched PIN-version sessions and deletes invalid rows.

- [ ] **Step 6: Add login, session, and logout routes**

- `POST /api/login` accepts exactly `{pin,deviceId}` and returns `{authenticated:true,csrfToken,expiresAt}`.
- `GET /api/session` returns the same authenticated shape for a valid cookie and `401` otherwise.
- `POST /api/logout` requires same-origin and `X-CSRF-Token`, deletes the session, and expires the cookie.
- `allowedOrigin(request, env)` resolves `ALLOWED_ORIGIN=self` to `new URL(request.url).origin` for local/staging and otherwise returns the exact configured production origin; every state-changing request compares the complete `Origin` value against it.
- All auth responses use `Cache-Control: no-store`.

- [ ] **Step 7: Run auth and regression tests**

Run: `cd seat-manager && npm test`

Expected: all auth tests and all existing domain tests pass.

- [ ] **Step 8: Commit authentication**

```bash
git add seat-manager/src/server/auth-crypto.js seat-manager/src/server/rate-limit.js seat-manager/src/server/sessions.js seat-manager/src/server/restaurant-room.js seat-manager/test/worker/auth.test.js
git commit -m "feat: secure staff pin sessions"
```

---

### Task 5: Add authorized snapshots, commands, idempotency, and concurrency control

**Files:**
- Create: `seat-manager/src/server/command-service.js`
- Modify: `seat-manager/src/server/restaurant-room.js`
- Modify: `seat-manager/src/server/persistence.js`
- Create: `seat-manager/test/worker/commands.test.js`

**Interfaces:**
- Consumes: `requireSession`, `applyRestaurantCommand`, `readSnapshot`, `applyWrites`, and command `idempotencyKey`
- Produces: `GET /api/snapshot`, `POST /api/commands`, HTTP `409` conflict responses, and exactly-once retry behavior

- [ ] **Step 1: Write failing API and concurrency tests**

Tests must cover unauthorized reads/writes, empty snapshot, authorized create, server timestamps, target-version conflict, duplicate idempotency key, simultaneous same-table seating, joined-table atomicity, stale clearing, cross-restaurant command rejection, and persistence after a new Durable Object instance loads storage.

```js
test('two devices cannot seat different parties at table 9', async () => {
  const [first, second] = await Promise.all([
    command(sessionA, seatCommand('seat-a', 'w1', 1, [9])),
    command(sessionB, seatCommand('seat-b', 'w2', 1, [9]))
  ]);
  expect([first.status, second.status].sort()).toEqual([200, 409]);
  const snapshot = await authorizedSnapshot(sessionA);
  expect(snapshot.occupancies.filter(row => row.tableId === 9)).toHaveLength(1);
});
```

- [ ] **Step 2: Run command API tests to verify failure**

Run: `cd seat-manager && npx vitest run test/worker/commands.test.js`

Expected: FAIL because snapshot and command routes are absent.

- [ ] **Step 3: Implement idempotent command execution inside one transaction**

```js
export function executeCommand(storage, sql, restaurantId, command, context) {
  return storage.transactionSync(() => {
    const cached = readCommandResult(sql, command.idempotencyKey, restaurantId);
    if (cached) return cached;
    const current = readSnapshot(sql, restaurantId);
    const output = applyRestaurantCommand(current, command, context);
    applyWrites(sql, restaurantId, output.writes, output.snapshot.revision);
    const response = {snapshot:output.snapshot,result:output.result};
    saveCommandResult(sql, command.idempotencyKey, restaurantId, response, context.now);
    deleteExpiredCommandResults(sql, context.now - 24 * 60 * 60 * 1000);
    return response;
  });
}
```

Map `DomainCommandError` with stale versions or occupied tables to `409`; map validation errors to `400`; never return SQL or stack details.

- [ ] **Step 4: Add protected snapshot and command routes**

- `GET /api/snapshot` returns `{snapshot}` after `requireSession`.
- `POST /api/commands` requires valid session, allowed origin, matching CSRF token, JSON content type, and a body under 32 KB.
- The server ignores client restaurant IDs and always uses `env.RESTAURANT_ID`.
- Successful write responses return `{snapshot,result}` only after storage commits.

- [ ] **Step 5: Verify independent creates and conflicting edits**

Run: `cd seat-manager && npx vitest run test/worker/commands.test.js`

Expected: independent create commands both succeed; same-version edits produce one success and one `409`; same-table seating leaves one occupancy.

- [ ] **Step 6: Run the full suite**

Run: `cd seat-manager && npm test`

Expected: all domain, schema, auth, command, idempotency, and concurrency tests pass.

- [ ] **Step 7: Commit authorized commands**

```bash
git add seat-manager/src/server/command-service.js seat-manager/src/server/restaurant-room.js seat-manager/src/server/persistence.js seat-manager/test/worker/commands.test.js
git commit -m "feat: synchronize restaurant commands"
```

---

### Task 6: Add hibernating realtime WebSockets and reconnect semantics

**Files:**
- Modify: `seat-manager/src/server/restaurant-room.js`
- Create: `seat-manager/src/client/realtime.js`
- Create: `seat-manager/test/worker/realtime.test.js`
- Create: `seat-manager/test/domain/realtime-client.test.js`
- Modify: `seat-manager/scripts/build-client.mjs`

**Interfaces:**
- Consumes: authenticated session cookie, allowed `Origin`, committed `{snapshot,result}` responses
- Produces: `/ws`, `{type:'snapshot',snapshot}` messages, `createRealtimeClient(options)`, and `online|reconnecting|offline` states

- [ ] **Step 1: Write failing broadcast and reconnect tests**

Server tests verify unauthorized and wrong-origin upgrades fail, authenticated upgrades succeed, failed commands do not broadcast, committed commands broadcast one snapshot, and hibernated sockets retain only non-sensitive session attachment metadata.

Client tests use a fake WebSocket and deterministic timers:

```js
test('reconnect fetches an authoritative snapshot before reporting online', async () => {
  const events = [];
  const client = createRealtimeClient({
    socketFactory: () => fakeSocket,
    loadSnapshot: async () => { events.push('load'); return {revision:7}; },
    onSnapshot: snapshot => events.push(`snapshot:${snapshot.revision}`),
    onState: state => events.push(state),
    schedule: callback => callback()
  });
  await client.connect();
  fakeSocket.open();
  await fakeSocket.flush();
  assert.deepEqual(events.slice(-3), ['load','snapshot:7','online']);
});
```

- [ ] **Step 2: Run realtime tests to verify failure**

Run: `cd seat-manager && node --test test/domain/realtime-client.test.js && npx vitest run test/worker/realtime.test.js`

Expected: FAIL because realtime modules and `/ws` do not exist.

- [ ] **Step 3: Implement authenticated Hibernation WebSockets**

In `RestaurantRoom.fetch`, validate session and origin before upgrading. Accept sockets through `this.ctx.acceptWebSocket(server)` and serialize only `{sessionHash,pinVersion}`. On command commit, send one JSON message to every open socket:

```js
broadcastSnapshot(snapshot) {
  const message = JSON.stringify({type:'snapshot',revision:snapshot.revision,snapshot});
  for (const socket of this.ctx.getWebSockets()) {
    if (socket.readyState === WebSocket.OPEN) socket.send(message);
  }
}
```

Do not use `setInterval` or standard `ws.accept()`, because the room must remain hibernatable.

- [ ] **Step 4: Implement capped client reconnect**

`createRealtimeClient` must expose `connect()`, `disconnect()`, and `getState()`. Delays are `1s, 2s, 4s, 8s, 15s`, capped at 15 seconds. Browser `offline` immediately sets `offline`; browser `online` reconnects immediately. A reconnect loads `/api/snapshot` before write controls are re-enabled.

Extend the client build with:

```js
await cp('src/client/realtime.js', 'public/client/realtime.js');
```

- [ ] **Step 5: Run realtime and full tests**

Run: `cd seat-manager && npm test`

Expected: broadcast happens only after commit; reconnect reloads the authoritative snapshot; all earlier tests remain green.

- [ ] **Step 6: Commit realtime transport**

```bash
git add seat-manager/src/server/restaurant-room.js seat-manager/src/client/realtime.js seat-manager/test/worker/realtime.test.js seat-manager/test/domain/realtime-client.test.js seat-manager/scripts/build-client.mjs
git commit -m "feat: add realtime device updates"
```

---

### Task 7: Add the remote repository and staff PIN shell

**Files:**
- Create: `seat-manager/src/data/remote-repository.js`
- Create: `seat-manager/src/client/auth.js`
- Modify: `seat-manager/src/client/index.html`
- Modify: `seat-manager/src/client/app.js`
- Modify: `seat-manager/src/client/styles.css`
- Create: `seat-manager/test/domain/remote-repository.test.js`
- Modify: `seat-manager/scripts/build-client.mjs`

**Interfaces:**
- Consumes: `/api/login`, `/api/session`, `/api/logout`, `/api/snapshot`, `/api/commands`, `/ws`
- Produces: `createRemoteRepository({fetchImpl,getCsrfToken})`, `createAuthClient({fetchImpl,storage,uid})`, and PIN/loading/dashboard application modes

- [ ] **Step 1: Write failing remote repository tests**

Test exact methods and failure preservation:

```js
test('command sends idempotency and CSRF without discarding server conflict details', async () => {
  const fetchImpl = async (_url, options) => new Response(JSON.stringify({
    code:'TABLE_OCCUPIED',message:'桌位刚被其他设备更新',snapshot:{revision:8}
  }), {status:409,headers:{'Content-Type':'application/json'}});
  const repo = createRemoteRepository({fetchImpl,getCsrfToken:()=> 'csrf-1'});
  await assert.rejects(repo.command({type:'party.seat',idempotencyKey:'seat-1'}), error => {
    assert.equal(error.status, 409);
    assert.equal(error.snapshot.revision, 8);
    return true;
  });
});
```

- [ ] **Step 2: Run repository tests to verify failure**

Run: `cd seat-manager && node --test test/domain/remote-repository.test.js`

Expected: FAIL because the remote repository is absent.

- [ ] **Step 3: Implement same-origin HTTP clients**

All calls use `credentials:'same-origin'`. `createAuthClient({fetchImpl=fetch,storage=localStorage,uid=crypto.randomUUID})` accepts exactly four PIN digits and creates one random non-personal device ID under `hotpot-seat-manager-device-v1` when absent. The repository imports `RepositoryError`, adds `X-CSRF-Token`, preserves JSON error fields in the error's `details`, and never retries a write with a new idempotency key.

```js
export function createRemoteRepository({fetchImpl=fetch,getCsrfToken}) {
  return {
    async load() {
      const response = await fetchImpl('/api/snapshot', {credentials:'same-origin',cache:'no-store'});
      return (await requireJson(response)).snapshot;
    },
    async command(command) {
      const response = await fetchImpl('/api/commands', {
        method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json','X-CSRF-Token':getCsrfToken()},
        body:JSON.stringify(command)
      });
      return requireJson(response);
    }
  };
}
```

Extend the client build with:

```js
await cp('src/client/auth.js', 'public/client/auth.js');
await cp('src/data/remote-repository.js', 'public/data/remote-repository.js');
```

- [ ] **Step 4: Add the PIN shell and session bootstrap**

Application startup order is:

1. render Loading
2. call `/api/session`
3. render PIN form on `401`
4. after login, load snapshot
5. connect realtime
6. render dashboard only after the snapshot is ready

The PIN input uses `inputmode="numeric"`, `pattern="[0-9]{4}"`, `maxlength="4"`, and `autocomplete="off"`. It never echoes the PIN in error text or logs.

- [ ] **Step 5: Add a visible session and connection header**

The dashboard header shows a colored dot and one of `Online / 在线`, `Reconnecting / 重新连接`, or `Offline / 离线`, plus `Logout / 安全退出`. Write buttons are enabled only in `online` state.

- [ ] **Step 6: Run repository, domain, and worker tests**

Run: `cd seat-manager && npm test`

Expected: login/session bootstrap and remote errors pass unit tests; all previous tests remain green.

- [ ] **Step 7: Commit the authenticated client shell**

```bash
git add seat-manager/src/data/remote-repository.js seat-manager/src/client/auth.js seat-manager/src/client/index.html seat-manager/src/client/app.js seat-manager/src/client/styles.css seat-manager/test/domain/remote-repository.test.js seat-manager/scripts/build-client.mjs
git commit -m "feat: add staff login client"
```

---

### Task 8: Convert every staff workflow to authoritative async commands

**Files:**
- Modify: `seat-manager/src/client/app.js`
- Modify: `seat-manager/src/client/styles.css`
- Create: `seat-manager/src/client/workflows.js`
- Create: `seat-manager/test/domain/client-workflows.test.js`
- Modify: `seat-manager/scripts/build-client.mjs`

**Interfaces:**
- Consumes: `repository.command(command)`, realtime snapshots, record `version`, `connectionState`, and all `COMMAND_TYPES`
- Produces: `createWorkflowController({repository,getConnectionState,onSnapshot,onSuccess,onError})`, async Walk-in, reservation, drag/seat, status, clear, retry, and retained-form workflows

- [ ] **Step 1: Write failing client-workflow tests**

Use `createWorkflowController` with a fake repository to cover every current action mapping:

| UI action | Command type |
| --- | --- |
| Add Walk-in | `walkin.create` |
| Notify / Notify again | `walkin.notify` |
| Left | `walkin.cancel` |
| Add reservation | `reservation.create` |
| Edit reservation | `reservation.edit` |
| Arrived | `reservation.status` with `arrived` |
| No-show | `reservation.status` with `no-show` |
| Cancel reservation | `reservation.status` with `cancelled` |
| Confirm joined tables | `party.confirmTablePlan` |
| Manual/automatic/drag seating | `party.seat` |
| Clear table | `table.clear` |

```js
test('failed reservation save keeps the completed form and shows Retry', async () => {
  let modal = {values:{name:'Jessica',phone:'4035550100',partySize:'4',reservedAt:'2026-09-02T00:00'}};
  let operationError = null;
  const controller = createWorkflowController({
    repository:{command:async () => { throw new RepositoryError(503,'RETRY','网络暂时不可用'); }},
    getConnectionState:()=> 'online',
    onSnapshot:()=> {},
    onSuccess:()=> { modal = null; },
    onError:error => { operationError = error; }
  });
  await controller.submit({type:'reservation.create',idempotencyKey:'create-1'});
  assert.deepEqual(modal.values, {name:'Jessica',phone:'4035550100',partySize:'4',reservedAt:'2026-09-02T00:00'});
  assert.equal(operationError.retry, true);
});
```

- [ ] **Step 2: Run workflow tests to verify failure**

Run: `cd seat-manager && node --test test/domain/client-workflows.test.js`

Expected: FAIL because the UI still mutates local snapshots directly.

- [ ] **Step 3: Replace direct mutation with one command helper**

Move command submission state into `src/client/workflows.js`. `createWorkflowController` owns `pendingCommand`, exposes `submit(command)`, `retry()`, and `clearPending()`, and reuses the exact pending object during retry. It calls `onSnapshot` when either success or conflict returns an authoritative snapshot. A network/server failure calls `onError({message,retry:true,code})` and retains the pending command; a `409` calls `onError({message,retry:false,code})` and clears it so staff must reconfirm against the current state. `onSuccess` is the only callback allowed to clear `modal.values`. `app.js` delegates every write to this controller.

```js
export function createWorkflowController({repository,getConnectionState,onSnapshot,onSuccess,onError}) {
  let pendingCommand = null;
  const run = async command => {
    if (getConnectionState() !== 'online') {
      onError({message:'目前离线，重新连接后再试',retry:false,code:'OFFLINE'});
      return false;
    }
    pendingCommand = command;
    try {
      const output = await repository.command(command);
      onSnapshot(output.snapshot);
      pendingCommand = null;
      onSuccess(output.result);
      return true;
    } catch (error) {
      if (error.snapshot) onSnapshot(error.snapshot);
      const conflict = error.status === 409;
      if (conflict) pendingCommand = null;
      onError({message:error.message,retry:!conflict,code:error.code});
      return false;
    }
  };
  return {
    submit:run,
    retry:()=> pendingCommand ? run(pendingCommand) : Promise.resolve(false),
    clearPending:()=> { pendingCommand = null; }
  };
}
```

Every command receives one `crypto.randomUUID()` idempotency key that is retained unchanged when Retry is clicked.

Extend the client build with:

```js
await cp('src/client/workflows.js', 'public/client/workflows.js');
```

- [ ] **Step 4: Convert forms without losing user input**

Before rendering a pending add/edit form, copy current `FormData` into `modal.values`. On failure or session re-login, render inputs from `modal.values`. Clear the modal only after a successful server response.

- [ ] **Step 5: Convert drag, seat, and conflict behavior**

Drag confirmation sends `party.seat` with `partyId`, `partyKind`, `expectedVersion`, and selected table IDs. A `409` response closes only the table-selection confirmation, keeps the authoritative snapshot, and shows `桌位刚被其他设备更新，请重新选择`.

- [ ] **Step 6: Preserve all reviewed UI behavior**

Verify direct phone display, highlighted names, five-minute notification elapsed time, reservation dragging, Arrived, 15-minute no-show enablement, larger iPad typography, wrapped dining-start labels, bright section panels, and five-row previews remain in rendered output.

- [ ] **Step 7: Run the complete test suite**

Run: `cd seat-manager && npm test`

Expected: every action maps to one server command, failed forms remain populated, and all scheduling/auth/concurrency/realtime tests pass.

- [ ] **Step 8: Commit async staff workflows**

```bash
git add seat-manager/src/client/app.js seat-manager/src/client/styles.css seat-manager/src/client/workflows.js seat-manager/test/domain/client-workflows.test.js seat-manager/scripts/build-client.mjs
git commit -m "feat: use authoritative staff workflows"
```

---

### Task 9: Add installability, privacy controls, security headers, and backup export

**Files:**
- Create: `seat-manager/src/client/manifest.webmanifest`
- Create: `seat-manager/src/client/icon.svg`
- Create: `seat-manager/src/client/sw.js`
- Modify: `seat-manager/src/client/index.html`
- Modify: `seat-manager/src/server/worker.js`
- Modify: `seat-manager/src/server/restaurant-room.js`
- Modify: `seat-manager/scripts/build-client.mjs`
- Create: `seat-manager/test/worker/security.test.js`
- Create: `seat-manager/test/domain/service-worker.test.js`

**Interfaces:**
- Consumes: authenticated session and generated static assets
- Produces: installable PWA shell, restrictive headers, no customer-data caching, and `GET /api/export`

- [ ] **Step 1: Write failing security and cache tests**

Verify protected responses contain `Cache-Control: no-store`; static responses contain CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and frame denial; the service worker never matches `/api/` or `/ws`; the backup endpoint requires authentication; and exported JSON contains only restaurant snapshot data and export metadata.

- [ ] **Step 2: Run tests to verify failure**

Run: `cd seat-manager && node --test test/domain/service-worker.test.js && npx vitest run test/worker/security.test.js`

Expected: FAIL because PWA assets, security headers, and export route do not exist.

- [ ] **Step 3: Add exact web-app metadata**

```json
{
  "name": "Hotpot Seat Manager",
  "short_name": "Seat Manager",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f6f5f2",
  "theme_color": "#9b2f27",
  "icons": [{"src":"/icon.svg","sizes":"any","type":"image/svg+xml","purpose":"any maskable"}]
}
```

- [ ] **Step 4: Cache only the application shell**

```js
const CACHE = 'hotpot-seat-shell-v1';
const SHELL = ['/', '/client/styles.css', '/client/app.js', '/client/auth.js', '/client/realtime.js', '/data/remote-repository.js', '/domain/scheduler.js', '/domain/tables.js', '/domain/commands.js', '/shared/contracts.js', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname === '/ws') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
```

- [ ] **Step 5: Add security headers in one response helper**

The CSP must be exactly compatible with local modules and no third parties:

```js
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' wss:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
```

Clone asset responses before setting CSP, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

- [ ] **Step 6: Add authenticated JSON export**

`GET /api/export` returns a download named `hotpot-seat-manager-YYYY-MM-DD.json` with:

```json
{
  "format": "hotpot-seat-manager-online-v1",
  "restaurantId": "centre-street",
  "exportedAt": 1788267600000,
  "snapshot": {"walkins":[],"reservations":[],"occupancies":[],"revision":0}
}
```

The route requires a valid session and uses `Cache-Control: no-store` and `Content-Disposition: attachment`.

- [ ] **Step 7: Run security and full tests**

Run: `cd seat-manager && npm test`

Expected: API data is not cacheable, static shell is installable, headers pass, backup requires authentication, and all previous tests pass.

- [ ] **Step 8: Commit PWA and security completion**

```bash
git add seat-manager/src/client/manifest.webmanifest seat-manager/src/client/icon.svg seat-manager/src/client/sw.js seat-manager/src/client/index.html seat-manager/src/server/worker.js seat-manager/src/server/restaurant-room.js seat-manager/scripts/build-client.mjs seat-manager/test/worker/security.test.js seat-manager/test/domain/service-worker.test.js
git commit -m "feat: secure installable seat manager"
```

---

### Task 10: Add multi-device end-to-end and responsive acceptance tests

**Files:**
- Create: `seat-manager/e2e/online.spec.mjs`
- Create: `seat-manager/e2e/run-local.mjs`
- Modify: `seat-manager/package.json`
- Create: `seat-manager/test/domain/render-contract.test.js`

**Interfaces:**
- Consumes: local Wrangler HTTPS server at `https://127.0.0.1:8787` and deterministic local PIN `2468`
- Produces: repeatable multi-browser realtime, concurrency, reconnect, and viewport evidence

- [ ] **Step 1: Write a failing rendered-contract test**

The test reads built HTML/CSS and asserts the login form, connection states, 44-pixel minimum targets, panel colors, guest highlights, overflow wrapping, manifest link, and service-worker registration are present.

- [ ] **Step 2: Write the multi-context Playwright flow**

`run-local.mjs` runs the client build and local-secret generator, creates `temporaryDirectory` with `mkdtemp(join(tmpdir(),'hotpot-seat-e2e-'))`, and starts Wrangler with `spawn('npx',['wrangler','dev','--config','wrangler.jsonc','--persist-to',temporaryDirectory])`. It waits for `https://127.0.0.1:8787`, launches Chromium with `ignoreHTTPSErrors:true`, imports the acceptance flow from `online.spec.mjs`, and always terminates Wrangler and removes only `temporaryDirectory` in `finally`. This prevents records from an older E2E run affecting the next run. The acceptance flow creates four clean contexts and uses iPad mini landscape `1133x744`, Android tablet `1280x800`, narrow phone portrait `390x844`, and desktop `1440x900` viewports. It must:

1. login all four contexts with test PIN `2468`
2. create a Walk-in on context A and observe it on B, C, and D without reload
3. notify it and observe the notification timer state everywhere
4. create a reservation on B and observe phone and totals on A, C, and D
5. mark Arrived and drag/seat from another context
6. race two seating commands against one table and assert one conflict
7. disconnect one page, assert Offline, reconnect, and assert authoritative reload
8. capture screenshots outside the repository under the process temporary directory
9. assert no console error or framework overlay

- [ ] **Step 3: Install Chromium and run end-to-end tests to expose integration failures**

Run: `cd seat-manager && npx playwright install chromium && npm run e2e`

Expected before fixes: FAIL on any remaining wiring, rendered overflow, drag, realtime, or reconnect defect.

- [ ] **Step 4: Fix only acceptance defects and rerun all tests**

Run: `cd seat-manager && npm test && npm run e2e`

Expected: all automated tests pass at all four viewports; no console errors; one device's changes appear on the others without refresh.

- [ ] **Step 5: Commit end-to-end acceptance**

```bash
git add seat-manager/e2e seat-manager/package.json seat-manager/package-lock.json seat-manager/test/domain/render-contract.test.js seat-manager/src/client seat-manager/src/data seat-manager/src/server
git commit -m "test: verify multi-device seat manager"
```

---

### Task 11: Add masked PIN provisioning and deploy staging

**Files:**
- Create: `seat-manager/scripts/provision-pin.mjs`
- Create: `seat-manager/test/domain/provision-pin.test.js`
- Modify: `seat-manager/package.json`
- Create: `seat-manager/README.md`

**Interfaces:**
- Consumes: interactive terminal, Cloudflare login, staging Worker config
- Produces: non-logging PIN secret upload and a staging `workers.dev` deployment

- [ ] **Step 1: Write failing provisioning tests**

Inject fake prompt and bulk-secret-writer functions. Verify exactly four digits, confirmation match, random salt/pepper/version creation, HMAC verifier output, no plaintext return value, and one atomic bulk write containing exactly the four required secret names.

- [ ] **Step 2: Implement the masked provisioning interface**

```js
export async function buildPinSecrets({readHidden,randomHex,hmacHex}) {
  const first = await readHidden('输入新的 4 位 PIN: ');
  const second = await readHidden('再次输入 PIN: ');
  if (!/^\d{4}$/.test(first)) throw new Error('PIN 必须正好是 4 位数字');
  if (first !== second) throw new Error('两次输入的 PIN 不一致');
  const salt = randomHex(16);
  const pepper = randomHex(32);
  const version = randomHex(16);
  const verifier = await hmacHex(pepper, `${salt}:${first}`);
  return {PIN_SALT:salt,PIN_PEPPER:pepper,PIN_VERIFIER:verifier,PIN_VERSION:version};
}
```

The executable entrypoint parses only `--config wrangler.jsonc` or `--config wrangler.production.jsonc`, then runs `spawn('npx',['wrangler','secret','bulk','--config',config],{stdio:['pipe','inherit','inherit']})` and sends one JSON object through the child stdin. It clears its in-memory references after completion and never writes or prints secret values. This provisions all four names atomically before the required-secret deployment check runs.

- [ ] **Step 3: Document safe local and staging operation**

README instructions include build, tests, local PIN `2468`, staging deployment, production deployment gate, JSON backup, logout, and free-tier usage checks. It explicitly states that production PINs must never be pasted into chat or committed.

Add the two masked provisioning commands to `package.json`:

```json
{
  "scripts": {
    "provision:staging": "node scripts/provision-pin.mjs --config wrangler.jsonc",
    "provision:production": "node scripts/provision-pin.mjs --config wrangler.production.jsonc"
  }
}
```

- [ ] **Step 4: Run every local verification**

Run: `cd seat-manager && npm test && npm run e2e && npm run build`

Expected: all suites pass; generated public assets contain no `2468`, PIN verifier, pepper, session token, or Cloudflare credential.

- [ ] **Step 5: Pause for action-time deployment confirmation**

Report the exact files, test counts, current branch, and staging Worker name. Ask the owner to authorize creating/updating the Cloudflare staging Worker and Durable Object before running any deployment command.

- [ ] **Step 6: Provision a staging PIN locally and deploy staging**

Run only after approval:

```bash
cd seat-manager
npm run provision:staging
npm run deploy:staging
```

Expected: Wrangler returns a `workers.dev` URL; `GET /api/session` returns `401` without a session; the page shows the PIN screen over HTTPS.

- [ ] **Step 7: Verify staging from computer, iPad, and Android**

Run the complete acceptance sequence with the user: realtime create, notify, Arrived, reservation drag, seat, clear, reconnect, restart persistence, and wrong-PIN cooldown. Confirm the staging database contains only the test records created during this acceptance run.

- [ ] **Step 8: Commit provisioning and operating documentation**

```bash
git add seat-manager/scripts/provision-pin.mjs seat-manager/test/domain/provision-pin.test.js seat-manager/package.json seat-manager/package-lock.json seat-manager/README.md
git commit -m "docs: prepare seat manager deployment"
```

---

### Task 12: Deploy the empty production system and verify the custom domain

**Files:**
- Modify only if staging revealed a verified defect: exact affected `seat-manager/` source and matching tests
- No production PIN file is created

**Interfaces:**
- Consumes: approved staging build, `wrangler.production.jsonc`, owner-entered production PIN, Cloudflare-managed `centrestjhotpot.ca`
- Produces: `https://reservation.centrestjhotpot.ca/` with an empty production database and verified cross-device synchronization

- [ ] **Step 1: Prove the release candidate is clean**

Run:

```bash
cd seat-manager
npm test
npm run e2e
npm run build
rg -n "2468|PIN_PEPPER|PIN_VERIFIER|hsm_session=" public
```

Expected: tests pass; the final `rg` returns no secret values or cookie contents. Variable names may exist only in server source, never in `public/`.

- [ ] **Step 2: Pause for production action-time confirmation**

Show the staging URL and acceptance results. Ask the owner to authorize creation of the production Worker/Durable Object, encrypted secrets, and custom domain route. Do not ask the owner to reveal the PIN.

- [ ] **Step 3: Provision production PIN through the masked local prompt**

Run only after confirmation:

```bash
cd seat-manager
npm run provision:production
```

Expected: four encrypted production secrets are written through Wrangler; the terminal prints only the secret names and success state.

- [ ] **Step 4: Deploy production and verify empty initialization**

Run:

```bash
cd seat-manager
npm run deploy:production
```

After login, call the authenticated snapshot endpoint and confirm exactly:

```json
{"walkins":[],"reservations":[],"occupancies":[],"revision":0}
```

- [ ] **Step 5: Verify the custom domain and public-site isolation**

Check:

- `https://reservation.centrestjhotpot.ca/` returns the PIN screen with valid HTTPS
- `https://centrestjhotpot.ca/` remains unchanged and continues serving the public restaurant site
- production browser assets contain no secrets
- API responses use `Cache-Control: no-store`
- wrong-origin commands are rejected

- [ ] **Step 6: Run the production three-device acceptance flow**

On iPad, Android, and computer, verify add Walk-in, notification time, five-minute state, add/edit reservation, direct phone display, Arrived, drag-to-table, simultaneous conflict, clear table, refresh persistence, and reconnect state. Close the acceptance Walk-in/reservation through their normal terminal statuses and clear every occupied table; do not delete rows or reset the database.

- [ ] **Step 7: Add the web app to each home screen**

Use Safari and Chrome installation controls. Confirm standalone launch, readable iPad mini landscape text, no personal Apple account requirement, and PIN re-entry after the 12-hour session expires.

- [ ] **Step 8: Check free-tier usage after one week**

Review Worker requests, Durable Object requests/duration, and SQLite reads/writes. Report whether current usage remains comfortably inside the free limits. Do not enable a paid plan without separate owner approval.

- [ ] **Step 9: Record final release evidence**

Record the production URL, deployed Worker version, test totals, live device matrix, and verified public-site isolation in `seat-manager/README.md`, then commit only that evidence update:

```bash
git add seat-manager/README.md
git commit -m "docs: record seat manager release"
```

---

## Final Verification Checklist

- [ ] Existing 30 business-rule tests remain green.
- [ ] New command, auth, rate-limit, session, schema, idempotency, concurrency, realtime, security, PWA, and client-workflow tests pass.
- [ ] Multi-context Playwright tests pass at iPad mini, Android tablet, narrow phone, and desktop sizes.
- [ ] No production PIN, verifier, pepper, token, or Cloudflare credential appears in source history, public assets, documentation, screenshots, or logs.
- [ ] Staging and production use separate Worker scripts and Durable Object namespaces.
- [ ] Production initializes with no QA records.
- [ ] A change on one device appears on the other devices without refresh.
- [ ] Two devices cannot create duplicate occupancy on one table.
- [ ] Offline and reconnect states are visible, and offline writes are disabled.
- [ ] Failed forms retain user-entered values and offer Retry.
- [ ] `reservation.centrestjhotpot.ca` works over HTTPS and installs to device home screens.
- [ ] `centrestjhotpot.ca` remains unchanged.
- [ ] Cloudflare usage remains on the free plan unless the owner separately approves a change.
