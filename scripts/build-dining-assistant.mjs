import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildFacts, menuPrices} from '../assistant/facts.mjs';

export async function generateKnowledge() {
  const html = await readFile(new URL('../public/menu/index.html', import.meta.url), 'utf8');
  const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'Menu');
  const prices = menuPrices(schema);
  const soups = schema.hasMenuSection.find(s => s.name === 'Hot Pot Soup Bases').hasMenuItem.map(i => i.name);
  const contact = await readFile(new URL('../public/contact/index.html', import.meta.url), 'utf8');
  const restaurant = [...contact.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'Restaurant');
  assert.deepEqual(restaurant?.openingHoursSpecification, [
    {'@type':'OpeningHoursSpecification', dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'], opens:'17:00', closes:'22:30'},
    {'@type':'OpeningHoursSpecification', dayOfWeek:['Saturday','Sunday'], opens:'12:00', closes:'22:30'}
  ], 'Restaurant hours changed: review the bilingual assistant copy.');
  assert.deepEqual(restaurant?.address, {'@type':'PostalAddress', streetAddress:'2213 Centre St N #2243', addressLocality:'Calgary', addressRegion:'AB', postalCode:'T2E 2T4', addressCountry:'CA'}, 'Restaurant address changed: review assistant copy.');
  assert.equal(restaurant?.telephone, '+1-403-455-3188', 'Restaurant phone changed: review assistant copy.');
  const hours = {en:'Monday–Friday: 5:00–10:30 PM. Saturday–Sunday: noon–10:30 PM. All times are Calgary local time. For holiday changes, please check with the restaurant.', zh:'週一至週五：下午5時至晚上10時30分。週六、週日：中午12時至晚上10時30分。均為卡加利當地時間；假期安排請向餐廳確認。'};
  const facts = buildFacts(prices, soups, hours, '2213 Centre St N #2243, Calgary, AB T2E 2T4');
  const translations = {
    'Signature Taiwanese Beef Noodle Soup':'招牌台灣牛肉麵', 'Braised Pork Rice':'滷肉飯',
    'Taiwanese Fried Chicken Or Cutlet Rice / Noodle':'台式炸雞或雞排飯／麵', 'Wonton Soup with Rice / Noodle':'雲吞湯配飯／麵',
    'Unagi Rice Bowl':'鰻魚飯', 'Beef Brisket Rice':'牛腩飯', 'Sukiyaki Beef Rice':'壽喜燒牛肉飯',
    'Signature Taiwanese Fried Chicken':'招牌台式炸雞', 'Takoyaki (6pcs)':'章魚燒', 'Crispy Chicken Cutlet':'香脆雞排',
    'Golden Fried Buns':'黃金炸饅頭', 'Crispy Squid Legs':'酥炸魷魚鬚', 'Popcorn Chicken':'鹽酥雞',
    'Golden Onion Rings':'黃金洋蔥圈', 'Edamame':'毛豆', 'Classic Teas':'經典茶飲', 'Milk Teas':'奶茶',
    'Sea Salt Cream':'海鹽奶蓋', 'Smoothies':'冰沙', 'Specialty Sodas':'特調汽水', 'Soft Drinks':'汽水',
    'Split Pot Upgrade':'鴛鴦鍋升級', 'Extra Meat':'加肉', 'Extra Rice or Noodle Side':'加飯或麵'
  };
  for (const [id, sectionName, path, title, zhTitle] of [
    ['rice_noodles', 'Rice and Noodles', '/menu/#rice-noodles', 'Rice and noodles', '飯麵類'],
    ['appetizers', 'Appetizers', '/menu/#appetizers', 'Selected à la carte snacks', '部分單點小吃'],
    ['drinks', 'Drinks', '/menu/#drinks', 'Drink categories', '飲品類別'],
    ['addons', 'Hot Pot Set', '/menu/#hotpot-set', 'Personal hot pot add-ons', '個人火鍋加點']
  ]) {
    const items = schema.hasMenuSection.find(s => s.name === sectionName).hasMenuItem.filter(i => id !== 'addons' || i.name !== 'Personal Hot Pot');
    for (const item of items) {
      if (!translations[item.name] || !Number.isFinite(Number(item.offers?.price)) || Number(item.offers.price) <= 0 || item.offers.priceCurrency !== 'CAD') throw new Error(`Review menu item: ${item.name}`);
    }
    const list = lang => items.map(item => `${lang === 'en' ? item.name : translations[item.name]} $${Number(item.offers.price).toFixed(2)}`).join('; ');
    facts[id] = {
      en:`${title}: ${list('en')}. Prices in CAD. See the menu for all options; order through your server.`,
      zh:`${zhTitle}：${list('zh')}。價格為加元。完整選項請看菜單；點餐請向店員提出。`, path
    };
  }
  const result = {prices, facts};
  return {version:createHash('sha256').update(JSON.stringify(result)).digest('hex').slice(0,16), ...result};
}

const knowledge = await generateKnowledge();
const target = new URL('../assistant/knowledge.json', import.meta.url);
const generated = `${JSON.stringify(knowledge,null,2)}\n`;
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== generated) throw new Error('Assistant knowledge drift: run npm run build:assistant and review menu facts.');
  console.log('Assistant knowledge matches the published menu and reviewed contact facts.');
} else {
  await writeFile(target, generated);
  console.log(`Generated assistant knowledge ${knowledge.version}.`);
}
