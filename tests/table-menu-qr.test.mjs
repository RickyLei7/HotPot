import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { after, test } from "node:test";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const testOutputDir = path.join(root, "tests/.tmp-table-menu-qr");

after(() => rmSync(testOutputDir, { force: true, recursive: true }));

test("the deployed menu tells dine-in guests to order with their server", () => {
  const menu = readFileSync(path.join(root, "public/table-menu/index.html"), "utf8");
  assert.match(menu, /View-only menu — please order with your server\./i);
  assert.match(menu, /此菜單僅供瀏覽，請向服務員點單。/);
  assert.doesNotMatch(menu, /data-order-submit|data-cart|data-checkout/);
});

test("the print generator creates scannable table-menu artifacts", async () => {
  const generatorPath = path.join(root, "marketing/scripts/generate-table-menu-qr-card.mjs");
  assert.ok(existsSync(generatorPath), "table-menu print generator is missing");
  const { generateTableMenuCard } = await import("../marketing/scripts/generate-table-menu-qr-card.mjs");
  const result = await generateTableMenuCard(testOutputDir);

  assert.equal(
    result.url,
    "https://centrestjhotpot.ca/table-menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu",
  );
  assert.equal(result.width, 1200);
  assert.equal(result.height, 1800);
  assert.ok(existsSync(result.pngPath));
  assert.ok(existsSync(result.htmlPath));
  assert.ok(existsSync(result.pdfPath));

  const pdfHeader = readFileSync(result.pdfPath).subarray(0, 5).toString("ascii");
  assert.equal(pdfHeader, "%PDF-");

  const jsQrPath = path.join(root, "node_modules/jsqr/package.json");
  assert.ok(existsSync(jsQrPath), "QR decoder test dependency is missing");
  const { default: jsQR } = await import("jsqr");
  const { data, info } = await sharp(result.pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  assert.equal(decoded?.data, result.url);

  const printHtml = readFileSync(result.htmlPath, "utf8");
  assert.match(printHtml, /View only — order with your server/);
  assert.match(printHtml, /僅供瀏覽，請向服務員點單/);
});
