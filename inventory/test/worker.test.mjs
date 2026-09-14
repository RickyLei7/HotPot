import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";
import { createSession } from "../src/auth.mjs";
import { createItem, deleteOrder, listItems, listOrders, recordOrder, updateItem } from "../src/db.mjs";

const SECRET = "a sufficiently long test secret";

class FakeD1 {
  constructor(steps = []) {
    this.steps = [...steps];
    this.calls = [];
  }

  prepare(sql) {
    return {
      bind: (...values) => ({
        first: () => this.#execute("first", sql, values),
        all: () => this.#execute("all", sql, values),
        run: () => this.#execute("run", sql, values),
      }),
    };
  }

  #execute(method, sql, values) {
    this.calls.push({ method, sql, values });
    const step = this.steps.shift();
    assert.ok(step, `unexpected ${method} query: ${sql}`);
    if (step.method) assert.equal(method, step.method);
    if (step.sql) assert.match(sql, step.sql);
    if (step.error) throw step.error;
    return step.result;
  }
}

function env(overrides = {}) {
  return {
    INVENTORY_PIN: "1234",
    SESSION_SECRET: SECRET,
    DB: overrides.DB,
    ASSETS: { fetch: async () => new Response("asset") },
    ...overrides,
  };
}

async function authenticatedHeaders() {
  return { cookie: `inventory_session=${await createSession(SECRET)}` };
}

async function jsonRequest(path, method, body) {
  return new Request(`https://inventory.example${path}`, {
    method,
    headers: { ...(await authenticatedHeaders()), "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("rejects protected API calls without a session", async () => {
  const response = await worker.fetch(new Request("https://inventory.example/api/items"), env({ DB: {} }));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Authentication required", code: "UNAUTHORIZED" });
  assert.equal(response.headers.get("cache-control"), "no-store");
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

test("rejects an authenticated future order date before writing", async () => {
  const DB = { prepare() { throw new Error("must not write invalid date"); } };
  const response = await worker.fetch(await jsonRequest("/api/items/1/orders", "POST", { date: "2999-01-01" }), env({ DB }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_INPUT");
});

test("serves browser assets outside the API", async () => {
  const response = await worker.fetch(new Request("https://inventory.example/"), env({ DB: {} }));
  assert.equal(await response.text(), "asset");
});

test("repository groups order dates and sorts item views", async () => {
  const db = new FakeD1([
    { method: "all", sql: /FROM items/, result: { results: [
      { id: 1, name: "Rice", manual_interval_days: null, notes: "", active: 1 },
      { id: 2, name: "Beef", manual_interval_days: 7, notes: "frozen", active: 1 },
    ] } },
    { method: "all", sql: /FROM order_events/, result: { results: [
      { item_id: 2, order_date: "2026-09-10" },
      { item_id: 1, order_date: "2026-09-01" },
    ] } },
  ]);

  const items = await listItems(db, "2026-09-13", true);

  assert.deepEqual(items.map(({ id, lastOrderDate }) => [id, lastOrderDate]), [[2, "2026-09-10"], [1, "2026-09-01"]]);
  assert.match(db.calls[0].sql, /WHERE active = 1/);
});

test("repository item writes normalize names and report missing updates", async () => {
  const db = new FakeD1([
    { method: "first", sql: /INSERT INTO items/, result: { id: 8 } },
    { method: "run", sql: /UPDATE items/, result: { meta: { changes: 0 } } },
  ]);

  assert.equal(await createItem(db, { name: "  Tofu  ", manualIntervalDays: null, notes: "" }), 8);
  assert.deepEqual(db.calls[0].values, ["Tofu", null, ""]);
  await assert.rejects(
    updateItem(db, 99, { name: "Soup", manualIntervalDays: 3, notes: "x", active: false }),
    (error) => error.code === "NOT_FOUND",
  );
});

test("repository maps duplicate orders and scopes deletion to the item", async () => {
  const db = new FakeD1([
    { method: "first", sql: /INSERT INTO order_events/, error: new Error("UNIQUE constraint failed") },
    { method: "run", sql: /DELETE FROM order_events/, result: { meta: { changes: 1 } } },
    { method: "all", sql: /ORDER BY order_date DESC/, result: { results: [{ id: 4, order_date: "2026-09-12" }] } },
  ]);

  await assert.rejects(recordOrder(db, 2, "2026-09-12"), (error) => error.code === "DUPLICATE");
  await deleteOrder(db, 2, 4);
  assert.deepEqual(db.calls[1].values, [4, 2]);
  assert.deepEqual(await listOrders(db, 2), [{ id: 4, order_date: "2026-09-12" }]);
});

test("creates a validated item and returns its id", async () => {
  const DB = new FakeD1([{ method: "first", sql: /INSERT INTO items/, result: { id: 7 } }]);
  const response = await worker.fetch(await jsonRequest("/api/items", "POST", {
    name: "  Chili oil  ", manualIntervalDays: 14, notes: "case", active: true,
  }), env({ DB }));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { data: { id: 7 } });
  assert.deepEqual(DB.calls[0].values, ["Chili oil", 14, "case"]);
});

test("rejects malformed item input without querying", async () => {
  const DB = { prepare() { throw new Error("must not query invalid input"); } };
  const response = await worker.fetch(await jsonRequest("/api/items", "POST", {
    name: " ", manualIntervalDays: 0, notes: "", active: true,
  }), env({ DB }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_INPUT");
});

test("maps duplicate item and order writes to conflict", async () => {
  for (const [path, body, sql] of [
    ["/api/items", { name: "Rice", manualIntervalDays: null, notes: "", active: true }, /INSERT INTO items/],
    ["/api/items/3/orders", { date: "2026-09-12" }, /INSERT INTO order_events/],
  ]) {
    const DB = new FakeD1([{ method: "first", sql, error: new Error("UNIQUE constraint failed") }]);
    const response = await worker.fetch(await jsonRequest(path, "POST", body), env({ DB }));
    assert.equal(response.status, 409);
    assert.equal((await response.json()).code, "DUPLICATE");
  }
});

test("updates items and reports an unknown item", async () => {
  const DB = new FakeD1([{ method: "run", sql: /UPDATE items/, result: { meta: { changes: 0 } } }]);
  const response = await worker.fetch(await jsonRequest("/api/items/404", "PATCH", {
    name: "Rice", manualIntervalDays: 30, notes: "dry", active: false,
  }), env({ DB }));
  assert.equal(response.status, 404);
  assert.equal((await response.json()).code, "NOT_FOUND");
});

test("lists and deletes item order events", async () => {
  const DB = new FakeD1([
    { method: "all", sql: /ORDER BY order_date DESC/, result: { results: [{ id: 9, order_date: "2026-09-11" }] } },
    { method: "run", sql: /DELETE FROM order_events/, result: { meta: { changes: 1 } } },
  ]);
  const headers = await authenticatedHeaders();
  const listed = await worker.fetch(new Request("https://inventory.example/api/items/2/orders", { headers }), env({ DB }));
  assert.deepEqual(await listed.json(), { data: [{ id: 9, order_date: "2026-09-11" }] });
  const deleted = await worker.fetch(new Request("https://inventory.example/api/items/2/orders/9", { method: "DELETE", headers }), env({ DB }));
  assert.equal(deleted.status, 200);
  assert.deepEqual(await deleted.json(), { data: { id: 9 } });
});

test("exports RFC 4180 CSV with a UTF-8 BOM", async () => {
  const DB = new FakeD1([
    { method: "all", sql: /LEFT JOIN order_events/, result: { results: [
      { item_name: "Sauce, hot", active: 1, manual_interval_days: 7, order_date: "2026-09-10", notes: "say \"yes\"" },
    ] } },
  ]);
  const response = await worker.fetch(new Request("https://inventory.example/api/export.csv", { headers: await authenticatedHeaders() }), env({ DB }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/csv; charset=utf-8");
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.equal(new TextDecoder().decode(bytes.slice(3)), 'item_name,active,manual_interval_days,order_date,notes\r\n"Sauce, hot",true,7,2026-09-10,"say ""yes"""\r\n');
});

test("login hides missing configuration and rejects malformed PINs", async () => {
  const missing = await worker.fetch(new Request("https://inventory.example/api/login", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin: "1234" }),
  }), env({ SESSION_SECRET: "" }));
  assert.equal(missing.status, 500);
  assert.equal((await missing.json()).code, "CONFIGURATION_ERROR");

  const malformed = await worker.fetch(new Request("https://inventory.example/api/login", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin: "12" }),
  }), env({ DB: { prepare() { throw new Error("must not query malformed PIN"); } } }));
  assert.equal(malformed.status, 401);
});

test("login enforces lockout and sets a session after success", async () => {
  const lockedDb = new FakeD1([{ method: "first", sql: /SELECT locked_until/, result: { locked_until: Date.now() + 60_000 } }]);
  const locked = await worker.fetch(new Request("https://inventory.example/api/login", {
    method: "POST", headers: { "content-type": "application/json", "CF-Connecting-IP": "192.0.2.1" }, body: JSON.stringify({ pin: "1234" }),
  }), env({ DB: lockedDb }));
  assert.equal(locked.status, 429);

  const successDb = new FakeD1([
    { method: "first", sql: /SELECT locked_until/, result: null },
    { method: "run", sql: /DELETE FROM login_attempts/, result: { meta: { changes: 0 } } },
  ]);
  const success = await worker.fetch(new Request("https://inventory.example/api/login", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin: "1234" }),
  }), env({ DB: successDb }));
  assert.equal(success.status, 200);
  assert.match(success.headers.get("set-cookie"), /^inventory_session=.+; Path=\//);
});

test("logout expires the session and unknown API routes return JSON 404", async () => {
  const logout = await worker.fetch(new Request("https://inventory.example/api/logout", { method: "POST" }), env({ DB: {} }));
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);

  const missing = await worker.fetch(new Request("https://inventory.example/api/nope", { headers: await authenticatedHeaders() }), env({ DB: {} }));
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).code, "NOT_FOUND");
});

test("unknown API routes return 404 without requiring a session", async () => {
  const response = await worker.fetch(new Request("https://inventory.example/api/nope"), env({ DB: {} }));
  assert.equal(response.status, 404);
  assert.equal((await response.json()).code, "NOT_FOUND");
});
