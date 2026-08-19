import { copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/generate-ayce-poster-assets.mjs <source-image>");

const root = path.resolve(import.meta.dirname, "..");
const assets = path.join(root, "public", "assets");
const menu = path.join(root, "public", "menu");
const base = "ayce-menu-2026-08-18";

await copyFile(source, path.join(menu, "centre-street-ayce-menu-2026-08.jpg"));

for (const width of [360, 480, 720, 1080]) {
  const suffix = width === 1080 ? "" : `-${width}`;
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: width === 1080 ? 92 : 86 })
    .toFile(path.join(assets, `${base}${suffix}.webp`));
}

console.log(`Generated ${base} responsive poster assets.`);
