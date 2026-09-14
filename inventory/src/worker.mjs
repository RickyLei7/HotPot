import {
  checkLoginAllowed,
  clearLoginFailures,
  clientKey,
  createSession,
  expiredSessionCookie,
  isFourDigitPin,
  readCookie,
  recordLoginFailure,
  safeEqualText,
  sessionCookie,
  verifySession,
} from "./auth.mjs";
import { parseISODate } from "./domain.mjs";
import { createItem, deleteOrder, listItems, listOrders, recordOrder, updateItem } from "./db.mjs";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(body, status = 200, headers = {}, protectedResponse = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...(protectedResponse ? { "cache-control": "no-store" } : {}), ...headers },
  });
}

const success = (data, status = 200, headers = {}, protectedResponse = true) => json({ data }, status, headers, protectedResponse);
const failure = (error, code, status, protectedResponse = false) => json({ error, code }, status, {}, protectedResponse);

function appError(message, code = "INVALID_INPUT") {
  return Object.assign(new Error(message), { code });
}

async function requestJson(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw appError("Request body must be valid JSON");
  }
}

function validateItem(input, requireActive) {
  if (typeof input.name !== "string" || input.name.trim().length === 0 || input.name.trim().length > 120) {
    throw appError("Name must contain 1 to 120 characters");
  }
  if (input.notes === undefined) input.notes = "";
  if (typeof input.notes !== "string" || input.notes.length > 500) throw appError("Notes must be at most 500 characters");
  if (input.manualIntervalDays === undefined) input.manualIntervalDays = null;
  if (input.manualIntervalDays !== null && (!Number.isInteger(input.manualIntervalDays) || input.manualIntervalDays < 1 || input.manualIntervalDays > 365)) {
    throw appError("Manual interval must be null or an integer from 1 through 365");
  }
  if ((requireActive || input.active !== undefined) && typeof input.active !== "boolean") throw appError("Active must be a boolean");
  return input;
}

function positiveId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw appError("Invalid resource ID");
  return id;
}

function calgaryDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((entry) => entry.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function validateOrderDate(value) {
  if (typeof value !== "string") throw appError("Date must be an ISO calendar date");
  try {
    parseISODate(value);
  } catch {
    throw appError("Date must be an ISO calendar date");
  }
  if (value > calgaryDate()) throw appError("Order date cannot be in the future");
  return value;
}

function quoteCsv(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function exportCsv(db) {
  const { results = [] } = await db.prepare(`
    SELECT i.name AS item_name, i.active, i.manual_interval_days, o.order_date, i.notes
    FROM items i
    LEFT JOIN order_events o ON o.item_id = i.id
    ORDER BY i.name COLLATE NOCASE, o.order_date DESC
  `).bind().all();
  const lines = ["item_name,active,manual_interval_days,order_date,notes"];
  for (const row of results) {
    lines.push([
      row.item_name,
      Boolean(row.active),
      row.manual_interval_days,
      row.order_date,
      row.notes,
    ].map(quoteCsv).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

async function login(request, env) {
  if (!env.INVENTORY_PIN || !env.SESSION_SECRET) return failure("Server configuration is incomplete", "CONFIGURATION_ERROR", 500);
  let input;
  try {
    input = await requestJson(request);
  } catch {
    return failure("Invalid PIN", "UNAUTHORIZED", 401);
  }
  if (!isFourDigitPin(input.pin)) return failure("Invalid PIN", "UNAUTHORIZED", 401);

  const key = await clientKey(request, env.SESSION_SECRET);
  if (!(await checkLoginAllowed(env.DB, key))) return failure("Too many login attempts", "LOCKED", 429);
  if (!safeEqualText(input.pin, env.INVENTORY_PIN)) {
    await recordLoginFailure(env.DB, key);
    return failure("Invalid PIN", "UNAUTHORIZED", 401);
  }

  await clearLoginFailures(env.DB, key);
  const token = await createSession(env.SESSION_SECRET);
  return success({ authenticated: true }, 200, { "set-cookie": sessionCookie(token) }, false);
}

async function isAuthenticated(request, env) {
  if (!env.SESSION_SECRET) return false;
  const token = readCookie(request, "inventory_session");
  return token ? verifySession(token, env.SESSION_SECRET) : false;
}

function isProtectedPath(pathname) {
  return pathname === "/api/items"
    || pathname === "/api/export.csv"
    || /^\/api\/items\/\d+(?:\/orders(?:\/\d+)?)?$/.test(pathname);
}

async function protectedRoute(request, env, url) {
  const { pathname } = url;
  const method = request.method;

  if (pathname === "/api/items" && method === "GET") {
    return success(await listItems(env.DB, calgaryDate(), url.searchParams.get("activeOnly") === "true"));
  }
  if (pathname === "/api/items" && method === "POST") {
    const id = await createItem(env.DB, validateItem(await requestJson(request), false));
    return success({ id }, 201);
  }

  let match = pathname.match(/^\/api\/items\/(\d+)$/);
  if (match && method === "PATCH") {
    const id = positiveId(match[1]);
    await updateItem(env.DB, id, validateItem(await requestJson(request), true));
    return success({ id });
  }

  match = pathname.match(/^\/api\/items\/(\d+)\/orders$/);
  if (match && method === "GET") return success(await listOrders(env.DB, positiveId(match[1])));
  if (match && method === "POST") {
    const itemId = positiveId(match[1]);
    const input = await requestJson(request);
    const id = await recordOrder(env.DB, itemId, validateOrderDate(input.date));
    return success({ id }, 201);
  }

  match = pathname.match(/^\/api\/items\/(\d+)\/orders\/(\d+)$/);
  if (match && method === "DELETE") {
    const itemId = positiveId(match[1]);
    const orderId = positiveId(match[2]);
    await deleteOrder(env.DB, itemId, orderId);
    return success({ id: orderId });
  }

  if (pathname === "/api/export.csv" && method === "GET") {
    return new Response(await exportCsv(env.DB), {
      headers: {
        "cache-control": "no-store",
        "content-disposition": 'attachment; filename="inventory-orders.csv"',
        "content-type": "text/csv; charset=utf-8",
      },
    });
  }

  return failure("API route not found", "NOT_FOUND", 404, true);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (url.pathname === "/api/login" && request.method === "POST") return login(request, env);
    if (url.pathname === "/api/logout" && request.method === "POST") {
      return success({ authenticated: false }, 200, { "set-cookie": expiredSessionCookie() }, false);
    }
    if (!isProtectedPath(url.pathname)) return failure("API route not found", "NOT_FOUND", 404);
    if (!env.SESSION_SECRET) return failure("Server configuration is incomplete", "CONFIGURATION_ERROR", 500, true);
    if (!(await isAuthenticated(request, env))) return failure("Authentication required", "UNAUTHORIZED", 401, true);

    try {
      return await protectedRoute(request, env, url);
    } catch (error) {
      if (error?.code === "INVALID_INPUT") return failure(error.message, error.code, 400, true);
      if (error?.code === "DUPLICATE") return failure(error.message, error.code, 409, true);
      if (error?.code === "NOT_FOUND") return failure(error.message, error.code, 404, true);
      return failure("Internal server error", "INTERNAL_ERROR", 500, true);
    }
  },
};
