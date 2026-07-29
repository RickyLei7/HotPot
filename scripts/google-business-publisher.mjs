import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.google-business.local");
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
  const settings = {
    accessToken: required(env.GOOGLE_BUSINESS_ACCESS_TOKEN, "Missing GOOGLE_BUSINESS_ACCESS_TOKEN in .env.google-business.local."),
    accountId: required(env.GOOGLE_BUSINESS_ACCOUNT_ID, "Missing GOOGLE_BUSINESS_ACCOUNT_ID in .env.google-business.local."),
    locationId: required(env.GOOGLE_BUSINESS_LOCATION_ID, "Missing GOOGLE_BUSINESS_LOCATION_ID in .env.google-business.local."),
    refreshToken: env.GOOGLE_BUSINESS_REFRESH_TOKEN,
    clientId: env.GOOGLE_BUSINESS_CLIENT_ID,
    clientSecret: env.GOOGLE_BUSINESS_CLIENT_SECRET,
  };
  return settings;
}

async function refreshAccessTokenIfPossible(settings) {
  if (!settings.refreshToken || !settings.clientId || !settings.clientSecret) return settings;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: settings.clientId,
      client_secret: settings.clientSecret,
      refresh_token: settings.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const token = await response.json();
  if (!response.ok || !token.access_token) {
    throw new Error(`Google OAuth refresh ${response.status}: ${token.error_description ?? token.error ?? "Unknown error"}`);
  }

  const raw = await readFile(envPath, "utf8");
  const updated = raw.replace(/^GOOGLE_BUSINESS_ACCESS_TOKEN=.*$/m, `GOOGLE_BUSINESS_ACCESS_TOKEN=${token.access_token}`);
  await writeFile(envPath, updated, { mode: 0o600 });
  return { ...settings, accessToken: token.access_token };
}

async function request(url, { method = "GET", body } = {}, settings) {
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${settings.accessToken}`, "Content-Type": "application/json", "X-GOOG-API-FORMAT-VERSION": "2" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  if (!response.ok || json.error) throw new Error(`Google Business API ${response.status}: ${json.error?.message ?? "Unknown error"}`);
  return json;
}

function ownedImage(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !new Set(["centrestjhotpot.ca", "www.centrestjhotpot.ca"]).has(parsed.hostname)) {
    throw new Error("Image URL must be a public HTTPS asset hosted on centrestjhotpot.ca.");
  }
}

async function verify() {
  const settings = await refreshAccessTokenIfPossible(await config());
  const account = await request(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts/${settings.accountId}`, {}, settings);
  console.log(JSON.stringify({ connected: true, account }, null, 2));
}

async function prepareOrPublish() {
  const settings = await refreshAccessTokenIfPossible(await config());
  const imageUrl = required(option("--image-url"), "Missing --image-url.");
  const captionFile = required(option("--caption-file"), "Missing --caption-file.");
  const summary = (await readFile(path.resolve(root, captionFile), "utf8")).trim();
  const callToActionUrl = required(option("--call-to-action-url"), "Missing --call-to-action-url.");
  ownedImage(imageUrl);
  const payload = {
    languageCode: "en-US",
    summary,
    topicType: "STANDARD",
    media: [{ mediaFormat: "PHOTO", sourceUrl: imageUrl }],
    callToAction: { actionType: "LEARN_MORE", url: callToActionUrl },
  };
  if (command === "prepare") return console.log(JSON.stringify({ parent: `accounts/${settings.accountId}/locations/${settings.locationId}`, payload, publish: false }, null, 2));
  if (option("--confirm") !== "yes") throw new Error("Publishing requires --confirm yes.");
  const post = await request(`https://mybusiness.googleapis.com/v4/accounts/${settings.accountId}/locations/${settings.locationId}/localPosts`, { method: "POST", body: payload }, settings);
  console.log(JSON.stringify({ published: true, post }, null, 2));
}

if (command === "verify") await verify();
else if (command === "prepare" || command === "publish") await prepareOrPublish();
else console.log("Usage: node scripts/google-business-publisher.mjs verify|prepare|publish --image-url <https-url> --caption-file <file> --call-to-action-url <https-url> [--confirm yes]");
