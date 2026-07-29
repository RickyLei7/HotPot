import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const root = process.cwd();
const envPath = path.join(root, ".env.google-business.local");
const redirectUri = "http://127.0.0.1:8787/google-business-auth/";
const scope = "https://www.googleapis.com/auth/business.manage";

function parseEnv(raw) {
  return Object.fromEntries(raw.split("\n").flatMap((line) => {
    const separator = line.indexOf("=");
    return separator > 0 && !line.startsWith("#") ? [[line.slice(0, separator), line.slice(separator + 1)]] : [];
  }));
}

function upsert(raw, name, value) {
  const line = `${name}=${value}`;
  return new RegExp(`^${name}=.*$`, "m").test(raw) ? raw.replace(new RegExp(`^${name}=.*$`, "m"), line) : `${raw.trim()}\n${line}\n`;
}

const raw = await readFile(envPath, "utf8");
const env = parseEnv(raw);
if (!env.GOOGLE_BUSINESS_CLIENT_ID || !env.GOOGLE_BUSINESS_CLIENT_SECRET) {
  throw new Error("Run ./scripts/save-google-business-client.sh before connecting Google Business Profile.");
}

const state = randomBytes(24).toString("hex");
const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authorizationUrl.search = new URLSearchParams({
  client_id: env.GOOGLE_BUSINESS_CLIENT_ID,
  redirect_uri: redirectUri,
  response_type: "code",
  scope,
  access_type: "offline",
  prompt: "consent",
  state,
}).toString();

console.log("Open this URL in Chrome while this terminal stays open:\n");
console.log(authorizationUrl.toString());
console.log(`\nAfter approving Google access, this script is listening on ${redirectUri}.`);

const result = await new Promise((resolve, reject) => {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", redirectUri);
    if (url.pathname !== "/google-business-auth/") {
      response.writeHead(404).end("Not found");
      return;
    }
    if (url.searchParams.get("state") !== state) {
      response.writeHead(400).end("OAuth state did not match. Close this page and try again.");
      reject(new Error("Google OAuth state did not match."));
      server.close();
      return;
    }
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    if (!code || error) {
      response.writeHead(400).end("Google authorization was not completed. You can close this page.");
      reject(new Error(`Google OAuth failed: ${error ?? "authorization code missing"}`));
      server.close();
      return;
    }
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<title>Centre Street HotPot</title><p>Google Business Profile connected. You may close this tab.</p>");
    resolve({ code, server });
  });
  server.once("error", reject);
  server.listen(8787, "127.0.0.1");
});

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code: result.code,
    client_id: env.GOOGLE_BUSINESS_CLIENT_ID,
    client_secret: env.GOOGLE_BUSINESS_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  }),
});
const token = await tokenResponse.json();
result.server.close();
if (!tokenResponse.ok || !token.access_token || !token.refresh_token) {
  throw new Error(`Google OAuth exchange failed: ${token.error_description ?? token.error ?? "no refresh token received"}`);
}

let updated = raw;
updated = upsert(updated, "GOOGLE_BUSINESS_ACCESS_TOKEN", token.access_token);
updated = upsert(updated, "GOOGLE_BUSINESS_REFRESH_TOKEN", token.refresh_token);
await writeFile(envPath, updated, { mode: 0o600 });
console.log("Google Business OAuth token saved locally. Next run: node scripts/google-business-publisher.mjs accounts");
