import assert from "node:assert/strict";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import sharp from "sharp";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 1800;
export const TABLE_MENU_URL = "https://centrestjhotpot.ca/table-menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu";

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function validateUrl() {
  const url = new URL(TABLE_MENU_URL);
  assert.equal(url.pathname, "/table-menu/");
  assert.equal(url.searchParams.get("utm_source"), "table_qr");
  assert.equal(url.searchParams.get("utm_medium"), "offline");
  assert.equal(url.searchParams.get("utm_campaign"), "dine_in_menu");
}

function cardBackgroundSvg() {
  return `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1800" fill="#fff8ed"/>
    <rect x="54" y="54" width="1092" height="1692" rx="42" fill="#1b0907"/>
    <rect x="82" y="82" width="1036" height="1636" rx="30" fill="none" stroke="#d2a252" stroke-width="7"/>
    <text x="600" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="5" fill="#edcf95">CENTRE ST J HOTPOT</text>
    <text x="600" y="312" text-anchor="middle" font-family="Georgia, serif" font-size="76" font-weight="900" fill="#fff8ed">SCAN TO VIEW MENU</text>
    <text x="600" y="395" text-anchor="middle" font-family="PingFang TC, Hiragino Sans CNS, Arial, sans-serif" font-size="52" font-weight="800" fill="#d2a252">掃碼查看菜單</text>
    <rect x="206" y="472" width="788" height="788" rx="34" fill="#ffffff"/>
    <text x="600" y="1390" text-anchor="middle" font-family="Arial, sans-serif" font-size="41" font-weight="900" fill="#edcf95">VIEW ONLY — ORDER WITH YOUR SERVER</text>
    <text x="600" y="1462" text-anchor="middle" font-family="PingFang TC, Hiragino Sans CNS, Arial, sans-serif" font-size="39" font-weight="800" fill="#fff8ed">僅供瀏覽，請向服務員點單</text>
    <line x1="158" y1="1550" x2="1042" y2="1550" stroke="#d2a252" stroke-width="3" opacity=".72"/>
    <text x="600" y="1622" text-anchor="middle" font-family="Arial, sans-serif" font-size="29" font-weight="700" fill="#fff1d6">centrestjhotpot.ca/table-menu</text>
    <text x="600" y="1674" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#c9bcae">The same menu is used at every table</text>
  </svg>`;
}

function printHtml(qrDataUrl) {
  const safeUrl = escapeHtml(TABLE_MENU_URL);
  return `<!doctype html>
<!-- QR payload: ${TABLE_MENU_URL} -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Centre Street Japanese HotPot Table Menu QR</title>
<style>
  @page { size: 4in 6in; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 4in; height: 6in; }
  body { background: #fff8ed; color: #fff8ed; font-family: Arial, "PingFang TC", sans-serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .card { background: #1b0907; border: .12in solid #fff8ed; display: flex; height: 6in; padding: .16in; text-align: center; width: 4in; }
  .frame { align-items: center; border: 2px solid #d2a252; border-radius: .12in; display: flex; flex: 1; flex-direction: column; padding: .18in; }
  .brand { color: #edcf95; font-size: 8pt; font-weight: 900; letter-spacing: 1.2pt; margin: 0 0 .14in; }
  h1 { font-family: Georgia, serif; font-size: 21pt; line-height: 1; margin: 0; }
  h2 { color: #d2a252; font-size: 14pt; margin: .08in 0 .13in; }
  .qr { background: #fff; border-radius: .08in; display: block; height: 2.55in; padding: .08in; width: 2.55in; }
  .view-only { color: #edcf95; font-size: 10pt; font-weight: 900; line-height: 1.25; margin: .14in 0 .04in; }
  .instruction { font-size: 10.5pt; font-weight: 800; line-height: 1.35; margin: 0; }
  .url { border-top: 1px solid rgb(210 162 82 / 70%); color: #fff1d6; font-size: 8pt; margin: .12in 0 0; padding-top: .08in; width: 100%; }
</style></head><body>
<main class="card"><section class="frame">
  <p class="brand">CENTRE ST J HOTPOT</p>
  <h1>SCAN TO VIEW MENU</h1><h2>掃碼查看菜單</h2>
  <a href="${safeUrl}"><img class="qr" src="${qrDataUrl}" alt="QR code for the view-only dine-in menu"></a>
  <p class="view-only">View only — order with your server</p>
  <p class="instruction">僅供瀏覽，請向服務員點單</p>
  <p class="url">centrestjhotpot.ca/table-menu</p>
</section></main></body></html>`;
}

export async function generateTableMenuCard(outputDir = path.join(process.cwd(), "marketing/qr-cards")) {
  validateUrl();
  await mkdir(outputDir, { recursive: true });
  const qrPng = await QRCode.toBuffer(TABLE_MENU_URL, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 680,
    color: { dark: "#1b0907", light: "#ffffff" },
  });
  const pngPath = path.join(outputDir, "table-menu-qr-card-4x6.png");
  const htmlPath = path.join(outputDir, "table-menu-qr-card-4x6.html");
  const pdfPath = path.join(outputDir, "table-menu-qr-card-4x6.pdf");
  await sharp(Buffer.from(cardBackgroundSvg()))
    .composite([{ input: qrPng, left: 260, top: 526 }])
    .png({ compressionLevel: 9 })
    .withMetadata({ density: 300 })
    .toFile(pngPath);
  const qrDataUrl = `data:image/png;base64,${qrPng.toString("base64")}`;
  await writeFile(htmlPath, printHtml(qrDataUrl));
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([288, 432]);
  const card = await pdf.embedPng(await readFile(pngPath));
  page.drawImage(card, { x: 0, y: 0, width: 288, height: 432 });
  await writeFile(pdfPath, await pdf.save());

  const html = await readFile(htmlPath, "utf8");
  assert.ok(html.includes(TABLE_MENU_URL));
  assert.ok(html.includes("View only — order with your server"));
  assert.ok(html.includes("僅供瀏覽，請向服務員點單"));
  for (const output of [htmlPath, pngPath, pdfPath]) assert.ok((await stat(output)).size > 0);

  return { url: TABLE_MENU_URL, width: CARD_WIDTH, height: CARD_HEIGHT, pngPath, htmlPath, pdfPath };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  console.log(JSON.stringify(await generateTableMenuCard(outputDir), null, 2));
}
