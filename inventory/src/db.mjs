import { sortItemViews, toItemView } from "./domain.mjs";

function applicationError(message, code) {
  return Object.assign(new Error(message), { code });
}

function isUniqueConstraint(error) {
  return error?.code === "SQLITE_CONSTRAINT_UNIQUE" || /unique constraint/i.test(error?.message ?? "");
}

async function all(db, sql, ...values) {
  const result = await db.prepare(sql).bind(...values).all();
  return result.results ?? [];
}

export async function listItems(db, todayISO, activeOnly = false) {
  const items = await all(db, `
    SELECT id, name, manual_interval_days, notes, active
    FROM items
    ${activeOnly ? "WHERE active = 1" : ""}
  `);
  const orders = await all(db, "SELECT item_id, order_date FROM order_events ORDER BY order_date");
  const datesByItem = new Map();
  for (const { item_id: itemId, order_date: orderDate } of orders) {
    const dates = datesByItem.get(itemId) ?? [];
    dates.push(orderDate);
    datesByItem.set(itemId, dates);
  }
  return sortItemViews(items.map((item) => toItemView(item, datesByItem.get(item.id) ?? [], todayISO)));
}

export async function createItem(db, input) {
  try {
    const row = await db.prepare("INSERT INTO items (name, manual_interval_days, notes) VALUES (?, ?, ?) RETURNING id")
      .bind(input.name.trim(), input.manualIntervalDays, input.notes)
      .first();
    return row.id;
  } catch (error) {
    if (isUniqueConstraint(error)) throw applicationError("An item with that name already exists", "DUPLICATE");
    throw error;
  }
}

export async function updateItem(db, id, input) {
  try {
    const result = await db.prepare("UPDATE items SET name = ?, manual_interval_days = ?, notes = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(input.name.trim(), input.manualIntervalDays, input.notes, input.active ? 1 : 0, id)
      .run();
    if (!result.meta?.changes) throw applicationError("Item not found", "NOT_FOUND");
  } catch (error) {
    if (isUniqueConstraint(error)) throw applicationError("An item with that name already exists", "DUPLICATE");
    throw error;
  }
}

export async function recordOrder(db, itemId, date) {
  try {
    const row = await db.prepare("INSERT INTO order_events (item_id, order_date) VALUES (?, ?) RETURNING id")
      .bind(itemId, date)
      .first();
    return row.id;
  } catch (error) {
    if (isUniqueConstraint(error)) throw applicationError("An order is already recorded for that date", "DUPLICATE");
    throw error;
  }
}

export async function deleteOrder(db, itemId, orderId) {
  const result = await db.prepare("DELETE FROM order_events WHERE id = ? AND item_id = ?")
    .bind(orderId, itemId)
    .run();
  if (!result.meta?.changes) throw applicationError("Order not found", "NOT_FOUND");
}

export function listOrders(db, itemId) {
  return all(db, "SELECT id, order_date FROM order_events WHERE item_id = ? ORDER BY order_date DESC, id DESC", itemId);
}
