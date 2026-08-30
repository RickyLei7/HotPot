import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [sourcePdf, sourceImage, ...targetRoots] = process.argv.slice(2);

if (!sourcePdf || !sourceImage || targetRoots.length === 0) {
  throw new Error(
    "Usage: node scripts/replace-ayce-menu-artwork.mjs <source-pdf> <source-image> <target-root> [target-root...]",
  );
}

const posterBase = "ayce-menu-2026-08-24-599";
const fastPosterBase = "ayce-menu-2026-08-25-fast";

for (const targetRoot of targetRoots) {
  const publicDir = path.join(targetRoot, "public");
  const menuDir = path.join(publicDir, "menu");
  const assetsDir = path.join(publicDir, "assets");
  const socialDir = path.join(assetsDir, "social", "2026-08-24-ayce-menu-repost");

  await Promise.all([
    mkdir(menuDir, { recursive: true }),
    mkdir(assetsDir, { recursive: true }),
    mkdir(socialDir, { recursive: true }),
  ]);

  await copyFile(sourcePdf, path.join(menuDir, "centre-street-ayce-menu-2026-08.pdf"));

  await sharp(sourceImage)
    .jpeg({ quality: 96, chromaSubsampling: "4:4:4" })
    .toFile(path.join(menuDir, "centre-street-ayce-menu-2026-08.jpg"));

  for (const width of [360, 480, 720, 1200]) {
    const suffix = width === 1200 ? "" : `-${width}`;
    await sharp(sourceImage)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width === 1200 ? 92 : 86 })
      .toFile(path.join(assetsDir, `${posterBase}${suffix}.webp`));
  }

  for (const width of [360, 480, 720]) {
    await sharp(sourceImage)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(path.join(assetsDir, `${fastPosterBase}-${width}.webp`));
  }

  await sharp(sourceImage)
    .resize({ width: 1080, height: 1350, fit: "contain", background: "#3a0b09" })
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toFile(path.join(socialDir, "01-ayce-menu-latest-1080x1350.jpg"));
}

console.log(JSON.stringify({ sourcePdf, sourceImage, targetRoots }, null, 2));
