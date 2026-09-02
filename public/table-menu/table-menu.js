(() => {
  "use strict";

  const root = document.querySelector("[data-table-menu-root]");
  if (!root) return;

  const state = {
    language: "en",
    category: "featured",
    query: "",
  };

  const languageButtons = [...root.querySelectorAll("[data-table-menu-language]")];
  const categoryButtons = [...root.querySelectorAll("[data-table-menu-category]")];
  const cards = [...root.querySelectorAll("[data-featured-card], [data-item-card]")];
  const searchInput = root.querySelector("[data-table-menu-search]");
  const results = root.querySelector("[data-table-menu-results]");
  const featuredSection = root.querySelector("[data-section='featured']");
  const itemsSection = root.querySelector("[data-section='items']");
  const dialog = root.querySelector("[data-table-menu-dialog]");
  const dialogClose = root.querySelector("[data-table-menu-dialog-close]");
  let lastTrigger = null;
  let searchAnalyticsTimer = 0;

  function localized(dataset, key) {
    const suffix = state.language === "zh" ? "Zh" : "En";
    return dataset[`${key}${suffix}`] ?? "";
  }

  function updateDialogLanguage() {
    if (!dialog?.open || !lastTrigger) return;
    const name = localized(lastTrigger.dataset, "name");
    const description = localized(lastTrigger.dataset, "description");
    const serving = localized(lastTrigger.dataset, "serving");
    dialog.querySelector("[data-dialog-name]").textContent = name;
    dialog.querySelector("[data-dialog-description]").textContent = description;
    dialog.querySelector("[data-dialog-serving]").textContent = serving;
    const image = dialog.querySelector("[data-dialog-image]");
    image.alt = name;
  }

  function setLanguage(language) {
    if (!['en', 'zh'].includes(language)) return;
    state.language = language;
    document.documentElement.lang = language === "zh" ? "zh-Hant" : "en-CA";

    root.querySelectorAll("[data-en][data-zh]").forEach((element) => {
      element.textContent = language === "zh" ? element.dataset.zh : element.dataset.en;
    });

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.tableMenuLanguage === language));
    });

    if (searchInput) {
      searchInput.placeholder = language === "zh"
        ? searchInput.dataset.placeholderZh
        : searchInput.dataset.placeholderEn;
      searchInput.setAttribute("aria-label", searchInput.placeholder);
    }

    cards.forEach((card) => {
      const image = card.querySelector("img");
      if (image) image.alt = localized(card.dataset, "name");
    });

    updateDialogLanguage();
    renderVisibility();
    window.gtag?.("event", "table_menu_language", { language });
  }

  function setCategory(category) {
    if (!categoryButtons.some((button) => button.dataset.tableMenuCategory === category)) return;
    state.category = category;
    state.query = "";
    if (searchInput) searchInput.value = "";
    categoryButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.tableMenuCategory === category));
    });
    renderVisibility();
    window.gtag?.("event", "table_menu_category", { category });
  }

  function setQuery(query) {
    state.query = query.trim().toLocaleLowerCase();
    renderVisibility();
    window.clearTimeout(searchAnalyticsTimer);
    searchAnalyticsTimer = window.setTimeout(() => {
      window.gtag?.("event", "table_menu_search", { query_length: state.query.length });
    }, 400);
  }

  function renderVisibility() {
    let featuredVisible = 0;
    let itemsVisible = 0;
    const searching = state.query.length > 0;

    cards.forEach((card) => {
      const isFeatured = card.hasAttribute("data-featured-card");
      const matchesQuery = (card.dataset.search ?? "").toLocaleLowerCase().includes(state.query);
      const matchesCategory = isFeatured
        ? state.category === "featured"
        : card.dataset.category === state.category;
      const visible = searching ? matchesQuery : matchesCategory;
      card.hidden = !visible;
      if (visible && isFeatured) featuredVisible += 1;
      if (visible && !isFeatured) itemsVisible += 1;
    });

    if (featuredSection) featuredSection.hidden = featuredVisible === 0;
    if (itemsSection) itemsSection.hidden = itemsVisible === 0;

    const count = featuredVisible + itemsVisible;
    if (results) {
      if (searching) {
        results.textContent = state.language === "zh"
          ? `找到 ${count} 項結果`
          : `${count} result${count === 1 ? "" : "s"}`;
      } else if (count === 0) {
        results.textContent = state.language === "zh" ? "此分類暫無菜品" : "No items in this category";
      } else {
        results.textContent = "";
      }
    }
  }

  function openItem(itemId) {
    const card = cards.find((entry) => entry.dataset.itemId === itemId);
    if (!card || !dialog) return;
    lastTrigger = card;

    const name = localized(card.dataset, "name");
    const image = dialog.querySelector("[data-dialog-image]");
    image.src = card.dataset.imageLarge;
    image.alt = name;
    dialog.querySelector("[data-dialog-name]").textContent = name;
    dialog.querySelector("[data-dialog-description]").textContent = localized(card.dataset, "description");
    dialog.querySelector("[data-dialog-serving]").textContent = localized(card.dataset, "serving");
    dialog.querySelector("[data-dialog-price]").textContent = card.dataset.price ? `$${card.dataset.price}` : "";
    dialog.querySelector("[data-dialog-tags]").textContent = card.dataset.tags ?? "";
    dialog.showModal();
    window.gtag?.("event", "table_menu_item_open", { item_id: itemId });
  }

  function closeItem() {
    if (dialog?.open) dialog.close();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.tableMenuLanguage));
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => setCategory(button.dataset.tableMenuCategory));
  });

  searchInput?.addEventListener("input", (event) => setQuery(event.currentTarget.value));
  cards.forEach((card) => card.addEventListener("click", () => openItem(card.dataset.itemId)));
  dialogClose?.addEventListener("click", closeItem);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeItem();
  });
  dialog?.addEventListener("close", () => {
    lastTrigger?.focus();
  });

  setLanguage("en");
  setCategory("featured");
})();
