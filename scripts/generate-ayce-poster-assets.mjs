import { copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/generate-ayce-poster-assets.mjs <source-image>");

const root = path.resolve(import.meta.dirname, "..");
const assets = path.join(root, "public", "assets");
const menu = path.join(root, "public", "menu");
const base = "ayce-menu-2026-08-24-599";
const fastBase = "ayce-menu-2026-08-25-fast";
const signatureChickenSource = path.join(assets, "dish-popcorn-chicken.webp");
const signatureChickenBase = "ayce-signature-fried-chicken-2026-08-18";

await copyFile(source, path.join(menu, "centre-street-ayce-menu-2026-08.jpg"));

for (const width of [360, 480, 720, 1200]) {
  const suffix = width === 1200 ? "" : `-${width}`;
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: width === 1200 ? 92 : 86 })
    .toFile(path.join(assets, `${base}${suffix}.webp`));
}

for (const width of [360, 480, 720]) {
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toFile(path.join(assets, `${fastBase}-${width}.webp`));
}

for (const width of [160, 224, 320, 640]) {
  await sharp(signatureChickenSource)
    .resize({ width, height: Math.round(width * 9 / 16), fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toFile(path.join(assets, `${signatureChickenBase}-${width}.webp`));
}

console.log(`Generated ${base} poster and signature fried chicken assets.`);
