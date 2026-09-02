import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const VALID_POSITIONS = new Set([
  "center",
  "top",
  "right top",
  "right",
  "right bottom",
  "bottom",
  "left bottom",
  "left",
  "left top",
]);

const OUTPUT_WIDTHS = [320, 640];

function fail(message) {
  throw new Error(message);
}

function normalizeManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("image manifest must be an object");
  }

  if (!Array.isArray(manifest.images)) {
    fail("image manifest must include an images array");
  }

  return manifest.images;
}

function resolveRepoPath(rootDir, relativePath) {
  const resolved = path.resolve(rootDir, relativePath);
  const relative = path.relative(rootDir, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`Source path escapes repository root: ${relativePath}`);
  }

  return resolved;
}

async function ensureReadableFile(filePath, imageId, source) {
  try {
    await access(filePath);
  } catch {
    fail(`Missing source image for ${imageId}: ${source}`);
  }
}

function validateEntry(entry, seenIds) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    fail("image manifest entries must be objects");
  }

  const { imageId, source, position } = entry;

  if (typeof imageId !== "string" || !imageId.trim()) {
    fail("image manifest entry is missing imageId");
  }

  if (seenIds.has(imageId)) {
    fail(`Duplicate manifest imageId: ${imageId}`);
  }
  seenIds.add(imageId);

  if (typeof source !== "string" || !source.trim()) {
    fail(`Missing source image for ${imageId}: ${source}`);
  }

  if (typeof position !== "string" || !VALID_POSITIONS.has(position)) {
    fail(`Invalid focal position for ${imageId}: ${position}`);
  }
}

async function buildDerivative(sourcePath, outputPath, width, position, imageId, source) {
  try {
    await sharp(sourcePath)
      .rotate()
      .resize({ width, height: Math.round(width * 0.75), fit: "cover", position })
      .webp({ quality: 78, effort: 5 })
      .toFile(outputPath);
  } catch (error) {
    fail(`Unreadable source image for ${imageId}: ${source}\n${error.message}`);
  }
}

export async function buildImages({
  rootDir = path.resolve(new URL("..", import.meta.url).pathname),
  manifestPath = "content/table-menu/image-manifest.json",
  outputDir = "public/assets/table-menu",
  manifest,
} = {}) {
  const loadedManifest = manifest
    ?? JSON.parse(await readFile(resolveRepoPath(rootDir, manifestPath), "utf8"));
  const images = normalizeManifest(loadedManifest);
  const outputDirectory = resolveRepoPath(rootDir, outputDir);
  const seenIds = new Set();

  await mkdir(outputDirectory, { recursive: true });

  for (const entry of [...images].sort((left, right) => left.imageId.localeCompare(right.imageId))) {
    validateEntry(entry, seenIds);

    const sourcePath = resolveRepoPath(rootDir, entry.source);
    await ensureReadableFile(sourcePath, entry.imageId, entry.source);

    for (const width of OUTPUT_WIDTHS) {
      const outputPath = path.join(outputDirectory, `${entry.imageId}-${width}.webp`);
      await buildDerivative(sourcePath, outputPath, width, entry.position, entry.imageId, entry.source);
    }
  }
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await buildImages();
}
