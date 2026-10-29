import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://centrestjhotpot.ca";
const defaultLastmod = "2026-09-21";
// These pages have no page-level dateModified. Update only after significant content changes.
const undatedLastmod = new Map([
  ["/privacy-policy/", "2026-10-29"],
  ["/table-menu/", "2026-10-29"],
  ["/contact/", "2026-10-29"],
]);
const lastmodByPath = new Map(undatedLastmod);
const pairs = [
  ["/", "/zh-hant/", "weekly", "1.0"],
  ["/about/", "/zh-hant/about/", "monthly", "0.8"],
  ["/menu/", "/zh-hant/menu/", "weekly", "0.9"],
  ["/faq/", "/zh-hant/faq/", "monthly", "0.7"],
  ["/contact/", "/zh-hant/contact/", "monthly", "0.8"],
  ["/restaurant-info/", "/zh-hant/restaurant-info/", "monthly", "0.8"],
  ["/calgary-hot-pot-guide/", "/zh-hant/calgary-hot-pot-guide/", "monthly", "0.8"],
  ["/calgary-taiwanese-hot-pot/", "/zh-hant/calgary-taiwanese-hot-pot/", "monthly", "0.8"],
  ["/first-time-hot-pot-calgary/", "/zh-hant/first-time-hot-pot-calgary/", "monthly", "0.8"],
  ["/ayce-hot-pot-calgary/", "/zh-hant/ayce-hot-pot-calgary/", "weekly", "0.9"],
];

for (const pathname of pairs.flatMap(([en, zh]) => [en, zh])) {
  const html = await readFile(path.join(process.cwd(), "public", pathname, "index.html"), "utf8");
  const dates = [...html.matchAll(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/g)].map(match => match[1]);
  if (dates.length) lastmodByPath.set(pathname, dates.sort().at(-1));
}

function entry(pathname, englishPath, traditionalChinesePath, changefreq, priority) {
  const lastmod = lastmodByPath.get(pathname) ?? defaultLastmod;
  return `  <url>
    <loc>${baseUrl}${pathname}</loc>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${baseUrl}${englishPath}" />
    <xhtml:link rel="alternate" hreflang="zh-Hant-CA" href="${baseUrl}${traditionalChinesePath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${englishPath}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = pairs.flatMap(([englishPath, traditionalChinesePath, changefreq, priority]) => [
  entry(englishPath, englishPath, traditionalChinesePath, changefreq, priority),
  entry(traditionalChinesePath, englishPath, traditionalChinesePath, changefreq, priority),
]);

entries.push(
  `  <url>\n    <loc>${baseUrl}/privacy-policy/</loc>\n    <lastmod>${lastmodByPath.get("/privacy-policy/")}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>`,
  `  <url>\n    <loc>${baseUrl}/table-menu/</loc>\n    <lastmod>${lastmodByPath.get("/table-menu/")}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;

const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
if (process.argv.includes("--check")) {
  if (await readFile(sitemapPath, "utf8") !== sitemap) throw new Error("Sitemap dates or language links drifted. Run node scripts/build-bilingual-sitemap.mjs.");
} else await writeFile(sitemapPath, sitemap);
console.log(`Built bilingual sitemap with ${entries.length} URLs.`);
