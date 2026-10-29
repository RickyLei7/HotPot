import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const code = await readFile(new URL("../public/site-events.js", import.meta.url), "utf8");
function clickLink(href, text) {
  const listeners = new Map();
  const storage = { getItem: () => null, setItem() {}, removeItem() {} };
  const window = {
    location: new URL("https://centrestjhotpot.ca/"), localStorage: storage, sessionStorage: storage,
    addEventListener() {}, removeEventListener() {},
  };
  const document = {
    referrer: "", readyState: "loading", documentElement: { lang: "en-CA" },
    querySelectorAll: () => [], querySelector: () => null,
    addEventListener: (name, handler) => listeners.set(name, handler),
    body: { classList: { toggle() {} } },
  };
  const link = {
    href, textContent: text, getAttribute: name => name === "href" ? href : null,
    closest: () => null, hasAttribute: () => false, classList: { contains: () => false },
  };
  vm.runInNewContext(code, { window, document, URL, URLSearchParams, Date });
  listeners.get("click")({ target: { closest: selector => selector === "a" ? link : null } });
  return window.dataLayer.filter(entry => entry[0] === "event");
}

test("Google review short links count once in both languages, including Google's QR parameters", () => {
  for (const [href, text] of [
    ["https://g.page/r/CbP5h_QDhEEaEBM/review", "Review Us on Google"],
    ["https://g.page/r/CbP5h_QDhEEaEBM/review?utm_source=gbp&utm_medium=reviews&utm_campaign=qr", "前往 Google 留下評論"],
    ["https://www.google.com/maps/place/example/", "Google reviews"],
  ]) {
    const events = clickLink(href, text);
    const reviews = events.filter(entry => entry[1] === "google_review_click");
    assert.equal(reviews.length, 1);
    assert.equal(reviews[0][2].cta_name, "google_review");
    assert.equal(events.some(entry => entry[1] === "directions_click"), false);
    assert.equal(events.some(entry => entry[1] === "online_booking_completed"), false);
  }
});

test("directions, business profile links and lookalike hosts are not review clicks", () => {
  for (const href of [
    "https://www.google.com/maps/dir/?api=1&destination=Calgary",
    "https://g.page/r/CbP5h_QDhEEaEBM",
    "https://g.page.example.com/r/CbP5h_QDhEEaEBM/review",
  ]) {
    const events = clickLink(href, "Visit");
    assert.equal(events.some(entry => entry[1] === "google_review_click"), false);
    if (href.includes("/maps/dir/")) assert.equal(events.filter(entry => entry[1] === "directions_click").length, 1);
  }
});
