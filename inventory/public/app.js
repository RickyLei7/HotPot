const state = { items: [], filter: "active", lastCreatedOrder: null };

const loginView = document.querySelector("#login-view");
const appView = document.querySelector("#app-view");
const itemList = document.querySelector("#item-list");
const itemDialog = document.querySelector("#item-editor");
const itemForm = document.querySelector("#item-form");
const historyDialog = document.querySelector("#history-dialog");
const historyList = document.querySelector("#history-list");
const statusRegion = document.querySelector("#status");
const undoBar = document.querySelector("#undo-bar");
let statusTimer;
let announcementId = 0;
let historyRequestId = 0;

function announce(message) {
  const id = ++announcementId;
  clearTimeout(statusTimer);
  statusRegion.textContent = "";
  requestAnimationFrame(() => {
    if (id !== announcementId) return;
    statusRegion.textContent = message;
    statusTimer = setTimeout(() => {
      if (id === announcementId) statusRegion.textContent = "";
    }, 4_000);
  });
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "请求失败，请重试");
    error.status = response.status;
    error.code = body.code;
    if (response.status === 401 && path !== "/api/login") setAuthenticated(false);
    throw error;
  }
  return body.data;
}

function setAuthenticated(authenticated) {
  loginView.hidden = authenticated;
  appView.hidden = !authenticated;
  if (!authenticated) document.querySelector("#pin").focus();
}

function localDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function readableDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "UTC", year: "numeric", month: "short", day: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, className, action) {
  const node = element("button", className, text);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function itemPayload(item, overrides = {}) {
  return {
    name: item.name,
    manualIntervalDays: item.manualIntervalDays,
    notes: item.notes || "",
    active: item.active,
    ...overrides,
  };
}

function statusText(item) {
  if (item.status === "overdue") return `已超过 ${Math.abs(item.daysUntilDue)} 天`;
  if (item.status === "today") return "今天检查";
  if (item.status === "learning") return "学习中";
  return `还有 ${item.daysUntilDue} 天`;
}

async function refreshItems() {
  state.items = await api("/api/items");
  setAuthenticated(true);
  renderItems(state.items);
}

async function withDisabled(control, work) {
  control.disabled = true;
  try { return await work(); } finally { control.disabled = false; }
}

function showUndo(itemId, orderId, itemName) {
  if (state.lastCreatedOrder?.timer) clearTimeout(state.lastCreatedOrder.timer);
  document.querySelector("#undo-message").textContent = `已记录「${itemName}」今天叫货`;
  undoBar.hidden = false;
  const timer = setTimeout(() => {
    undoBar.hidden = true;
    state.lastCreatedOrder = null;
  }, 10_000);
  state.lastCreatedOrder = { itemId, orderId, timer };
}

async function createOrder(item, date, control) {
  return withDisabled(control, async () => {
    try {
      const result = await api(`/api/items/${item.id}/orders`, {
        method: "POST", body: JSON.stringify({ date }),
      });
      showUndo(item.id, result.id, item.name);
      announce(`已记录 ${item.name} 的叫货日期`);
      try {
        await refreshItems();
      } catch (refreshError) {
        announce(`叫货已记录，但清单刷新失败：${refreshError.message}`);
      }
      return true;
    } catch (error) {
      announce(error.status === 409 ? "这个日期已经有叫货记录" : `记录失败：${error.message}`);
      return false;
    }
  });
}

function renderCard(item) {
  const card = element("article", "item-card");
  card.dataset.status = item.status;

  const heading = element("div", "card-heading");
  heading.append(element("h2", "item-name", item.name));
  if (!item.active) heading.append(element("span", "archive-label", "已归档"));
  card.append(heading);

  const body = element("div", "card-body");
  const metadata = element("div");
  metadata.append(element("p", "elapsed", item.daysSinceOrder === null ? "还没有叫货记录" : `已经 ${item.daysSinceOrder} 天`));
  metadata.append(element("p", "last-date", item.lastOrderDate ? `上次叫货：${readableDate(item.lastOrderDate)}` : "上次叫货：—"));
  metadata.append(element("span", `status-label ${item.status}`, statusText(item)));
  const intervals = [];
  if (item.manualIntervalDays !== null) intervals.push(`手动周期 ${item.manualIntervalDays} 天`);
  if (item.learnedIntervalDays !== null) intervals.push(`学习周期 ${item.learnedIntervalDays} 天`);
  if (intervals.length) metadata.append(element("p", "intervals", intervals.join(" · ")));
  if (item.notes) metadata.append(element("p", "notes", item.notes));
  body.append(metadata);

  const orderNow = button("今天已叫货", "order-now", (event) => createOrder(item, localDate(), event.currentTarget));
  orderNow.disabled = !item.active;
  if (!item.active) orderNow.title = "请先恢复货品";
  body.append(orderNow);
  card.append(body);

  if (item.suggestedIntervalDays !== null) {
    const suggestion = element("div", "suggestion");
    suggestion.append(element("p", "", `系统建议改为 ${item.suggestedIntervalDays} 天`));
    suggestion.append(button("采用建议", "", async (event) => {
      await withDisabled(event.currentTarget, async () => {
        try {
          await api(`/api/items/${item.id}`, { method: "PATCH", body: JSON.stringify(itemPayload(item, { manualIntervalDays: item.suggestedIntervalDays })) });
          await refreshItems();
          announce(`已采用 ${item.name} 的系统建议`);
        } catch (error) { announce(`更新失败：${error.message}`); }
      });
    }));
    card.append(suggestion);
  }

  const footer = element("div", "card-footer");
  const backdate = element("form", "backdate-form");
  backdate.hidden = true;
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.max = localDate();
  dateInput.required = true;
  dateInput.setAttribute("aria-label", `${item.name} 补录日期`);
  const backdateSave = button("保存日期", "", () => {});
  backdateSave.type = "submit";
  backdate.append(dateInput, backdateSave);
  backdate.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (await createOrder(item, dateInput.value, backdateSave)) backdate.hidden = true;
  });
  footer.append(backdate);

  const actions = element("div", "card-actions");
  const backdateButton = button("补录日期", "", () => {
    backdate.hidden = !backdate.hidden;
    if (!backdate.hidden) dateInput.focus();
  });
  backdateButton.disabled = !item.active;
  actions.append(backdateButton);
  actions.append(button("历史", "", () => showHistory(item.id)));
  actions.append(button(item.active ? "编辑" : "恢复", "", async (event) => {
    if (item.active) return openItemEditor(item);
    await withDisabled(event.currentTarget, async () => {
      try {
        await api(`/api/items/${item.id}`, { method: "PATCH", body: JSON.stringify(itemPayload(item, { active: true })) });
        await refreshItems();
        announce(`已恢复 ${item.name}`);
      } catch (error) { announce(`恢复失败：${error.message}`); }
    });
  }));
  footer.append(actions);
  card.append(footer);
  return card;
}

export function renderItems(items) {
  itemList.replaceChildren();
  const visible = items.filter((item) => state.filter === "all" || (state.filter === "active" ? item.active : !item.active));
  if (!visible.length) {
    itemList.append(element("p", "empty-state", state.filter === "active" ? "还没有使用中的货品。添加第一项吧。" : "这里还没有货品。"));
    return;
  }
  itemList.append(...visible.map(renderCard));
}

export function openItemEditor(item) {
  document.querySelector("#editor-title").textContent = item ? "编辑货品" : "添加货品";
  document.querySelector("#item-id").value = item?.id ?? "";
  document.querySelector("#item-name").value = item?.name ?? "";
  document.querySelector("#manual-interval").value = item?.manualIntervalDays ?? "";
  document.querySelector("#item-notes").value = item?.notes ?? "";
  document.querySelector("#item-active").checked = item?.active ?? true;
  document.querySelector("#active-row").hidden = !item;
  itemDialog.showModal();
  document.querySelector("#item-name").focus();
}

export async function showHistory(itemId) {
  const requestId = ++historyRequestId;
  const item = state.items.find((entry) => entry.id === itemId);
  document.querySelector("#history-title").textContent = `${item?.name ?? "货品"} · 历史`;
  historyList.replaceChildren(element("p", "", "正在读取…"));
  if (!historyDialog.open) historyDialog.showModal();
  try {
    const orders = await api(`/api/items/${itemId}/orders`);
    if (requestId !== historyRequestId) return;
    historyList.replaceChildren();
    if (!orders.length) {
      historyList.append(element("p", "empty-state", "还没有叫货记录。"));
      return;
    }
    for (const order of orders) {
      const row = element("div", "history-row");
      row.append(element("p", "history-date", readableDate(order.order_date)));
      const form = element("form", "correction-form");
      const input = document.createElement("input");
      input.type = "date";
      input.value = order.order_date;
      input.max = localDate();
      input.required = true;
      input.setAttribute("aria-label", `修改 ${readableDate(order.order_date)}`);
      const save = button("更正", "secondary", () => {});
      save.type = "submit";
      form.append(input, save);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (input.value === order.order_date) return announce("日期没有改变");
        if (!confirm(`确定把 ${order.order_date} 更正为 ${input.value}？原记录会先删除。`)) return;
        await withDisabled(save, async () => {
          try {
            await api(`/api/items/${itemId}/orders/${order.id}`, { method: "DELETE" });
            try {
              await api(`/api/items/${itemId}/orders`, { method: "POST", body: JSON.stringify({ date: input.value }) });
            } catch (insertError) {
              try {
                await api(`/api/items/${itemId}/orders`, { method: "POST", body: JSON.stringify({ date: order.order_date }) });
                announce(`更正失败，已恢复原日期：${insertError.message}`);
              } catch (restoreError) {
                announce(`更正失败，原日期也未能恢复：${restoreError.message}`);
              }
              return;
            }
            await refreshItems();
            await showHistory(itemId);
            announce("叫货日期已更正");
          } catch (error) { announce(`更正失败：${error.message}`); }
        });
      });
      row.append(form);
      historyList.append(row);
    }
  } catch (error) {
    if (requestId !== historyRequestId) return;
    historyList.replaceChildren(element("p", "empty-state", `读取失败：${error.message}`));
  }
}

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = event.currentTarget.querySelector("button[type=submit]");
  await withDisabled(submit, async () => {
    try {
      await api("/api/login", { method: "POST", body: JSON.stringify({ pin: document.querySelector("#pin").value }) });
      event.currentTarget.reset();
      await refreshItems();
      announce("登录成功");
    } catch (error) {
      announce(error.status === 429 ? "尝试次数过多，请稍后再试" : "密码不正确");
      document.querySelector("#pin").select();
    }
  });
});

itemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = itemForm.querySelector("button[type=submit]");
  await withDisabled(submit, async () => {
    const id = document.querySelector("#item-id").value;
    const intervalValue = document.querySelector("#manual-interval").value;
    const payload = {
      name: document.querySelector("#item-name").value,
      manualIntervalDays: intervalValue ? Number(intervalValue) : null,
      notes: document.querySelector("#item-notes").value,
      active: document.querySelector("#item-active").checked,
    };
    try {
      await api(id ? `/api/items/${id}` : "/api/items", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
      itemDialog.close();
      await refreshItems();
      announce(id ? "货品已更新" : "货品已添加");
    } catch (error) { announce(`保存失败：${error.message}`); }
  });
});

document.querySelector("#add-item").addEventListener("click", () => openItemEditor());
document.querySelector("#logout").addEventListener("click", async (event) => {
  await withDisabled(event.currentTarget, async () => {
    try {
      await api("/api/logout", { method: "POST" });
      state.items = [];
      setAuthenticated(false);
      announce("已退出");
    } catch (error) { announce(`退出失败：${error.message}`); }
  });
});

document.querySelectorAll("[data-filter]").forEach((control) => control.addEventListener("click", () => {
  state.filter = control.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button === control)));
  renderItems(state.items);
}));

document.querySelectorAll("[data-close]").forEach((control) => control.addEventListener("click", () => {
  document.querySelector(`#${control.dataset.close}`).close();
}));

historyDialog.addEventListener("close", () => { historyRequestId += 1; });

document.querySelector("#undo-order").addEventListener("click", async (event) => {
  const order = state.lastCreatedOrder;
  if (!order) return;
  await withDisabled(event.currentTarget, async () => {
    try {
      await api(`/api/items/${order.itemId}/orders/${order.orderId}`, { method: "DELETE" });
      clearTimeout(order.timer);
      state.lastCreatedOrder = null;
      undoBar.hidden = true;
      await refreshItems();
      announce("已撤销这次叫货记录");
    } catch (error) { announce(`撤销失败：${error.message}`); }
  });
});

refreshItems().catch((error) => {
  if (error.status === 401) setAuthenticated(false);
  else {
    setAuthenticated(false);
    announce(`读取失败：${error.message}`);
  }
});
