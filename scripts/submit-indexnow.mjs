import { readFile } from "node:fs/promises";
import path from "node:path";

const host = "centrestjhotpot.ca";
const key = "551313750fa0fcf65418e07bdcc3b972";
const keyLocation = `https://${host}/${key}.txt`;
const sitemapPath = path.resolve(import.meta.dirname, "..", "public", "sitemap.xml");

const requestedUrls = process.argv.slice(2);
const sitemap = await readFile(sitemapPath, "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/centrestjhotpot\.ca\/[^<]*)<\/loc>/g)].map((match) => match[1]);
const urlList = requestedUrls.length > 0 ? requestedUrls : sitemapUrls;

if (urlList.length === 0) {
  throw new Error("No Centre Street HotPot URLs were found for IndexNow submission.");
}

for (const url of urlList) {
  const parsed = new URL(url);
  if (parsed.hostname !== host || parsed.protocol !== "https:") {
    throw new Error(`IndexNow URL must use https://${host}: ${url}`);
  }
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`IndexNow returned ${response.status}: ${body.slice(0, 500)}`);
}

console.log(`Submitted ${urlList.length} URLs to IndexNow (${response.status}).`);
