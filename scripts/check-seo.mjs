import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { menuPrices } from '../assistant/facts.mjs';

execFileSync(process.execPath, ['scripts/build-bilingual-sitemap.mjs', '--check'], { stdio: 'inherit' });

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
const zhPages = Object.values(JSON.parse(await readFile('app/zh-hant/page-data.json', 'utf8')));
const titles = new Set();
const inbound = new Set();
let links = 0, answers = 0;
for (const url of urls) {
  const html = await documentFor(url);
  const title = clean(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
  assert.ok(title && !titles.has(title), `${url}: missing or duplicate title`);
  titles.add(title);
  const route = new URL(url).pathname;
  if (!route.startsWith('/zh-hant/')) {
    const sourcePath = route === '/' ? path.resolve('app/layout.tsx') : path.resolve('app', route.slice(1), 'page.tsx');
    const source = await readFile(sourcePath, 'utf8');
    assert.equal(source.match(/\bcanonical:\s*"([^"]+)"/)?.[1], route, `${url}: source canonical differs from the published route`);
    assert.equal(source.match(/\btitle:\s*"([^"]+)"/)?.[1], title, `${url}: source and published titles differ`);
    const description = clean(html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? '');
    assert.equal(source.match(/\bdescription:\s*"([^"]+)"/)?.[1], description, `${url}: source and published descriptions differ`);
  }
  if (route.startsWith('/zh-hant/')) {
    const source = zhPages.find(page => page.path === route);
    assert.ok(source, `${url}: missing Chinese page source`);
    assert.equal(title, source.title, `${url}: Chinese source and published titles differ`);
    assert.equal(clean(html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? ''), source.description, `${url}: Chinese source and published descriptions differ`);
  }
  if (html.includes('data-dining-helper')) assert.match(html, /<section\b[^>]*\bdata-dining-helper\b[^>]*\bdata-nosnippet(?:\s|=|>)/, `${url}: chat boilerplate can leak into search snippets`);
  assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/s, `${url}: missing description`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${url}: expected one H1`);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `${url}: canonical mismatch`);
  assert.doesNotMatch(html, /name="robots"[^>]*content="[^"]*noindex/, `${url}: sitemap includes noindex page`);
  const body = html.split('</head>')[1];
  for (const [, href] of body.matchAll(/href="([^"]+)"/g)) {
    const target = new URL(href.replace(/&amp;/g, '&'), url);
    if (target.origin !== origin) continue;
    if (target.pathname !== new URL(url).pathname) inbound.add(target.origin + target.pathname);
    const filename = path.join(root, decodeURIComponent(target.pathname));
    const info = await stat(filename).catch(() => null);
    assert.ok(info, `${url}: missing internal link ${href}`);
    if (target.hash && info.isDirectory()) {
      const targetHtml = await documentFor(target);
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${url}: missing anchor ${href}`);
    }
    links++;
  }
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
// Keep public restaurant reference pages and AI-readable facts aligned with menu rates.
const menuHtml = await documentFor(`${origin}/menu/`);
const menuSchema = [...menuHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json)).find(schema => schema['@type'] === 'Menu');
const diningPrices = menuPrices(menuSchema);
const referencePages = [
  ['llms.txt', await readFile(path.join(root, 'llms.txt'), 'utf8')],
  ...await Promise.all(['/restaurant-info/', '/zh-hant/restaurant-info/'].map(async route => [route, clean((await documentFor(origin + route)).split('</head>')[1])])),
];
assert.match(referencePages[0][1], /^#\s+\S/m, 'llms.txt: missing document heading');
assert.match(referencePages[0][1], /\[[^\]]+\]\(https:\/\/centrestjhotpot\.ca\/[^)\s]*\)/, 'llms.txt: official sources must be Markdown links');
for (const [label, text] of referencePages) {
  for (const key of ['ayce', 'personal', 'snacks', 'solo', 'couple']) {
    const price = `$${(diningPrices[key] / 100).toFixed(2)}`;
    assert.ok(text.includes(price), `${label}: missing current ${key} price ${price}`);
  }
}
for (const url of urls) assert.ok(inbound.has(url), `${url}: indexed page has no incoming link from another sitemap page`);
console.log(`SEO checks passed: ${urls.length} sitemap pages, ${links} internal links, ${answers} visible FAQ answers match structured data.`);
