import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function checkTableMenu() {
  const redirect = await readFile(path.join(root, "public/table-menu/index.html"), "utf8");
  assert.match(redirect, /content="0; url=\/menu\/"/);
  assert.match(redirect, /window\.location\.replace\("\/menu\/" \+ window\.location\.search\)/);
  assert.doesNotMatch(redirect, /data-table-menu-root|table-menu\.(?:js|css)/);
  const sitemap = await readFile(path.join(root, "public/sitemap.xml"), "utf8");
  assert.doesNotMatch(sitemap, /\/table-menu\//);
  for (const route of ["menu", "zh-hant/menu"]) {
    const menu = await readFile(path.join(root, "public", route, "index.html"), "utf8");
    assert.doesNotMatch(menu, /href="\/table-menu\/"/);
    assert.match(menu, /id="full-menu"/);
    assert.match(menu, /href="https:\/\/reservation\.centrestjhotpot\.ca\/book"/);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkTableMenu();
  console.log("Retired Table Menu redirects to the original menu; bilingual menu and booking links remain available.");
}
