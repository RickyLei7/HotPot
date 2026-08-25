import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const activeRoots = ["app", "public", "scripts", "marketing/scripts"];
const textExtensions = new Set([".html", ".js", ".json", ".mjs", ".ts", ".tsx", ".txt", ".xml"]);
const excludedFiles = new Set([
  "marketing/reports/google-ads-goals-tracking-latest.json",
]);
const stalePricePattern = /(?:\+\s*)?\$?3[.,]99/giu;
const expectedPdfSha256 = "cdf203cfa2e41a91564afd1b99853e19fb74bfb85a05c3c05a05412ed3d8197c";

async function collectFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(child));
    } else if (textExtensions.has(path.extname(entry.name)) && !excludedFiles.has(child)) {
      files.push(child);
    }
  }
  return files;
}

const files = (await Promise.all(activeRoots.map(collectFiles))).flat();
const staleMatches = [];
for (const file of files) {
  const content = await readFile(path.join(root, file), "utf8");
  const lines = content.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    stalePricePattern.lastIndex = 0;
    if (stalePricePattern.test(lines[index])) {
      staleMatches.push(`${file}:${index + 1}: ${lines[index].trim().slice(0, 220)}`);
    }
  }
}

assert.deepEqual(
  staleMatches,
  [],
  `Active website or reusable source still contains the retired snack-upgrade price:\n${staleMatches.join("\n")}`,
);

const pdfPath = path.join(root, "public/menu/centre-street-ayce-menu-2026-08.pdf");
const pdfSha256 = createHash("sha256").update(await readFile(pdfPath)).digest("hex");
assert.equal(pdfSha256, expectedPdfSha256, "Public AYCE PDF is not the approved $5.99 print master");

console.log(`Price consistency passed across ${files.length} active text files and the approved AYCE PDF.`);
