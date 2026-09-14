const encoder = new TextEncoder();
const SESSION_MS = 7 * 86_400_000;
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

const bytesToBase64url = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

async function hmac(secret, text) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
}

export const isFourDigitPin = (value) => typeof value === "string" && /^\d{4}$/.test(value);

export function safeEqualText(left, right) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

export async function createSession(secret, nowMs = Date.now()) {
  const payload = bytesToBase64url(encoder.encode(JSON.stringify({ exp: nowMs + SESSION_MS })));
  return `${payload}.${bytesToBase64url(await hmac(secret, payload))}`;
}

export async function verifySession(token, secret, nowMs = Date.now()) {
  try {
    const segments = token.split(".");
    if (segments.length !== 2) return false;
    const [payload, signature] = segments;
    if (!payload || !signature || !safeEqualText(signature, bytesToBase64url(await hmac(secret, payload)))) return false;
    const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0))));
    return Number.isFinite(decoded.exp) && decoded.exp > nowMs;
  } catch {
    return false;
  }
}

export function readCookie(request, name) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

export const sessionCookie = (token) => `inventory_session=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`;
export const expiredSessionCookie = () => "inventory_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";

export async function clientKey(request, secret) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return bytesToBase64url(await hmac(secret, ip));
}

export async function checkLoginAllowed(db, key, nowMs = Date.now()) {
  const row = await db.prepare("SELECT locked_until FROM login_attempts WHERE client_key = ?").bind(key).first();
  return !row?.locked_until || row.locked_until <= nowMs;
}

export async function recordLoginFailure(db, key, nowMs = Date.now()) {
  await db.prepare(`
    INSERT INTO login_attempts (client_key, failures, window_started_at, locked_until)
    VALUES (?, 1, ?, NULL)
    ON CONFLICT(client_key) DO UPDATE SET
      failures = CASE
        WHEN excluded.window_started_at - login_attempts.window_started_at < ? THEN login_attempts.failures + 1
        ELSE 1
      END,
      window_started_at = CASE
        WHEN excluded.window_started_at - login_attempts.window_started_at < ? THEN login_attempts.window_started_at
        ELSE excluded.window_started_at
      END,
      locked_until = CASE
        WHEN excluded.window_started_at - login_attempts.window_started_at < ? AND login_attempts.failures + 1 >= ?
          THEN excluded.window_started_at + ?
        ELSE NULL
      END
  `).bind(key, nowMs, WINDOW_MS, WINDOW_MS, WINDOW_MS, MAX_FAILURES, WINDOW_MS).run();
}

export async function clearLoginFailures(db, key) {
  await db.prepare("DELETE FROM login_attempts WHERE client_key = ?").bind(key).run();
}
