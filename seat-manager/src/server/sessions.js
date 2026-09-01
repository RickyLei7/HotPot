import { hashSessionToken } from './auth-crypto.js';

const SESSION_COOKIE_NAME = 'hsm_session';

function randomToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return '';
}

export const sessionCookie = token => [
  `${SESSION_COOKIE_NAME}=${token}`,
  'Path=/',
  'HttpOnly',
  'Secure',
  'SameSite=Strict',
  'Max-Age=43200'
].join('; ');

export const expiredSessionCookie = () => [
  `${SESSION_COOKIE_NAME}=`,
  'Path=/',
  'HttpOnly',
  'Secure',
  'SameSite=Strict',
  'Max-Age=0'
].join('; ');

export async function issueSession(sql, env, now) {
  const token = randomToken(32);
  const tokenHash = await hashSessionToken(token);
  const csrfToken = randomToken(24);
  const expiresAt = now + Number(env.SESSION_TTL_MS || 43_200_000);
  sql.exec(`INSERT INTO sessions (
      token_hash, restaurant_id, csrf_token, pin_version,
      created_at, expires_at, last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    tokenHash,
    env.RESTAURANT_ID,
    csrfToken,
    env.PIN_VERSION,
    now,
    expiresAt,
    now
  );
  return {token,tokenHash,csrfToken,expiresAt};
}

export async function requireSession(request, sql, env, now) {
  const token = cookieValue(request, SESSION_COOKIE_NAME);
  if (!token) return null;
  const tokenHash = await hashSessionToken(token);
  const row = [...sql.exec(
    `SELECT token_hash, restaurant_id, csrf_token, pin_version,
            created_at, expires_at, last_seen_at
     FROM sessions WHERE token_hash = ? AND restaurant_id = ?`,
    tokenHash,
    env.RESTAURANT_ID
  )][0];
  if (!row) return null;
  if (Number(row.expires_at) <= now || row.pin_version !== env.PIN_VERSION) {
    sql.exec('DELETE FROM sessions WHERE token_hash = ?', tokenHash);
    return null;
  }
  sql.exec('UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?', now, tokenHash);
  return {
    tokenHash,
    csrfToken:row.csrf_token,
    expiresAt:Number(row.expires_at),
    pinVersion:row.pin_version
  };
}

export function deleteSession(sql, tokenHash) {
  sql.exec('DELETE FROM sessions WHERE token_hash = ?', tokenHash);
}

export function allowedOrigin(request, env) {
  return env.ALLOWED_ORIGIN === 'self'
    ? new URL(request.url).origin
    : env.ALLOWED_ORIGIN;
}

export function hasAllowedOrigin(request, env) {
  return request.headers.get('Origin') === allowedOrigin(request, env);
}

export function hasValidCsrf(request, session) {
  return request.headers.get('X-CSRF-Token') === session.csrfToken;
}
