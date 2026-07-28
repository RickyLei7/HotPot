#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const appId = "2145685099334514";
const redirectUri = "https://centrestjhotpot.ca/instagram-auth/";
const envPath = path.resolve(".env.instagram.local");

function readCode(value) {
  try {
    const url = new URL(value);
    return url.searchParams.get("code") || "";
  } catch {
    return value.trim();
  }
}

function writeLocalEnv(token, userId) {
  const contents = [
    `INSTAGRAM_ACCESS_TOKEN=${token}`,
    `INSTAGRAM_USER_ID=${userId}`,
    `INSTAGRAM_APP_ID=${appId}`,
    `INSTAGRAM_REDIRECT_URI=${redirectUri}`,
    "",
  ].join("\n");

  fs.writeFileSync(envPath, contents, { encoding: "utf8", mode: 0o600 });
  fs.chmodSync(envPath, 0o600);
}

async function main() {
  const appSecret = process.env.INSTAGRAM_APP_SECRET || "";
  const redirect = process.env.INSTAGRAM_AUTH_REDIRECT || "";

  const code = readCode(redirect);
  if (!appSecret || !code) {
    throw new Error("An app secret and authorization code are both required.");
  }

  const form = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const exchange = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const exchanged = await exchange.json();
  if (!exchange.ok || !exchanged.access_token || !exchanged.user_id) {
    throw new Error(`Instagram token exchange failed: ${JSON.stringify(exchanged)}`);
  }

  const longLivedUrl = new URL("https://graph.instagram.com/access_token");
  longLivedUrl.search = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: appSecret,
    access_token: exchanged.access_token,
  }).toString();
  const longLivedResponse = await fetch(longLivedUrl);
  const longLived = await longLivedResponse.json();
  if (!longLivedResponse.ok || !longLived.access_token) {
    throw new Error(`Instagram long-lived token exchange failed: ${JSON.stringify(longLived)}`);
  }

  const profileResponse = await fetch("https://graph.instagram.com/me?fields=id,username", {
    headers: { Authorization: `Bearer ${longLived.access_token}` },
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok || !profile.id) {
    throw new Error(`Instagram profile verification failed: ${JSON.stringify(profile)}`);
  }

  writeLocalEnv(longLived.access_token, profile.id);
  console.log(JSON.stringify({ connected: true, id: profile.id, username: profile.username, expiresIn: longLived.expires_in }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
