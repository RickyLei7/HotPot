import { hmacHex } from './auth-crypto.js';

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const FIRST_LOCK_MS = 15 * 60 * 1000;
export const MAX_LOCK_MS = 4 * 60 * 60 * 1000;
const SOURCE_THRESHOLD = 5;
const GLOBAL_THRESHOLD = 100;
const ENTRY_RETENTION_MS = 24 * 60 * 60 * 1000;

export async function loginSourceKeys(request, deviceId, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  return [
    `device:${await hmacHex(env.PIN_PEPPER, String(deviceId))}`,
    `network:${await hmacHex(env.PIN_PEPPER, ip)}`,
    `global:${env.RESTAURANT_ID || 'centre-street'}`
  ];
}

function readLimit(sql, restaurantId, bucketKey) {
  return [...sql.exec(
    `SELECT bucket_key, window_started_at, failures, lock_level, locked_until, expires_at
     FROM login_limits WHERE restaurant_id = ? AND bucket_key = ?`,
    restaurantId,
    bucketKey
  )][0] || null;
}

function retryAfterSeconds(lockedUntil, now) {
  return Math.max(1, Math.ceil((Number(lockedUntil) - now) / 1000));
}

export function activeLoginCooldown(sql, restaurantId, sourceKeys, now) {
  let longest = null;
  for (const bucketKey of sourceKeys) {
    const row = readLimit(sql, restaurantId, bucketKey);
    if (row && Number(row.locked_until) > now) {
      const retry = retryAfterSeconds(row.locked_until, now);
      if (!longest || retry > longest.retryAfterSeconds) {
        longest = {bucketKey,retryAfterSeconds:retry};
      }
    }
  }
  return longest;
}

function lockDuration(level) {
  return Math.min(MAX_LOCK_MS, FIRST_LOCK_MS * (2 ** Math.max(0, level - 1)));
}

function saveLimit(sql, restaurantId, row) {
  sql.exec(`INSERT INTO login_limits (
      restaurant_id, bucket_key, window_started_at, failures, lock_level,
      locked_until, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(restaurant_id, bucket_key) DO UPDATE SET
      window_started_at=excluded.window_started_at,
      failures=excluded.failures,
      lock_level=excluded.lock_level,
      locked_until=excluded.locked_until,
      expires_at=excluded.expires_at`,
    restaurantId,
    row.bucketKey,
    row.windowStartedAt,
    row.failures,
    row.lockLevel,
    row.lockedUntil,
    row.expiresAt
  );
}

export function recordLoginFailure(sql, restaurantId, sourceKeys, now) {
  let longest = null;
  for (const bucketKey of sourceKeys) {
    const previous = readLimit(sql, restaurantId, bucketKey);
    const threshold = bucketKey.startsWith('global:') ? GLOBAL_THRESHOLD : SOURCE_THRESHOLD;
    const windowExpired = !previous || now - Number(previous.window_started_at) >= LOGIN_WINDOW_MS;
    let failures = windowExpired ? 1 : Number(previous.failures) + 1;
    let lockLevel = Number(previous?.lock_level || 0);
    let lockedUntil = 0;

    const continuedAfterLock = previous
      && lockLevel > 0
      && Number(previous.locked_until) <= now;
    if (failures >= threshold || continuedAfterLock) {
      lockLevel = Math.min(5, lockLevel + 1);
      lockedUntil = now + lockDuration(lockLevel);
      failures = threshold;
    }

    saveLimit(sql, restaurantId, {
      bucketKey,
      windowStartedAt: windowExpired ? now : Number(previous.window_started_at),
      failures,
      lockLevel,
      lockedUntil,
      expiresAt: now + ENTRY_RETENTION_MS
    });

    if (lockedUntil > now) {
      const retry = retryAfterSeconds(lockedUntil, now);
      if (!longest || retry > longest.retryAfterSeconds) {
        longest = {bucketKey,retryAfterSeconds:retry};
      }
    }
  }
  return longest;
}

export function clearSuccessfulLoginSources(sql, restaurantId, sourceKeys) {
  for (const bucketKey of sourceKeys.filter(key => !key.startsWith('global:'))) {
    sql.exec(
      'DELETE FROM login_limits WHERE restaurant_id = ? AND bucket_key = ?',
      restaurantId,
      bucketKey
    );
  }
}

export function deleteExpiredLoginLimits(sql, now) {
  sql.exec('DELETE FROM login_limits WHERE expires_at <= ?', now);
}
