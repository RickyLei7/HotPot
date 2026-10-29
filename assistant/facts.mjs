export const TOPICS = ['menu', 'prices', 'booking', 'hours', 'directions', 'dietary', 'other'];
export const BOOKING_URL = 'https://reservation.centrestjhotpot.ca/book';
export const FACT_IDS = ['ayce', 'snacks', 'personal', 'combos', 'soups', 'kids', 'rice_noodles', 'appetizers', 'drinks', 'addons', 'hours', 'location', 'booking', 'dietary', 'staff'];

export function menuPrices(schema) {
  const items = schema.hasMenuSection.flatMap(section => section.hasMenuItem);
  const cents = name => {
    const item = items.find(item => item.name === name);
    const amount = Number(item?.offers?.price);
    if (!Number.isFinite(amount) || amount <= 0 || item.offers.priceCurrency !== 'CAD') throw new Error(`Missing CAD menu price: ${name}`);
    return Math.round(amount * 100);
  };
  const children = items.find(item => item.name === 'Kids Pricing by Height')?.description;
  const childPrice = children?.match(/100-140 cm \$(\d+\.\d{2})/);
  if (!childPrice || !children.includes('Under 100 cm free') || !children.includes('Over 140 cm adult price')) throw new Error('Review children’s pricing and height bands.');
  return { ayce: cents('All-You-Can-Eat Hot Pot'), snacks: cents('All-You-Can-Eat Snacks Upgrade'), personal: cents('Personal Hot Pot'), solo: cents('Solo Hot Pot Combo'), couple: cents('Couple Hot Pot Combo'), kids: Math.round(Number(childPrice[1]) * 100) };
}

export function buildFacts(prices, soups, hours, address) {
  const money = cents => `$${(cents / 100).toFixed(2)}`;
  const [a, s, p, solo, couple] = ['ayce', 'snacks', 'personal', 'solo', 'couple'].map(id => money(prices[id]));
  const fact = (en, zh, path) => ({ en, zh, path });
  return {
    ayce: fact(`AYCE hot pot is ${a} per adult before tax, with a soup base included. Choose AAA beef, lamb, pork or chicken; order meat through your server. Each guest has an individual pot.`, `火鍋自助每位成人 ${a}，另加稅，已含湯底。一人一鍋，牛、羊、豬及雞肉可向店員加點。`, '/ayce-hot-pot-calgary/'),
    snacks: fact(`Add 19 all-you-can-eat snacks to AYCE for ${s} per person before tax. Everyone at the same table must take the snack upgrade.`, `火鍋自助每位加 ${s}，另加稅，可享19款小吃任食；同桌須一起升級。`, '/menu/'),
    personal: fact(`The ${p} personal hot pot includes 1 soup base, a large vegetable set, 1 meat and 1 rice or noodle side. Price is before tax.`, `個人火鍋 ${p}，另加稅，包含1份湯底、大份蔬菜盤、1份肉類及1份飯或麵。`, '/menu/'),
    combos: fact(`Solo Combo: 1 personal hot pot and 1 drink for ${solo}. Couple Combo: 2 personal hot pots, 2 drinks and 1 appetizer for ${couple}. Prices are before tax.`, `單人套餐 ${solo}，包含1份個人火鍋及1杯飲品。雙人套餐 ${couple}，包含2份個人火鍋、2杯飲品及1份小吃。價格另加稅。`, '/menu/'),
    soups: fact(`Choose from ${soups.length} soup bases: ${soups.join(', ')}. For ingredient or dietary questions, please check with staff.`, `共有${soups.length}款湯底可選，包括壽喜燒、冬陰功、麻辣、番茄及味噌。完整選項請看菜單；食材或飲食限制請先向店員確認。`, '/menu/#soup-bases'),
    kids: fact(`AYCE children’s prices are based on height: under 100 cm free; 100–140 cm ${money(prices.kids)}; over 140 cm adult price. Prices are before tax.`, `火鍋自助兒童收費按身高：100厘米以下免費；100至140厘米 ${money(prices.kids)}；超過140厘米按成人收費。價格另加稅。`, '/ayce-hot-pot-calgary/'),
    hours: fact(hours.en, hours.zh, '/contact/'),
    location: fact(`${address}. Call (403) 455-3188 for restaurant questions.`, `${address}。餐廳查詢請致電 (403) 455-3188。`, '/contact/'),
    booking: fact('Use Book Online to choose your date, party size and available time. This assistant cannot check live tables or make a reservation. A pending request still needs restaurant approval; only the booking system can show a confirmed reservation. For large groups or urgent changes, call (403) 455-3188.', '請按「網上訂位」選擇日期、人數及可用時段。本助手不能查詢即時空位或代為訂位。待確認申請仍需餐廳批准；請以訂位系統的確認結果為準。大型聚餐或緊急更改請致電 (403) 455-3188。', BOOKING_URL),
    dietary: fact('Please ask restaurant staff about allergies, ingredients, vegetarian options or other dietary needs before ordering. This assistant cannot verify allergen safety, cross-contact, halal status or special preparation. Call (403) 455-3188.', '過敏、食材、素食或其他飲食要求，請於點餐前向店員確認。本助手不能保證過敏原安全、無交叉接觸、清真認證或特殊烹調安排。請致電 (403) 455-3188。', '/contact/'),
    staff: fact('I can help with the published menu, prices, location, hours and booking steps. For anything else, please call the restaurant at (403) 455-3188.', '我可以協助查閱菜單、價格、地址、營業時間及訂位步驟。其他問題請致電餐廳 (403) 455-3188。', '/contact/')
  };
}

export function explicitAdults(question) {
  if (/\d+\s*(?:or|to|[-–]|或|至|到)\s*\d+/i.test(question)) return null;
  if (/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:or|to|and)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(question)) return null;
  const counts = [...question.matchAll(/(?<![\d.\-])([1-9]|1\d|20)\s*(?:adults?\b|people\b|persons?\b|guests?\b|位成人|個成人|个成人|位大人|個大人|个大人|人|位)/gi)].map(m => Number(m[1]));
  const english = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  for (const match of question.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:adults?|people|persons?|guests?)\b/gi)) {
    counts.push(english.indexOf(match[1].toLowerCase()) + 1);
  }
  for (const match of question.matchAll(/(?<![一二兩两三四五六七八九十百千萬万零〇])([一二兩两三四五六七八九十])\s*(?:位成人|個成人|个成人|位大人|個大人|个大人|人|位)/g)) {
    counts.push(({一:1,二:2,兩:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10})[match[1]]);
  }
  return counts.length === 1 ? counts[0] : null;
}

export function renderAnswer(selection, knowledge, question) {
  const language = selection.language === 'zh-Hant' ? 'zh-Hant' : 'en';
  const lang = language === 'en' ? 'en' : 'zh';
  const ids = selection.factIds.length ? [...new Set(selection.factIds)] : ['staff'];
  const parts = ids.map(id => ({ id, text: knowledge.facts[id][lang], href: localize(knowledge.facts[id].path, language) }));
  const adults = explicitAdults(question);
  const plan = selection.pricePlan;
  const planNamed = plan === 'personal'
    ? /personal|個人|个人/i.test(question)
    : /AYCE|all.you.can.eat|自助|任食/i.test(question) && (plan !== 'ayce_snacks' || /snacks?|appetizers?|小吃/i.test(question));
  const price = plan === 'ayce_snacks' ? knowledge.prices.ayce + knowledge.prices.snacks : knowledge.prices[plan];
  // Only quote an explicit adult count and a plan selected from approved menu rates.
  if (adults && adults === selection.adultCount && planNamed && ['ayce', 'ayce_snacks', 'personal'].includes(plan) && !/child|kid|baby|toddler|小孩|兒童|儿童|孩子|小朋友|小童|嬰兒|婴儿|幼兒|幼儿/i.test(question)) {
    const total = `$${(adults * price / 100).toFixed(2)}`;
    const label = lang === 'en' ? {ayce:'AYCE',ayce_snacks:'AYCE with snacks',personal:'personal hot pot'}[plan] : {ayce:'火鍋自助',ayce_snacks:'火鍋自助加小吃',personal:'個人火鍋'}[plan];
    parts.push({ id: 'estimate', text: lang === 'en' ? `For ${adults} adults, ${label} totals ${total} CAD before tax and tip, excluding drinks and other add-ons.` : `${adults}位成人${label}合計 ${total} 加元，未計稅、小費、飲品及其他加點。`, href: localize('/menu/', language) });
  }
  return { language, topic: selection.topic, parts };
}

export function localize(path, language) {
  if (path.startsWith('https://')) return path;
  return `${language === 'zh-Hant' ? '/zh-hant' : ''}${path}`;
}
