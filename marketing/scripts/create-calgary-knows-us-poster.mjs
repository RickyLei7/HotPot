import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "marketing/source-assets/instagram/f1659349c3920acf.jpg");
const outputDir = path.join(root, "marketing/social-assets/calgary-knows-us");
const output = path.join(outputDir, "calgary-knows-us-zh-1080x1350.png");
const englishOutput = path.join(outputDir, "calgary-knows-us-en-1080x1350.png");

await fs.mkdir(outputDir, { recursive: true });

const overlay = Buffer.from(`
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#120504" stop-opacity="0.92"/>
        <stop offset="0.36" stop-color="#120504" stop-opacity="0.28"/>
        <stop offset="0.74" stop-color="#120504" stop-opacity="0.10"/>
        <stop offset="1" stop-color="#120504" stop-opacity="0.90"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#shade)"/>
    <rect x="38" y="38" width="1004" height="1274" fill="none" stroke="#e9bc45" stroke-opacity="0.9" stroke-width="4"/>
    <text x="540" y="102" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="4" fill="#f0cc69">CENTRE STREET JAPANESE HOTPOT</text>
    <rect x="74" y="1085" width="932" height="152" rx="0" fill="#240705" fill-opacity="0.80" stroke="#e9bc45" stroke-width="3"/>
    <text x="540" y="1182" text-anchor="middle" font-family="Hiragino Sans GB, PingFang SC, sans-serif" font-size="72" font-weight="700" fill="#fff8e8">用心做好每一锅</text>
  </svg>
`);

const englishOverlay = Buffer.from(`
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#120504" stop-opacity="0.92"/>
        <stop offset="0.36" stop-color="#120504" stop-opacity="0.28"/>
        <stop offset="0.74" stop-color="#120504" stop-opacity="0.10"/>
        <stop offset="1" stop-color="#120504" stop-opacity="0.90"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#shade)"/>
    <rect x="38" y="38" width="1004" height="1274" fill="none" stroke="#e9bc45" stroke-opacity="0.9" stroke-width="4"/>
    <text x="540" y="102" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="4" fill="#f0cc69">CENTRE STREET JAPANESE HOTPOT</text>
    <rect x="74" y="1085" width="932" height="152" rx="0" fill="#240705" fill-opacity="0.80" stroke="#e9bc45" stroke-width="3"/>
    <text x="540" y="1160" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800" fill="#fff8e8">MADE WITH CARE.</text>
    <text x="540" y="1212" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="2" fill="#e9bc45">ONE POT AT A TIME.</text>
  </svg>
`);

const photo = await sharp(source)
  .rotate()
  .resize(1080, 1350, { fit: "cover", position: "center" })
  .modulate({ brightness: 1.14, saturation: 1.18 })
  .gamma(1.04)
  .sharpen({ sigma: 0.9, m1: 0.8, m2: 1.3 })
  .png()
  .toBuffer();

await sharp(photo).composite([{ input: overlay }]).png().toFile(output);
await sharp(photo).composite([{ input: englishOverlay }]).png().toFile(englishOutput);
console.log(JSON.stringify({ output, englishOutput }, null, 2));
