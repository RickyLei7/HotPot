import { flattenMenuItems, getItemById, imagePathsFor, validateMenu } from "./table-menu-data.mjs";

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function bilingualAttributes(value = { en: "", zh: "" }) {
  return `data-en="${escapeHtml(value.en)}" data-zh="${escapeHtml(value.zh)}"`;
}

function bilingualText(value = { en: "", zh: "" }, className, extra = "") {
  return `<span class="${className}" ${bilingualAttributes(value)} ${extra}>${escapeHtml(value.en)}</span>`;
}

function money(price) {
  return price ? `$${escapeHtml(price)}` : "";
}

function cardMarkup(item, { featured = false, featuredId = "" } = {}) {
  const paths = imagePathsFor(item);
  const search = `${item.name.en} ${item.name.zh} ${item.description?.en ?? ""} ${item.description?.zh ?? ""}`.toLocaleLowerCase();
  const tags = Array.isArray(item.tags) ? item.tags.join(" · ") : "";
  const classes = featured ? "tm-card tm-card--featured" : "tm-card tm-card--standard";
  const featuredAttrs = featured
    ? `data-featured-card data-featured-id="${escapeHtml(featuredId || item.id)}"`
    : "data-item-card";

  return `<button class="${classes}" type="button" ${featuredAttrs}
    data-item-id="${escapeHtml(item.id)}"
    data-category="${escapeHtml(item.categoryId)}"
    data-search="${escapeHtml(search)}"
    data-image-small="${escapeHtml(paths.small)}"
    data-image-large="${escapeHtml(paths.large)}"
    data-price="${escapeHtml(item.price ?? "")}"
    data-name-en="${escapeHtml(item.name.en)}" data-name-zh="${escapeHtml(item.name.zh)}"
    data-description-en="${escapeHtml(item.description?.en ?? "")}" data-description-zh="${escapeHtml(item.description?.zh ?? "")}"
    data-serving-en="${escapeHtml(item.serving?.en ?? "")}" data-serving-zh="${escapeHtml(item.serving?.zh ?? "")}"
    data-tags="${escapeHtml(tags)}">
    <img class="tm-card__image" src="${escapeHtml(paths.small)}" srcset="${escapeHtml(paths.small)} 320w, ${escapeHtml(paths.large)} 640w" sizes="${featured ? "(max-width: 720px) 100vw, 640px" : "(max-width: 359px) 100vw, 50vw"}" width="640" height="480" loading="${featured ? "eager" : "lazy"}" alt="${escapeHtml(item.name.en)}">
    <span class="tm-card__body">
      ${bilingualText(item.name, "tm-card__name")}
      ${item.description ? bilingualText(item.description, "tm-card__description") : ""}
      <span class="tm-card__meta">
        ${item.serving ? bilingualText(item.serving, "tm-card__serving") : "<span></span>"}
        <span class="tm-card__price">${money(item.price)}</span>
      </span>
    </span>
  </button>`;
}

export function renderTableMenuMarkup(menu) {
  validateMenu(menu);
  const activeLeaves = flattenMenuItems(menu).filter((item) => item.available);
  const standardItems = activeLeaves.filter((item) => item.categoryId !== "featured");
  const featured = menu.featuredOrder.map((id) => getItemById(menu, id));

  return `<main class="table-menu" data-table-menu-root>
    <header class="tm-header">
      <div class="tm-header__brand">
        <p class="tm-header__eyebrow">CENTRE ST J HOTPOT</p>
        <h1 ${bilingualAttributes({ en: "Table Menu", zh: "手機菜單" })}>Table Menu</h1>
      </div>
      <div class="tm-language" role="group" aria-label="Language">
        <button type="button" data-table-menu-language="en" aria-pressed="true">EN</button>
        <button type="button" data-table-menu-language="zh" aria-pressed="false">繁中</button>
      </div>
    </header>

    <p class="tm-order-notice" ${bilingualAttributes(menu.notices.order)}>${escapeHtml(menu.notices.order.en)}</p>

    <section class="tm-tools" aria-label="Menu controls">
      <label class="tm-search">
        ${bilingualText({ en: "Search the menu", zh: "搜尋菜單" }, "tm-visually-hidden")}
        <input type="search" data-table-menu-search data-placeholder-en="Search dishes and drinks" data-placeholder-zh="搜尋菜品和飲品" placeholder="Search dishes and drinks" autocomplete="off">
      </label>
      <nav class="tm-categories" aria-label="Menu categories">
        ${menu.categories.map((category, index) => `<button type="button" data-table-menu-category="${escapeHtml(category.id)}" aria-pressed="${index === 0 ? "true" : "false"}" ${bilingualAttributes(category.name)}>${escapeHtml(category.name.en)}</button>`).join("")}
      </nav>
    </section>

    <p class="tm-results" data-table-menu-results aria-live="polite"></p>

    <section class="tm-section tm-section--featured" data-section="featured">
      <div class="tm-section__heading">
        <p ${bilingualAttributes({ en: "Start here", zh: "從這裡開始" })}>Start here</p>
        <h2 ${bilingualAttributes({ en: "Featured menus", zh: "精選菜單" })}>Featured menus</h2>
      </div>
      <div class="tm-featured-grid">${featured.map((item) => cardMarkup(item, { featured: true, featuredId: item.id })).join("")}</div>
    </section>

    <section class="tm-section tm-section--items" data-section="items" hidden>
      <div class="tm-item-grid">${standardItems.map((item) => cardMarkup(item)).join("")}</div>
    </section>

    <footer class="tm-footer">
      <p ${bilingualAttributes(menu.notices.order)}>${escapeHtml(menu.notices.order.en)}</p>
      <p ${bilingualAttributes(menu.notices.images)}>${escapeHtml(menu.notices.images.en)}</p>
    </footer>

    <dialog class="tm-dialog" data-table-menu-dialog aria-labelledby="tm-dialog-title">
      <button class="tm-dialog__close" type="button" data-table-menu-dialog-close aria-label="Close">×</button>
      <img data-dialog-image src="/assets/table-menu/ayce-individual-640.webp" width="640" height="480" alt="All You Can Eat Hot Pot">
      <div class="tm-dialog__body">
        <h2 id="tm-dialog-title" data-dialog-name ${bilingualAttributes({ en: "Item details", zh: "菜品詳情" })}>Item details</h2>
        <p data-dialog-description></p>
        <p class="tm-dialog__meta"><span data-dialog-serving></span><strong data-dialog-price></strong></p>
        <p class="tm-dialog__tags" data-dialog-tags></p>
        <p class="tm-dialog__notice" ${bilingualAttributes(menu.notices.order)}>${escapeHtml(menu.notices.order.en)}</p>
      </div>
    </dialog>

    <div class="tm-bottom-notice" ${bilingualAttributes(menu.notices.order)}>${escapeHtml(menu.notices.order.en)}</div>
  </main>`;
}

export function renderTableMenuJsonLd(menu, canonicalUrl) {
  validateMenu(menu);
  const sections = menu.categories
    .filter((category) => category.id !== "featured")
    .map((category) => ({
      "@type": "MenuSection",
      name: category.name.en,
      hasMenuItem: flattenMenuItems(menu)
        .filter((item) => item.available && item.categoryId === category.id)
        .map((item) => ({
          "@type": "MenuItem",
          name: item.name.en,
          description: item.description?.en,
          image: new URL(imagePathsFor(item).large, canonicalUrl).href,
          ...(item.price ? { offers: { "@type": "Offer", price: item.price, priceCurrency: menu.currency } } : {}),
        })),
    }))
    .filter((section) => section.hasMenuItem.length > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Centre Street Japanese HotPot Table Menu",
    url: canonicalUrl,
    inLanguage: ["en-CA", "zh-Hant"],
    hasMenuSection: sections,
  };
}
