import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

for (const route of ['', 'zh-hant/']) {
  const html = await readFile(`public/${route}index.html`, 'utf8');
  assert.equal((html.match(/<details class="home-details">/g) || []).length, 2);
  assert.match(html, /class="offer-tax"/);
  assert.match(html, /class="hero-visit"/);
  assert.match(html, /2213 Centre St N #2243/);
  for (const id of ['homepage-ayce-image', 'personal-menu-image', 'beef-noodle-story-image']) {
    assert.ok(html.includes(`href="#${id}"`) && html.includes(`id="${id}"`));
  }
}
const zhHome = await readFile('public/zh-hant/index.html', 'utf8');
assert.match(zhHome, /<span class="heading-unit">火鍋自助<\/span>/);
const data = JSON.parse(await readFile('app/zh-hant/page-data.json', 'utf8')).menu;
const menu = await readFile('public/zh-hant/menu/index.html', 'utf8');
const graph = JSON.parse(menu.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
const sections = graph.find(item => item.hasPart)?.hasPart.hasMenuSection;
assert.deepEqual(sections.map(section => section.hasMenuItem.length), [7, 19, 10]);
for (const section of data.sections.filter(section => section.items)) {
  for (const [name, price] of section.items) {
    assert.ok(menu.includes(`<span>${name}</span><strong>${price}</strong>`));
  }
}
assert.match(menu, /同桌客人必須一起升級/);
assert.match(menu, /data-table-menu-notice/);
assert.doesNotMatch(menu, /\$3\.99/);
console.log('Compact home, poster links and 36 Chinese menu entries/schema passed.');
