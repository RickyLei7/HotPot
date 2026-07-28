import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.instagram.local");
const [command = "help", ...args] = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function requireOption(name) {
  const value = option(name);
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}

function parseEnv(contents) {
  return Object.fromEntries(contents.split("\n").flatMap((line) => {
    const separator = line.indexOf("=");
    if (separator <= 0 || line.startsWith("#")) return [];
    return [[line.slice(0, separator), line.slice(separator + 1)]];
  }));
}

async function loadConfig() {
  const env = parseEnv(await readFile(envPath, "utf8"));
  if (!env.INSTAGRAM_ACCESS_TOKEN?.startsWith("IGAA")) {
    throw new Error("Missing a valid-looking INSTAGRAM_ACCESS_TOKEN in .env.instagram.local.");
  }
  if (!env.INSTAGRAM_USER_ID) {
    throw new Error("Missing INSTAGRAM_USER_ID in .env.instagram.local.");
  }
  return env;
}

async function graphRequest(config, endpoint, { method = "GET", form } = {}) {
  const response = await fetch(`https://graph.instagram.com/${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.INSTAGRAM_ACCESS_TOKEN}`,
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: form ? new URLSearchParams(form) : undefined,
  });
  const body = await response.json();
  if (!response.ok || body.error) {
    throw new Error(`Instagram API ${response.status}: ${body.error?.message ?? "Unknown error"}`);
  }
  return body;
}

function ensureRestaurantAsset(url) {
  const parsed = new URL(url);
  const allowedHosts = new Set(["centrestjhotpot.ca", "www.centrestjhotpot.ca"]);
  if (parsed.protocol !== "https:" || !allowedHosts.has(parsed.hostname)) {
    throw new Error("Image URL must be a public HTTPS asset hosted on centrestjhotpot.ca.");
  }
}

async function verify() {
  const config = await loadConfig();
  const account = await graphRequest(config, "me?fields=id,username");
  console.log(JSON.stringify({ connected: true, account }, null, 2));
}

async function waitForContainer(config, creationId) {
  const deadline = Date.now() + 90_000;
  let lastStatus = "unknown";

  while (Date.now() < deadline) {
    const container = await graphRequest(config, `${creationId}?fields=status_code,status`);
    lastStatus = container.status_code ?? container.status ?? lastStatus;

    if (lastStatus === "FINISHED") return;
    if (lastStatus === "ERROR" || lastStatus === "EXPIRED") {
      throw new Error(`Instagram media processing failed with status ${lastStatus}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  throw new Error(`Instagram media processing did not finish within 90 seconds (last status: ${lastStatus}).`);
}

async function prepareOrPublish() {
  const config = await loadConfig();
  const imageUrl = requireOption("--image-url");
  const captionFile = requireOption("--caption-file");
  const caption = (await readFile(path.resolve(root, captionFile), "utf8")).trim();
  ensureRestaurantAsset(imageUrl);

  const preview = {
    accountId: config.INSTAGRAM_USER_ID,
    imageUrl,
    captionCharacters: [...caption].length,
    publish: command === "publish",
  };

  if (command === "prepare") {
    console.log(JSON.stringify(preview, null, 2));
    return;
  }

  if (option("--confirm") !== "yes") {
    throw new Error("Publishing requires --confirm yes.");
  }

  const container = await graphRequest(config, `${config.INSTAGRAM_USER_ID}/media`, {
    method: "POST",
    form: { image_url: imageUrl, caption, media_type: "IMAGE" },
  });
  await waitForContainer(config, container.id);
  const published = await graphRequest(config, `${config.INSTAGRAM_USER_ID}/media_publish`, {
    method: "POST",
    form: { creation_id: container.id },
  });
  const media = await graphRequest(config, `${published.id}?fields=id,permalink,timestamp`);
  console.log(JSON.stringify({ published: true, media }, null, 2));
}

if (command === "verify") {
  await verify();
} else if (command === "prepare" || command === "publish") {
  await prepareOrPublish();
} else {
  console.log(`Usage:
  node scripts/instagram-publisher.mjs verify
  node scripts/instagram-publisher.mjs prepare --image-url https://centrestjhotpot.ca/assets/social/example.png --caption-file marketing/captions/example.txt
  node scripts/instagram-publisher.mjs publish --image-url https://centrestjhotpot.ca/assets/social/example.png --caption-file marketing/captions/example.txt --confirm yes`);
}
