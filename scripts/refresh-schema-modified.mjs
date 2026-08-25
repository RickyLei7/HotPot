import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const publicDir = path.join(process.cwd(), "public");
const modifiedDate = process.argv[2] || new Date().toISOString().slice(0, 10);
const pageTypes = new Set(["AboutPage", "Article", "FAQPage", "Menu", "WebPage"]);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  }))).flat();
}

function updateNode(node) {
  if (!node || typeof node !== "object") return false;
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  if (!types.some((type) => pageTypes.has(type))) return false;
  node.dateModified = modifiedDate;
  return true;
}

let updatedFiles = 0;
for (const file of await htmlFiles(publicDir)) {
  const html = await readFile(file, "utf8");
  let changed = false;
  const nextHtml = html.replace(
    /(<script\s+type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (match, open, source, close) => {
      try {
        const schema = JSON.parse(source);
        const nodes = Array.isArray(schema["@graph"]) ? schema["@graph"] : [schema];
        if (!nodes.some(updateNode)) return match;
        changed = true;
        return `${open}${JSON.stringify(schema)}${close}`;
      } catch (_error) {
        return match;
      }
    },
  );
  if (!changed) continue;
  await writeFile(file, nextHtml);
  updatedFiles += 1;
}

console.log(`Updated dateModified to ${modifiedDate} in ${updatedFiles} HTML files.`);
