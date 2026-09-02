import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  flattenMenuItems,
  getItemById,
  imagePathsFor,
  validateMenu,
} from "../scripts/lib/table-menu-data.mjs";

const menu = JSON.parse(await readFile(new URL(
  "../content/table-menu/menu.json",
  import.meta.url,
), "utf8"));

test("menu source is valid", () => {
  assert.doesNotThrow(() => validateMenu(menu));
});

test("featured promotions have the approved order", () => {
  assert.deepEqual(menu.featuredOrder, [
    "ayce-individual",
    "ayce-for-two",
    "personal-hot-pot",
    "solo-couple-combo",
    "beer-special",
  ]);
});

test("latest high-risk prices and quantities are locked", () => {
  assert.equal(getItemById(menu, "ayce-individual").price, "28.99");
  assert.equal(getItemById(menu, "ayce-snack-upgrade").price, "5.99");
  assert.equal(getItemById(menu, "ayce-child-100-140").price, "12.99");
  assert.equal(getItemById(menu, "personal-hot-pot").price, "19.99");
  assert.equal(getItemById(menu, "solo-hot-pot-combo").price, "24.99");
  assert.equal(getItemById(menu, "couple-hot-pot-combo").price, "58.99");
  assert.equal(getItemById(menu, "veggie-spring-rolls").serving.en, "5 pcs");
  assert.equal(getItemById(menu, "veggie-spring-rolls").price, "8.89");
});

test("every active item has bilingual copy and image derivatives", () => {
  for (const item of flattenMenuItems(menu).filter((entry) => entry.available)) {
    assert.ok(item.name.en.trim(), `${item.id} missing English name`);
    assert.ok(item.name.zh.trim(), `${item.id} missing Chinese name`);
    assert.match(item.imageId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    assert.deepEqual(imagePathsFor(item), {
      small: `/assets/table-menu/${item.imageId}-320.webp`,
      large: `/assets/table-menu/${item.imageId}-640.webp`,
    });
  }
});

test("view-only bilingual notices are exact", () => {
  assert.equal(menu.notices.order.en, "View-only menu — please order with your server.");
  assert.equal(menu.notices.order.zh, "此菜單僅供瀏覽，請向服務員點單。");
});

test("getItemById throws the approved error for unknown ids", () => {
  assert.throws(
    () => getItemById(menu, "missing-item"),
    /^Error: Unknown table-menu item: missing-item$/u,
  );
});

test("validateMenu rejects the required data-shape failures", () => {
  const scenarios = [
    {
      label: "duplicate item ids",
      draft: {
        ...menu,
        items: [
          { ...menu.items[0] },
          { ...menu.items[0] },
        ],
      },
      pattern: /Duplicate table-menu item id:/u,
    },
    {
      label: "duplicate category ids",
      draft: {
        ...menu,
        categories: [
          { ...menu.categories[0] },
          { ...menu.categories[0] },
        ],
      },
      pattern: /Duplicate table-menu category id:/u,
    },
    {
      label: "missing bilingual name",
      draft: {
        ...menu,
        items: [
          {
            ...menu.items[0],
            name: { en: "", zh: menu.items[0].name.zh },
          },
        ],
      },
      pattern: /Missing English name/u,
    },
    {
      label: "missing required price",
      draft: {
        ...menu,
        items: [
          {
            ...menu.items[0],
            priceRequired: true,
            price: "",
          },
        ],
      },
      pattern: /Missing required price/u,
    },
    {
      label: "unknown featured id",
      draft: {
        ...menu,
        featuredOrder: ["missing-item"],
      },
      pattern: /Unknown featured item id:/u,
    },
    {
      label: "unknown category reference",
      draft: {
        ...menu,
        items: [
          {
            ...menu.items[0],
            categoryId: "missing-category",
          },
        ],
      },
      pattern: /Unknown category id:/u,
    },
    {
      label: "missing image id",
      draft: {
        ...menu,
        items: [
          {
            ...menu.items[0],
            imageId: "",
          },
        ],
      },
      pattern: /Missing imageId/u,
    },
    {
      label: "invalid image id",
      draft: {
        ...menu,
        items: [
          {
            ...menu.items[0],
            imageId: "Invalid Image",
          },
        ],
      },
      pattern: /Invalid imageId/u,
    },
    {
      label: "default language mismatch",
      draft: {
        ...menu,
        defaultLanguage: "zh",
      },
      pattern: /defaultLanguage must be en/u,
    },
    {
      label: "language mismatch",
      draft: {
        ...menu,
        languages: ["en"],
      },
      pattern: /languages must include en and zh/u,
    },
  ];

  for (const scenario of scenarios) {
    assert.throws(
      () => validateMenu(scenario.draft),
      scenario.pattern,
      scenario.label,
    );
  }
});

test("all zh copy uses Traditional Chinese in representative places", () => {
  const disallowedSimplifiedOnlyChars = new Set(["仅", "务", "浏", "览", "饮", "锅", "饭", "点", "气", "鱼", "汤", "价", "则", "并", "乐"]);
  const sharedChars = new Set(["菜", "單", "請", "員", "點", "飲", "湯", "魚"]);
  const zhStrings = [];

  const collect = (value) => {
    if (typeof value === "string") {
      zhStrings.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        collect(entry);
      }
      return;
    }
    if (value && typeof value === "object") {
      if (typeof value.zh === "string") {
        zhStrings.push(value.zh);
      }
      for (const entry of Object.values(value)) {
        if (entry !== value.zh) {
          collect(entry);
        }
      }
    }
  };

  collect(menu);

  for (const text of zhStrings) {
    for (const char of text) {
      assert.equal(
        disallowedSimplifiedOnlyChars.has(char) && !sharedChars.has(char),
        false,
        `simplified-only character ${char} found in: ${text}`,
      );
    }
  }

  assert.equal(getItemById(menu, "specialty-soda-yogurt").name.zh, "原味優格");
  assert.equal(getItemById(menu, "veggies-set").name.zh, "蔬菜盤");
});

test("add-ons are fully transcribed as individual leaves", () => {
  const addOns = flattenMenuItems(menu).filter((item) => item.categoryId === "add-ons");
  assert.deepEqual(
    addOns.map((item) => item.id),
    [
      "veggies-set",
      "shrimp-4pc",
      "tofu",
      "beef-ball",
    ],
  );
  assert.equal(getItemById(menu, "veggies-set").serving.zh, "1 份");
  assert.equal(getItemById(menu, "shrimp-4pc").serving.en, "4 pcs");
  assert.equal(getItemById(menu, "tofu").price, "3.00");
  assert.equal(getItemById(menu, "beef-ball").price, "3.00");
});
