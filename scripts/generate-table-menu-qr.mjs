import path from "node:path";
import { pathToFileURL } from "node:url";
import { generateTableMenuCard } from "../marketing/scripts/generate-table-menu-qr-card.mjs";

export { generateTableMenuCard } from "../marketing/scripts/generate-table-menu-qr-card.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outputDir = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  console.log(JSON.stringify(await generateTableMenuCard(outputDir), null, 2));
}
