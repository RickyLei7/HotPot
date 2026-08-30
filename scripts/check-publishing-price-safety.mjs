import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  assertImageBytesAreCurrent,
  assertTextHasCurrentSnackPrice,
} from "./lib/publishing-price-safety.mjs";

const root = process.cwd();
const reusableRoots = [
  "marketing/captions",
  "marketing/social-assets",
  "public/assets/social",
  "public/menu",
];
const textExtensions = new Set([".html", ".md", ".txt"]);
const imageExtensions = new Set([".jpeg", ".jpg", ".png", ".webp"]);

async function collectFiles(relativePath) {
  const entries = await readdir(path.join(root, relativePath), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(child));
    else files.push(child);
  }
  return files;
}

const files = (await Promise.all(reusableRoots.map(collectFiles))).flat();
const failures = [];
for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  try {
    if (textExtensions.has(extension)) {
      assertTextHasCurrentSnackPrice(await readFile(path.join(root, file), "utf8"), file);
    } else if (imageExtensions.has(extension)) {
      assertImageBytesAreCurrent(await readFile(path.join(root, file)), file);
    }
  } catch (error) {
    failures.push(error.message);
  }
}

assert.deepEqual(failures, [], `Reusable publishing assets contain retired $3.99 material:\n${failures.join("\n")}`);
console.log(`Publishing price safety passed across ${files.length} reusable caption and social-asset files.`);
