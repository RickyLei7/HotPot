import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const riceMenu = path.join(root, "public/menu/drink-menu.jpg");
const hotpotMenu = path.join(root, "public/menu/hotpot-menu.jpg");
const lightMealDir = path.join(root, "public/assets/light-meals");
const snackDir = path.join(root, "public/assets/ayce-snacks");

const lightMeals = [
  ["braised-pork-rice", 522, 306, 168, 116],
  ["fried-chicken-rice-noodle", 744, 306, 168, 116],
  ["wonton-rice-noodle", 982, 306, 168, 116],
  ["unagi-rice", 522, 612, 168, 116],
  ["beef-brisket-rice", 744, 612, 168, 116],
  ["sukiyaki-beef-rice", 982, 612, 168, 116],
];

const snacks = [
  ["crispy-chicken-cutlet", 548, 1420, 176, 105],
  ["golden-fried-buns", 754, 1420, 176, 105],
  ["crispy-squid-legs", 968, 1420, 176, 105],
];

async function writeCrop(source, output, crop, width, height) {
  const [, left, top, cropWidth, cropHeight] = crop;
  await sharp(source)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(width, height, { fit: "cover", position: "centre" })
    .webp({ quality: 86 })
    .toFile(output);
}

await Promise.all([mkdir(lightMealDir, { recursive: true }), mkdir(snackDir, { recursive: true })]);

for (const crop of lightMeals) {
  const [slug] = crop;
  await Promise.all([
    writeCrop(riceMenu, path.join(lightMealDir, `${slug}-320.webp`), crop, 320, 220),
    writeCrop(riceMenu, path.join(lightMealDir, `${slug}-640.webp`), crop, 640, 440),
  ]);
}

for (const crop of snacks) {
  const [slug] = crop;
  await writeCrop(hotpotMenu, path.join(snackDir, `${slug}-320.webp`), crop, 320, 220);
}

console.log(`Generated ${lightMeals.length * 2 + snacks.length} homepage menu crops.`);
