import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function checkTableMenu() {
  const redirect = await readFile(path.join(root, "public/table-menu/index.html"), "utf8");
  assert.match(redirect, /content="0; url=\/menu\/"/);
  assert.match(redirect, /window\.location\.replace\("\/menu\/" \+ window\.location\.search\)/);
  assert.doesNotMatch(redirect, /data-table-menu-root|table-menu\.(?:js|css)/);
  const publicDir = path.join(root, "public");
  const files = await readdir(publicDir, { recursive: true });
  for (const file of files.filter(file => file.endsWith(".html"))) {
    const html = await readFile(path.join(publicDir, file), "utf8");
    const pageUrl = new URL(file.split(path.sep).join("/"), "https://centrestjhotpot.ca/");
    for (const [, , href] of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) {
      const target = new URL(href.replace(/&amp;/g, "&"), pageUrl);
      if (!["centrestjhotpot.ca", "www.centrestjhotpot.ca"].includes(target.hostname)) continue;
      assert.doesNotMatch(target.pathname, /^\/table-menu(?:\/|$)/i, `${file}: retired Table Menu link ${href}`);
    }
  }
  for (const asset of ["table-menu.js", "table-menu.css"]) {
    assert.ok(!files.includes(path.join("table-menu", asset)), `Retired Table Menu asset restored: ${asset}`);
  }
  const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /\/table-menu\//);
  for (const route of ["menu", "zh-hant/menu"]) {
    const menu = await readFile(path.join(root, "public", route, "index.html"), "utf8");
    assert.doesNotMatch(menu, /href="\/table-menu\/"/);
    assert.match(menu, /id="full-menu"/);
    assert.match(menu, /href="\/menu\/centre-street-japanese-hotpot-menu-[^" ]+\.pdf"/);
    assert.match(menu, /href="https:\/\/reservation\.centrestjhotpot\.ca\/book"/);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkTableMenu();
  console.log("Retired Table Menu redirects to the original menu; bilingual menu and booking links remain available.");
}
