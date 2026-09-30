import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://centrestjhotpot.ca';
const root = path.resolve('public');
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const files = new Map();
const clean = text => text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
async function documentFor(url) {
  const route = new URL(url).pathname;
  const filename = path.join(root, route, 'index.html');
  if (!files.has(filename)) files.set(filename, await readFile(filename, 'utf8'));
  return files.get(filename);
}
const titles = new Set();
let links = 0, answers = 0;
for (const url of urls) {
  const html = await documentFor(url);
  const title = clean(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
  assert.ok(title && !titles.has(title), `${url}: missing or duplicate title`);
  titles.add(title);
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/s, `${url}: missing description`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${url}: expected one H1`);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `${url}: canonical mismatch`);
  assert.doesNotMatch(html, /name="robots"[^>]*content="[^"]*noindex/, `${url}: sitemap includes noindex page`);
  const body = html.split('</head>')[1];
  for (const [, href] of body.matchAll(/href="([^"]+)"/g)) {
    const target = new URL(href.replace(/&amp;/g, '&'), url);
    if (target.origin !== origin) continue;
    const filename = path.join(root, decodeURIComponent(target.pathname));
    const info = await stat(filename).catch(() => null);
    assert.ok(info, `${url}: missing internal link ${href}`);
    if (target.hash && info.isDirectory()) {
      const targetHtml = await documentFor(target);
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${url}: missing anchor ${href}`);
    }
    links++;
  }
  if (['/faq/', '/zh-hant/faq/', '/ayce-hot-pot-calgary/', '/zh-hant/ayce-hot-pot-calgary/'].includes(new URL(url).pathname)) {
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(json);
      for (const node of schema['@graph'] ?? [schema]) {
        if (node['@type'] !== 'FAQPage') continue;
        for (const question of node.mainEntity) {
          const visible = [...body.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].find(([, source]) => clean(source.match(/<h2[^>]*>(.*?)<\/h2>/s)?.[1] ?? '') === question.name);
          assert.ok(visible, `${url}: FAQ question is not visible: ${question.name}`);
          assert.equal(clean(visible[1].match(/<p[^>]*>(.*?)<\/p>/s)?.[1] ?? ''), clean(question.acceptedAnswer.text), `${url}: FAQ answer differs from schema`);
          answers++;
        }
      }
    }
  }
}
console.log(`SEO checks passed: ${urls.length} sitemap pages, ${links} internal links, ${answers} visible FAQ answers match structured data.`);
