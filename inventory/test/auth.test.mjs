import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  isFourDigitPin,
  safeEqualText,
  createSession,
  verifySession,
  readCookie,
  checkLoginAllowed,
  recordLoginFailure,
  clearLoginFailures,
} from "../src/auth.mjs";

function createLoginDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("CREATE TABLE login_attempts (client_key TEXT PRIMARY KEY, failures INTEGER NOT NULL DEFAULT 0, window_started_at INTEGER NOT NULL, locked_until INTEGER)");
  const db = {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        bind(...values) {
          return {
            first: () => statement.get(...values) ?? null,
            run: () => statement.run(...values),
          };
        },
      };
    },
  };
  return {
    db,
    row: (key) => sqlite.prepare("SELECT failures, window_started_at, locked_until FROM login_attempts WHERE client_key = ?").get(key) ?? null,
    close: () => sqlite.close(),
  };
}

function synchronizeFailureReads(db) {
  const readers = [];
  return {
    prepare(sql) {
      const prepared = db.prepare(sql);
      return {
        bind(...values) {
          const bound = prepared.bind(...values);
          if (!sql.startsWith("SELECT failures")) return bound;
          return {
            ...bound,
            first: () => new Promise((resolve) => {
              const snapshot = bound.first();
              readers.push(() => resolve(snapshot));
              if (readers.length === 2) readers.splice(0).forEach((release) => release());
            }),
          };
        },
      };
    },
  };
}

test("accepts exactly four ASCII digits", () => {
  assert.equal(isFourDigitPin("0123"), true);
  assert.equal(isFourDigitPin("123"), false);
  assert.equal(isFourDigitPin("12345"), false);
  assert.equal(isFourDigitPin("12a4"), false);
});

test("constant-time text comparison reports equality", () => {
  assert.equal(safeEqualText("1234", "1234"), true);
  assert.equal(safeEqualText("1234", "9999"), false);
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

test("allows attempts one through four and locks on attempt five", async (t) => {
  const { db, row, close } = createLoginDb();
  t.after(close);
  const now = 1_000_000;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await recordLoginFailure(db, "client", now);
    assert.equal(row("client").failures, attempt);
    assert.equal(await checkLoginAllowed(db, "client", now), true);
  }

  await recordLoginFailure(db, "client", now);
  assert.deepEqual({ ...row("client") }, { failures: 5, window_started_at: now, locked_until: now + 15 * 60_000 });
  assert.equal(await checkLoginAllowed(db, "client", now), false);
});

test("allows login when the fifteen-minute lock expires", async (t) => {
  const { db, close } = createLoginDb();
  t.after(close);
  const now = 2_000_000;
  for (let attempt = 0; attempt < 5; attempt += 1) await recordLoginFailure(db, "client", now);

  assert.equal(await checkLoginAllowed(db, "client", now + 15 * 60_000 - 1), false);
  assert.equal(await checkLoginAllowed(db, "client", now + 15 * 60_000), true);
});

test("resets failures after the fifteen-minute window", async (t) => {
  const { db, row, close } = createLoginDb();
  t.after(close);
  const now = 3_000_000;
  for (let attempt = 0; attempt < 4; attempt += 1) await recordLoginFailure(db, "client", now);

  await recordLoginFailure(db, "client", now + 15 * 60_000);

  assert.deepEqual({ ...row("client") }, { failures: 1, window_started_at: now + 15 * 60_000, locked_until: null });
});

test("clears failures after a successful login", async (t) => {
  const { db, row, close } = createLoginDb();
  t.after(close);
  await recordLoginFailure(db, "client", 4_000_000);

  await clearLoginFailures(db, "client");

  assert.equal(row("client"), null);
  assert.equal(await checkLoginAllowed(db, "client", 4_000_000), true);
});

test("concurrent failures increment atomically", async (t) => {
  const { db, row, close } = createLoginDb();
  t.after(close);
  const now = 5_000_000;
  for (let attempt = 0; attempt < 3; attempt += 1) await recordLoginFailure(db, "client", now);
  const concurrentDb = synchronizeFailureReads(db);

  await Promise.all([
    recordLoginFailure(concurrentDb, "client", now),
    recordLoginFailure(concurrentDb, "client", now),
  ]);

  assert.equal(row("client").failures, 5);
  assert.equal(await checkLoginAllowed(db, "client", now), false);
});
