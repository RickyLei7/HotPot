import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { orderRecordedMessage } from "../public/order-copy.mjs";

const [html, js, css] = await Promise.all([
  readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  readFile(new URL("../public/styles.css", import.meta.url), "utf8"),
]);

test("new items cannot promise an unsupported archived state", () => {
  assert.match(html, /id="active-row"/);
  assert.match(js, /querySelector\("#active-row"\)\.hidden = !item/);
});

test("order undo is established before the item-list refetch", () => {
  const createOrder = js.slice(js.indexOf("async function createOrder"), js.indexOf("function renderCard"));
  assert.ok(createOrder.indexOf("showUndo(") < createOrder.indexOf("await refreshItems()"));
  assert.match(createOrder, /catch \(refreshError\)/);
});

test("order confirmation distinguishes backdated orders from today's order", () => {
  assert.equal(orderRecordedMessage("Tofu", "2026-08-01", "2026-09-13"), "已记录「Tofu」2026-08-01 叫货");
  assert.equal(orderRecordedMessage("Tofu", "2026-09-13", "2026-09-13"), "已记录「Tofu」今天叫货");
});

test("history rendering rejects stale requests and invalidates on close", () => {
  assert.match(js, /const requestId = \+\+historyRequestId/);
  assert.match(js, /if \(requestId !== historyRequestId\) return/);
  assert.match(js, /historyDialog\.addEventListener\("close", \(\) => \{ historyRequestId \+= 1; \}\)/);
});

test("secondary hover controls use contrasting text", () => {
  assert.match(css, /\.secondary:hover[^}]+background: var\(--red-dark\);[^}]+color: white;/s);
});

test("visible statuses clear and cannot intercept controls", () => {
  assert.match(js, /statusTimer = setTimeout\([\s\S]+?, 4_000\)/);
  assert.match(css, /\.sr-status[^}]+pointer-events: none;/s);
});
