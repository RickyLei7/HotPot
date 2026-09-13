import test from "node:test";
import assert from "node:assert/strict";
import { isFourDigitPin, safeEqualText, createSession, verifySession, readCookie } from "../src/auth.mjs";

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
