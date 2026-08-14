import { writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://centrestjhotpot.ca";
const lastmod = "2026-08-13";
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

function entry(pathname, englishPath, traditionalChinesePath, changefreq, priority) {
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;

await writeFile(path.join(process.cwd(), "public", "sitemap.xml"), sitemap);
console.log(`Built bilingual sitemap with ${entries.length} URLs.`);
