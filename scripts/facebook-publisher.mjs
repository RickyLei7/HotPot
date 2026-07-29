import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.facebook.local");
const [command = "help", ...args] = process.argv.slice(2);
const apiVersion = "v23.0";

function option(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

async function config() {
  const raw = await readFile(envPath, "utf8");
  const env = Object.fromEntries(raw.split("\n").flatMap((line) => {
    const separator = line.indexOf("=");
    return separator > 0 && !line.startsWith("#") ? [[line.slice(0, separator), line.slice(separator + 1)]] : [];
  }));
  return {
    pageId: required(env.FACEBOOK_PAGE_ID, "Missing FACEBOOK_PAGE_ID in .env.facebook.local."),
    accessToken: required(env.FACEBOOK_PAGE_ACCESS_TOKEN, "Missing FACEBOOK_PAGE_ACCESS_TOKEN in .env.facebook.local."),
  };
}

async function graph(endpoint, { method = "GET", form } = {}, settings) {
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${endpoint}`, {
    method,
    headers: form ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
    body: form ? new URLSearchParams({ ...form, access_token: settings.accessToken }) : undefined,
  });
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(`Facebook API ${response.status}: ${body.error?.message ?? "Unknown error"}`);
  return body;
}

function ownedImage(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !new Set(["centrestjhotpot.ca", "www.centrestjhotpot.ca"]).has(parsed.hostname)) {
    throw new Error("Image URL must be a public HTTPS asset hosted on centrestjhotpot.ca.");
  }
}

async function verify() {
  const settings = await config();
  const page = await graph(`${settings.pageId}?fields=id,name,link`, {}, settings);
  console.log(JSON.stringify({ connected: true, page }, null, 2));
}

async function prepareOrPublish() {
  const settings = await config();
  const imageUrl = required(option("--image-url"), "Missing --image-url.");
  const captionFile = required(option("--caption-file"), "Missing --caption-file.");
  const caption = (await readFile(path.resolve(root, captionFile), "utf8")).trim();
  ownedImage(imageUrl);
  const preview = { pageId: settings.pageId, imageUrl, captionCharacters: [...caption].length, publish: command === "publish" };
  if (command === "prepare") return console.log(JSON.stringify(preview, null, 2));
  if (option("--confirm") !== "yes") throw new Error("Publishing requires --confirm yes.");

  const post = await graph(`${settings.pageId}/photos`, {
    method: "POST",
    form: { url: imageUrl, caption, published: "true" },
  }, settings);
  console.log(JSON.stringify({ published: true, post }, null, 2));
}

if (command === "verify") await verify();
else if (command === "prepare" || command === "publish") await prepareOrPublish();
else console.log("Usage: node scripts/facebook-publisher.mjs verify|prepare|publish --image-url <https-url> --caption-file <file> [--confirm yes]");
