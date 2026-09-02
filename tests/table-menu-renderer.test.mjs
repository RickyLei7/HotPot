import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  escapeHtml,
  renderTableMenuJsonLd,
  renderTableMenuMarkup,
} from "../scripts/lib/table-menu-renderer.mjs";

const menu = JSON.parse(await readFile(new URL(
  "../content/table-menu/menu.json",
  import.meta.url,
), "utf8"));

test("HTML escaping is safe", () => {
  assert.equal(escapeHtml(`<script>&"'`), "&lt;script&gt;&amp;&quot;&#39;");
});

test("rendered menu has required controls and view-only notices", () => {
  const html = renderTableMenuMarkup(menu);
  assert.match(html, /data-table-menu-language="en"/u);
  assert.match(html, /data-table-menu-language="zh"/u);
  assert.match(html, /View-only menu — please order with your server\./u);
  assert.match(html, /此菜單僅供瀏覽，請向服務員點單。/u);
  assert.match(html, /data-table-menu-search/u);
  assert.match(html, /data-category="appetizers"/u);
  assert.doesNotMatch(html, /add to cart|checkout|quantity|place order|<form\b/iu);
});

test("featured cards are emitted in approved order", () => {
  const html = renderTableMenuMarkup(menu);
  const ids = menu.featuredOrder.map((id) => html.indexOf(`data-featured-id="${id}"`));
  assert.ok(ids.every((index) => index >= 0));
  assert.deepEqual([...ids].sort((a, b) => a - b), ids);
});

test("JSON-LD describes a CAD Menu at the canonical route", () => {
  const jsonLd = renderTableMenuJsonLd(menu, "https://centrestjhotpot.ca/table-menu/");
  assert.equal(jsonLd["@type"], "Menu");
  assert.equal(jsonLd.url, "https://centrestjhotpot.ca/table-menu/");
  assert.match(JSON.stringify(jsonLd), /"priceCurrency":"CAD"/u);
});
