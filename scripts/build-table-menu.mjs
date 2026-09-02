import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateMenu } from "./lib/table-menu-data.mjs";
import { renderTableMenuJsonLd, renderTableMenuMarkup } from "./lib/table-menu-renderer.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "public/table-menu/index.html");
const canonicalUrl = "https://centrestjhotpot.ca/table-menu/";

export async function buildTableMenu({ rootDir = root, destination = outputPath } = {}) {
  const menu = JSON.parse(await readFile(path.join(rootDir, "content/table-menu/menu.json"), "utf8"));
  validateMenu(menu);
  const markup = renderTableMenuMarkup(menu);
  const jsonLd = JSON.stringify(renderTableMenuJsonLd(menu, canonicalUrl)).replaceAll("<", "\\u003c");
  const document = `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Table Menu | Centre Street Japanese HotPot</title>
  <meta name="description" content="View the bilingual dine-in menu for Centre Street Japanese HotPot. This menu is for browsing; please order with your server.">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="Table Menu | Centre Street Japanese HotPot">
  <meta property="og:description" content="View-only dine-in menu with photos in English and Traditional Chinese.">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="https://centrestjhotpot.ca/assets/table-menu/ayce-individual-640.webp">
  <link rel="stylesheet" href="/table-menu/table-menu.css">
  <script src="/analytics.js" defer></script>
  <script src="/table-menu/table-menu.js" defer></script>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
${markup}
</body>
</html>
`;

  await mkdir(path.dirname(destination), { recursive: true });
  let existing = "";
  try { existing = await readFile(destination, "utf8"); } catch {}
  if (existing !== document) await writeFile(destination, document);
  return document;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildTableMenu();
}
