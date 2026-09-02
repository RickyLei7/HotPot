import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { flattenMenuItems } from "../scripts/lib/table-menu-data.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const menu = JSON.parse(await readFile(path.join(root, "content/table-menu/menu.json"), "utf8"));
const manifest = JSON.parse(await readFile(path.join(root, "content/table-menu/image-manifest.json"), "utf8"));

async function makeRepoTempDir(label) {
  return mkdtemp(path.join(root, `.tmp-table-menu-images-${label}-`));
}

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    return null;
  }
}

test("manifest covers every active image ID exactly once", () => {
  const expected = [...new Set(
    flattenMenuItems(menu)
      .filter((item) => item.available)
      .map((item) => item.imageId),
  )].sort();
  const actual = manifest.images.map((entry) => entry.imageId).sort();

  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length);
});

test("all generated derivatives are valid WebP images", async () => {
  const sharp = await loadSharp();

  for (const { imageId } of manifest.images) {
    for (const width of [320, 640]) {
      const file = path.join(root, `public/assets/table-menu/${imageId}-${width}.webp`);
      await access(file);

      if (!sharp) {
        continue;
      }

      const metadata = await sharp(file).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.width, width);
      assert.ok(metadata.height > 0);
    }
  }
});

test("real manifest and committed sources regenerate the full catalog", async () => {
  const tempDir = await makeRepoTempDir("rebuild");
  const outputDir = path.relative(root, tempDir);
  const sharp = await loadSharp();

  try {
    const { buildImages } = await import(pathToFileURL(path.join(root, "scripts/build-table-menu-images.mjs")));
    await buildImages({ rootDir: root, outputDir });

    for (const { imageId } of manifest.images) {
      for (const width of [320, 640]) {
        const file = path.join(tempDir, `${imageId}-${width}.webp`);
        await access(file);

        if (sharp) {
          const metadata = await sharp(file).metadata();
          assert.equal(metadata.format, "webp");
          assert.equal(metadata.width, width);
          assert.equal(metadata.height, Math.round(width * 0.75));
        }
      }
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("builder rejects missing source images with a clear error", async () => {
  const tempDir = await makeRepoTempDir("missing");

  try {
    const { buildImages } = await import(pathToFileURL(path.join(root, "scripts/build-table-menu-images.mjs")));
    await assert.rejects(
      () => buildImages({
        rootDir: tempDir,
        manifest: {
          images: [{ imageId: "sample-dish", source: "missing/sample.png", position: "center" }],
        },
      }),
      /Missing source image for sample-dish: missing\/sample\.png/u,
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("builder rejects invalid focal positions with a clear error", async () => {
  const tempDir = await makeRepoTempDir("position");

  try {
    const { buildImages } = await import(pathToFileURL(path.join(root, "scripts/build-table-menu-images.mjs")));
    await assert.rejects(
      () => buildImages({
        rootDir: tempDir,
        manifest: {
          images: [{ imageId: "sample-dish", source: "sample.png", position: "middle-ish" }],
        },
      }),
      /Invalid focal position for sample-dish: middle-ish/u,
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
