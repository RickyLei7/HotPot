import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const retiredSnackPricePattern = /3[.,]99/iu;
const obsoleteArchiveSegment = "/marketing/archive/obsolete-3-99/";

const retiredAssetSha256 = new Set([
  "71995bf9ea51f099fa6d759e44fc3206e97537bd071eab27266b26771b0343a0",
  "43001e2c8ea0583d1f8f87e917ade4d82f13ce66aab1b69aa327687b8fab86f7",
  "ffbc9cd271ebd68496f98e779f523619ac25b511e36e111d9fa9d049b9527857",
  "0f8237d997a9534288788f6c20fad348d773513a71d6e4008042a33eacac4702",
  "7e7b14e6d5109ba28b43ad1ea70d12774bd35994523497da337cbaab9bdbf494",
  "43c6a2d1a1e63070814459676f36eda9749a5c1d923d46cfb0b774680c015313",
  "c5a395e00c6ddcaef86510cc3211e90b222c2b0ae67d01ded5f0d677f3c2e041",
]);

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function normalizeSlashes(value) {
  return value.replaceAll("\\", "/");
}

export function assertTextHasCurrentSnackPrice(text, label = "Publishing copy") {
  if (retiredSnackPricePattern.test(text)) {
    throw new Error(`${label} contains the retired $3.99 appetizer-upgrade price. Current price is $5.99; publishing blocked.`);
  }
}

export function assertImageBytesAreCurrent(contents, label = "Publishing image") {
  if (retiredAssetSha256.has(sha256(contents))) {
    throw new Error(`${label} matches a retired $3.99 promotional image; publishing blocked.`);
  }
}

async function assertImageFileIsCurrent(filePath, root) {
  const absolutePath = path.resolve(root, filePath);
  const normalizedPath = normalizeSlashes(absolutePath);
  if (normalizedPath.includes(obsoleteArchiveSegment)) {
    throw new Error(`${filePath} is stored in the obsolete $3.99 archive; publishing blocked.`);
  }
  assertImageBytesAreCurrent(await readFile(absolutePath), filePath);
}

async function assertImageUrlIsCurrent(imageUrl) {
  const parsed = new URL(imageUrl);
  if (decodeURIComponent(parsed.pathname).includes("/archive/obsolete-3-99/")) {
    throw new Error(`${imageUrl} points to the obsolete $3.99 archive; publishing blocked.`);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Could not verify publishing image ${imageUrl} (${response.status}); publishing blocked.`);
  }
  assertImageBytesAreCurrent(Buffer.from(await response.arrayBuffer()), imageUrl);
}

export async function assertPublishAssetsAreCurrent({
  text,
  textLabel,
  imageFiles = [],
  imageUrls = [],
  root = process.cwd(),
} = {}) {
  if (text !== undefined) assertTextHasCurrentSnackPrice(text, textLabel);
  await Promise.all([
    ...imageFiles.map((filePath) => assertImageFileIsCurrent(filePath, root)),
    ...imageUrls.map(assertImageUrlIsCurrent),
  ]);
}
