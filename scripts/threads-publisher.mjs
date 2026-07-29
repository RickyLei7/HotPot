import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.threads.local");
const [command = "help", ...args] = process.argv.slice(2);

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
    userId: required(env.THREADS_USER_ID, "Missing THREADS_USER_ID in .env.threads.local."),
    accessToken: required(env.THREADS_ACCESS_TOKEN, "Missing THREADS_ACCESS_TOKEN in .env.threads.local."),
  };
}

async function request(endpoint, { method = "GET", form } = {}, settings) {
  const response = await fetch(`https://graph.threads.net/v1.0/${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${settings.accessToken}`, ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: form ? new URLSearchParams(form) : undefined,
  });
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(`Threads API ${response.status}: ${body.error?.message ?? "Unknown error"}`);
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
  const account = await request(`${settings.userId}?fields=id,username`, {}, settings);
  console.log(JSON.stringify({ connected: true, account }, null, 2));
}

async function prepareOrPublish() {
  const settings = await config();
  const imageUrl = required(option("--image-url"), "Missing --image-url.");
  const captionFile = required(option("--caption-file"), "Missing --caption-file.");
  const text = (await readFile(path.resolve(root, captionFile), "utf8")).trim();
  ownedImage(imageUrl);
  const preview = { userId: settings.userId, imageUrl, captionCharacters: [...text].length, publish: command === "publish" };
  if (command === "prepare") return console.log(JSON.stringify(preview, null, 2));
  if (option("--confirm") !== "yes") throw new Error("Publishing requires --confirm yes.");

  const container = await request(`${settings.userId}/threads`, {
    method: "POST",
    form: { media_type: "IMAGE", image_url: imageUrl, text },
  }, settings);
  const published = await request(`${settings.userId}/threads_publish`, {
    method: "POST",
    form: { creation_id: container.id },
  }, settings);
  console.log(JSON.stringify({ published: true, published }, null, 2));
}

if (command === "verify") await verify();
else if (command === "prepare" || command === "publish") await prepareOrPublish();
else console.log("Usage: node scripts/threads-publisher.mjs verify|prepare|publish --image-url <https-url> --caption-file <file> [--confirm yes]");
