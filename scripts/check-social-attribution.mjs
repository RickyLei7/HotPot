import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const linkKitPath = path.join(root, "marketing", "website-traffic-link-kit.md");
const captionsDir = path.join(root, "marketing", "captions");

async function collectCaptionFiles() {
  const entries = await readdir(captionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
    .map((entry) => path.join(captionsDir, entry.name));
}

function extractUrls(text) {
  return [...text.matchAll(/https:\/\/[^\s`)]+/g)].map((match) => match[0]);
}

const linkKit = await readFile(linkKitPath, "utf8");
const captionFiles = await collectCaptionFiles();
const activeFiles = [linkKitPath, ...captionFiles];

for (const file of activeFiles) {
  const text = file === linkKitPath ? linkKit : await readFile(file, "utf8");
  for (const urlText of extractUrls(text)) {
    const url = new URL(urlText);
    assert.notEqual(
      url.searchParams.get("utm_source"),
      "meta",
      `${path.relative(root, file)} must identify Instagram, Facebook, or Threads instead of meta`,
    );
  }
}

const paidLinks = extractUrls(linkKit)
  .map((urlText) => new URL(urlText))
  .filter((url) => url.searchParams.get("utm_medium") === "paid_social");

for (const source of ["instagram", "facebook", "threads"]) {
  assert.ok(
    paidLinks.some((url) => url.searchParams.get("utm_source") === source),
    `Paid social link kit is missing a ${source} URL`,
  );
}

console.log(`Social attribution checks passed for ${activeFiles.length} active marketing files.`);
