import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/generate-ayce-poster-assets.mjs <source-image>");

const root = path.resolve(import.meta.dirname, "..");
const assets = path.join(root, "public", "assets");
const menu = path.join(root, "public", "menu");
const base = "ayce-menu-2026-08-24-599";
const signatureChickenSource = path.join(assets, "dish-popcorn-chicken.webp");
const signatureChickenBase = "ayce-signature-fried-chicken-2026-08-18";
const sourceWidth = 1080;
const sourceHeight = 1350;
const posterCrop = { left: 90, top: 0, width: 900, height: sourceHeight };

await sharp(source)
  .extract(posterCrop)
  .jpeg({ quality: 94 })
  .toFile(path.join(menu, "centre-street-ayce-menu-2026-08.jpg"));

for (const width of [360, 480, 720, 1080]) {
  const suffix = width === 1080 ? "" : `-${width}`;
  const height = Math.round(width * sourceHeight / sourceWidth);
  const contentWidth = Math.round(width * posterCrop.width / sourceWidth);
  const left = Math.round(width * posterCrop.left / sourceWidth);
  const poster = await sharp(source)
    .extract(posterCrop)
    .resize({ width: contentWidth, height })
    .png()
    .toBuffer();

  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: poster, left, top: 0 }])
    .webp({ quality: width === 1080 ? 92 : 86 })
    .toFile(path.join(assets, `${base}${suffix}.webp`));
}

for (const width of [160, 224, 320, 640]) {
  await sharp(signatureChickenSource)
    .resize({ width, height: Math.round(width * 9 / 16), fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toFile(path.join(assets, `${signatureChickenBase}-${width}.webp`));
}

console.log(`Generated ${base} poster and signature fried chicken assets.`);
