import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import sharp from "sharp";
import jsQR from "jsqr";

// Verified against the restaurant's Google Business Profile share-review dialog.
const reviewUrl = "https://g.page/r/CbP5h_QDhEEaEBM/review";
const outputDir = "marketing/qr-cards";
await mkdir(outputDir, { recursive: true });
const qr = await QRCode.toBuffer(reviewUrl, {
  width: 760, margin: 4, errorCorrectionLevel: "M",
  color: { dark: "#211410", light: "#ffffff" },
});
const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800" viewBox="0 0 1200 1800">
<rect width="1200" height="1800" fill="#fff9ed"/>
<rect x="46" y="46" width="1108" height="1708" rx="28" fill="none" stroke="#a47c31" stroke-width="3"/>
<g text-anchor="middle" fill="#211410" font-family="Arial, PingFang TC, sans-serif">
<text x="600" y="150" font-size="31" font-weight="700" letter-spacing="2">CENTRE STREET</text>
<text x="600" y="198" font-size="31" font-weight="700" letter-spacing="2">JAPANESE HOT POT</text>
<text x="600" y="350" font-family="Georgia, serif" font-size="88" font-weight="700">Share your visit</text>
<text x="600" y="434" font-size="45">歡迎分享用餐體驗</text>
<rect x="195" y="505" width="810" height="810" rx="18" fill="#fff"/>
<text x="600" y="1422" font-size="43" font-weight="700">Leave an honest Google review</text>
<text x="600" y="1504" font-size="38">掃碼留下真實 Google 評論</text>
<text x="600" y="1580" font-size="29" fill="#655447">Your feedback is welcome. Thank you.</text>
<text x="600" y="1678" font-size="28" fill="#655447">2213 Centre St N #2243 · Calgary</text>
</g></svg>`;
const pngPath = `${outputDir}/google-review-card-4x6.png`;
const pdfPath = `${outputDir}/google-review-card-4x6.pdf`;
const htmlPath = `${outputDir}/google-review-card-4x6.html`;
await sharp(Buffer.from(background)).composite([{input: qr, left: 220, top: 530}])
  .png({compressionLevel: 9}).withMetadata({density: 300}).toFile(pngPath);
const png = await readFile(pngPath);
const pdf = await PDFDocument.create();
pdf.setTitle("Centre Street Japanese Hot Pot - Google Review Card");
const page = pdf.addPage([288, 432]);
page.drawImage(await pdf.embedPng(png), {x: 0, y: 0, width: 288, height: 432});
await writeFile(pdfPath, await pdf.save());
await writeFile(htmlPath, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Google review card</title><style>@page{size:4in 6in;margin:0}html,body{margin:0}img{display:block;width:4in;height:6in}@media screen{body{background:#ddd;padding:20px}img{max-width:100%;height:auto}}</style></head><body><a href="${reviewUrl}"><img src="data:image/png;base64,${png.toString("base64")}" width="1200" height="1800" alt="Centre Street Japanese Hot Pot. Share your visit. Scan to leave an honest Google review. 歡迎分享用餐體驗。掃碼留下真實 Google 評論。"></a></body></html>`);
const decoded = await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject: true});
assert.equal(jsQR(new Uint8ClampedArray(decoded.data), decoded.info.width, decoded.info.height)?.data, reviewUrl);
const checkedPdf = await PDFDocument.load(await readFile(pdfPath));
assert.equal(checkedPdf.getPageCount(), 1);
assert.deepEqual(checkedPdf.getPage(0).getSize(), {width: 288, height: 432});
console.log(JSON.stringify({reviewUrl, pngPath, pdfPath, htmlPath, qrDecoded: true, printInches: "4 x 6"}, null, 2));
