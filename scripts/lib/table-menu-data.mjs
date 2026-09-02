const IMAGE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBilingualRecord(record, languages, label) {
  if (!isObject(record)) {
    fail(`${label} must be an object`);
  }

  const keys = Object.keys(record).sort();
  const expectedKeys = [...languages].sort();
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    fail(`${label} must use exactly these languages: ${languages.join(", ")}`);
  }

  for (const language of languages) {
    if (typeof record[language] !== "string") {
      fail(`${label} is missing ${language}`);
    }
  }
}

function allMenuItems(menu) {
  return menu.items.flatMap((item) => (
    item.variants?.length
      ? [item, ...item.variants.map((variant) => ({ ...item, ...variant, parentId: item.id }))]
      : [item]
  ));
}

function validateItem(item, categoryIds, languages, label) {
  if (!item.id || typeof item.id !== "string") {
    fail(`${label} is missing id`);
  }

  if (!item.categoryId || typeof item.categoryId !== "string") {
    fail(`${label} is missing categoryId`);
  }

  if (!categoryIds.has(item.categoryId)) {
    fail(`Unknown category id: ${item.categoryId}`);
  }

  validateBilingualRecord(item.name, languages, `${label} name`);
  if (!item.name.en.trim()) {
    fail(`Missing English name for ${item.id}`);
  }
  if (!item.name.zh.trim()) {
    fail(`Missing Chinese name for ${item.id}`);
  }

  validateBilingualRecord(item.description, languages, `${label} description`);
  validateBilingualRecord(item.serving, languages, `${label} serving`);

  if (typeof item.available !== "boolean") {
    fail(`${label} available must be a boolean`);
  }

  if (typeof item.imageId !== "string" || !item.imageId.trim()) {
    fail(`Missing imageId for ${item.id}`);
  }

  if (!IMAGE_ID_PATTERN.test(item.imageId)) {
    fail(`Invalid imageId for ${item.id}: ${item.imageId}`);
  }

  const priceRequired = item.priceRequired !== false;
  if (priceRequired && (typeof item.price !== "string" || !item.price.trim())) {
    fail(`Missing required price for ${item.id}`);
  }

  if (item.price !== undefined && typeof item.price !== "string") {
    fail(`${label} price must be a string`);
  }
}

export function flattenMenuItems(menu) {
  return menu.items.flatMap((item) => item.variants?.length
    ? item.variants.map((variant) => ({ ...item, ...variant, parentId: item.id }))
    : [item]);
}

export function imagePathsFor(item) {
  return {
    small: `/assets/table-menu/${item.imageId}-320.webp`,
    large: `/assets/table-menu/${item.imageId}-640.webp`,
  };
}

export function getItemById(menu, id) {
  const match = allMenuItems(menu).find((item) => item.id === id);
  if (!match) {
    fail(`Unknown table-menu item: ${id}`);
  }
  return match;
}

export function validateMenu(menu) {
  if (!isObject(menu)) {
    fail("menu must be an object");
  }

  if (!Array.isArray(menu.languages) || !menu.languages.includes("en") || !menu.languages.includes("zh")) {
    fail("languages must include en and zh");
  }

  if (menu.defaultLanguage !== "en") {
    fail("defaultLanguage must be en");
  }

  validateBilingualRecord(menu.notices?.order, menu.languages, "notices.order");
  validateBilingualRecord(menu.notices?.images, menu.languages, "notices.images");

  if (!Array.isArray(menu.categories)) {
    fail("categories must be an array");
  }

  if (!Array.isArray(menu.items)) {
    fail("items must be an array");
  }

  const categoryIds = new Set();
  for (const category of menu.categories) {
    if (!category.id || typeof category.id !== "string") {
      fail("category is missing id");
    }
    if (categoryIds.has(category.id)) {
      fail(`Duplicate table-menu category id: ${category.id}`);
    }
    categoryIds.add(category.id);
    validateBilingualRecord(category.name, menu.languages, `category ${category.id} name`);
    if (!category.name.en.trim()) {
      fail(`Missing English name for category ${category.id}`);
    }
    if (!category.name.zh.trim()) {
      fail(`Missing Chinese name for category ${category.id}`);
    }
  }

  const itemIds = new Set();
  for (const item of allMenuItems(menu)) {
    if (itemIds.has(item.id)) {
      fail(`Duplicate table-menu item id: ${item.id}`);
    }
    itemIds.add(item.id);
    validateItem(item, categoryIds, menu.languages, `item ${item.id}`);
  }

  if (!Array.isArray(menu.featuredOrder)) {
    fail("featuredOrder must be an array");
  }

  for (const featuredId of menu.featuredOrder) {
    if (!itemIds.has(featuredId)) {
      fail(`Unknown featured item id: ${featuredId}`);
    }
  }
}
