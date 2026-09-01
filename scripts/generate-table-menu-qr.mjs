import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import sharp from "sharp";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 1800;
const TABLE_MENU_URL = "https://centrestjhotpot.ca/menu/?utm_source=table_qr&utm_medium=offline&utm_campaign=dine_in_menu";

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function cardBackgroundSvg() {
  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1800" fill="#fff8ea"/>
      <rect x="54" y="54" width="1092" height="1692" rx="42" fill="#170f0b"/>
      <rect x="86" y="86" width="1028" height="1628" rx="30" fill="none" stroke="#f6c94c" stroke-width="8"/>
      <circle cx="1010" cy="218" r="75" fill="#f6c94c"/>
      <text x="1010" y="247" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial, sans-serif" font-size="72" font-weight="900" fill="#170f0b">鼎</text>
      <text x="150" y="210" font-family="Arial, sans-serif" font-size="31" font-weight="900" letter-spacing="3" fill="#f6c94c">CENTRE STREET JAPANESE HOTPOT</text>
      <text x="600" y="355" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial, sans-serif" font-size="84" font-weight="900" fill="#fff8ea">扫码看菜单</text>
      <text x="600" y="435" text-anchor="middle" font-family="Arial, sans-serif" font-size="45" font-weight="800" fill="#fff1cc">SCAN TO VIEW MENU</text>
      <rect x="214" y="515" width="772" height="772" rx="36" fill="#fff8ea"/>
      <text x="600" y="1405" text-anchor="middle" font-family="Arial, sans-serif" font-size="45" font-weight="900" fill="#f6c94c">VIEW MENU ONLY</text>
      <text x="600" y="1472" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#fff8ea">Please order with your server</text>
      <text x="600" y="1540" text-anchor="middle" font-family="PingFang SC, Hiragino Sans GB, Arial, sans-serif" font-size="40" font-weight="800" fill="#fff8ea">请向服务员点单</text>
      <line x1="170" y1="1602" x2="1030" y2="1602" stroke="#f6c94c" stroke-width="3" opacity="0.65"/>
      <text x="600" y="1668" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#fff1cc">centrestjhotpot.ca/menu</text>
    </svg>`;
}

function printHtml(qrDataUrl) {
  const safeUrl = escapeHtml(TABLE_MENU_URL);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Centre Street Japanese HotPot Table Menu QR</title>
<style>
  @page { size: 4in 6in; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 4in; height: 6in; }
  body { background: #fff8ea; color: #fff8ea; font-family: Arial, "PingFang SC", sans-serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .card { align-items: center; background: #170f0b; border: 0.12in solid #fff8ea; display: flex; flex-direction: column; height: 6in; padding: .16in .22in; text-align: center; width: 4in; }
  .frame { border: 2px solid #f6c94c; border-radius: .12in; display: flex; flex: 1; flex-direction: column; align-items: center; padding: .18in; width: 100%; }
  .brand { color: #f6c94c; font-size: 9pt; font-weight: 900; letter-spacing: .5pt; margin: 0 0 .12in; }
  h1 { font-size: 27pt; line-height: 1; margin: 0; } h2 { color: #fff1cc; font-size: 14pt; margin: .08in 0 .14in; }
  .qr { background: #fff8ea; border-radius: .08in; display: block; height: 2.55in; padding: .05in; width: 2.55in; }
  .view-only { color: #f6c94c; font-size: 13pt; font-weight: 900; margin: .14in 0 .04in; }
  .instruction { font-size: 10.5pt; font-weight: 700; line-height: 1.35; margin: 0; }
  .url { border-top: 1px solid rgba(246,201,76,.65); color: #fff1cc; font-size: 8.5pt; margin: .12in 0 0; padding-top: .09in; width: 100%; }
</style></head><body>
<main class="card"><section class="frame">
  <p class="brand">CENTRE STREET JAPANESE HOTPOT</p>
  <h1>扫码看菜单</h1><h2>SCAN TO VIEW MENU</h2>
  <a href="${safeUrl}"><img class="qr" src="${qrDataUrl}" alt="QR code for the dine-in menu"></a>
  <p class="view-only">View Menu Only</p>
  <p class="instruction">Please order with your server<br>请向服务员点单</p>
  <p class="url">centrestjhotpot.ca/menu</p>
</section></main></body></html>`;
}

export async function generateTableMenuCard(outputDir = path.join(process.cwd(), "marketing/qr-cards")) {
  await mkdir(outputDir, { recursive: true });
  const qrPng = await QRCode.toBuffer(TABLE_MENU_URL, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 680,
    color: { dark: "#170f0b", light: "#fff8ea" },
  });
  const pngPath = path.join(outputDir, "table-menu-qr-card-4x6.png");
  const htmlPath = path.join(outputDir, "table-menu-qr-card-4x6.html");
  const pdfPath = path.join(outputDir, "table-menu-qr-card-4x6.pdf");
  await sharp(Buffer.from(cardBackgroundSvg()))
    .composite([{ input: qrPng, left: 260, top: 561 }])
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
  return { url: TABLE_MENU_URL, width: CARD_WIDTH, height: CARD_HEIGHT, pngPath, htmlPath, pdfPath };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  const result = await generateTableMenuCard(outputDir);
  console.log(JSON.stringify(result, null, 2));
}
