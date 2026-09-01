import { env } from 'cloudflare:workers';
import { runInDurableObject } from 'cloudflare:test';
import { expect, test } from 'vitest';

const ORIGIN = 'https://seat-manager.test';

function room(name) {
  return env.RESTAURANT_ROOM.get(env.RESTAURANT_ROOM.idFromName(name));
}

function login(stub, pin, deviceId, ip = '203.0.113.10', origin = ORIGIN) {
  return stub.fetch(new Request(`${ORIGIN}/api/login`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Origin':origin,
      'CF-Connecting-IP':ip
    },
    body:JSON.stringify({pin,deviceId})
  }));
}

function cookieFrom(response) {
  return response.headers.get('Set-Cookie').split(';', 1)[0];
}

test('correct PIN creates a 12-hour secure session and session lookup returns the same shape', async () => {
  const stub = room('auth-correct');
  const before = Date.now();
  const response = await login(stub, '2468', 'device-a');
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(response.headers.get('Set-Cookie')).toMatch(
    /^hsm_session=[A-Za-z0-9_-]+; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200$/
  );
  const body = await response.json();
  expect(body).toMatchObject({authenticated:true});
  expect(body.csrfToken).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(body.expiresAt).toBeGreaterThanOrEqual(before + 43_200_000);
  expect(body.expiresAt).toBeLessThanOrEqual(Date.now() + 43_200_000);

  const session = await stub.fetch(new Request(`${ORIGIN}/api/session`, {
    headers:{Cookie:cookieFrom(response)}
  }));
  expect(session.status).toBe(200);
  expect(await session.json()).toEqual(body);
});

test('wrong and malformed PINs return the same non-revealing response', async () => {
  const stub = room('auth-invalid');
  const wrong = await login(stub, '0000', 'device-a');
  const malformed = await login(stub, '12x', 'device-b', '203.0.113.11');
  expect(wrong.status).toBe(401);
  expect(malformed.status).toBe(401);
  expect(await wrong.json()).toEqual({authenticated:false,code:'INVALID_CREDENTIALS'});
  expect(await malformed.json()).toEqual({authenticated:false,code:'INVALID_CREDENTIALS'});
});

test('fifth wrong PIN attempt returns a fifteen-minute source cooldown', async () => {
  const stub = room('auth-device-lock');
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await login(stub, '0000', 'device-a');
    expect(response.status).toBe(401);
  }
  const fifth = await login(stub, '0000', 'device-a');
  expect(fifth.status).toBe(429);
  expect(await fifth.json()).toMatchObject({
    authenticated:false,code:'LOGIN_COOLDOWN',retryAfterSeconds:900
  });
});

test('network bucket cannot be bypassed by rotating device identifiers', async () => {
  const stub = room('auth-network-lock');
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await login(stub, '0000', `device-${attempt}`, '203.0.113.20');
    expect(response.status).toBe(401);
  }
  const fifth = await login(stub, '0000', 'device-5', '203.0.113.20');
  expect(fifth.status).toBe(429);
});

test('restaurant-wide cooldown catches distributed failures', async () => {
  const stub = room('auth-global-lock');
  for (let attempt = 1; attempt < 100; attempt += 1) {
    const response = await login(
      stub,
      '0000',
      `device-${attempt}`,
      `198.51.100.${attempt}`
    );
    expect(response.status).toBe(401);
  }
  const hundredth = await login(stub, '0000', 'device-100', '198.51.100.100');
  expect(hundredth.status).toBe(429);
  expect(await hundredth.json()).toMatchObject({code:'LOGIN_COOLDOWN',retryAfterSeconds:900});
});

test('rate-limit storage contains hashes and never the raw network address', async () => {
  const stub = room('auth-hashed-source');
  await login(stub, '0000', 'device-plain', '203.0.113.55');
  const keys = await runInDurableObject(stub, async (_instance, state) => [
    ...state.storage.sql.exec('SELECT bucket_key FROM login_limits ORDER BY bucket_key')
  ].map(row => row.bucket_key));
  expect(keys).toHaveLength(3);
  expect(keys.some(key => key.includes('203.0.113.55'))).toBe(false);
  expect(keys.some(key => key.includes('device-plain'))).toBe(false);
  expect(keys.some(key => key.startsWith('network:'))).toBe(true);
  expect(keys.some(key => key.startsWith('device:'))).toBe(true);
  expect(keys).toContain('global:centre-street');
});

test('expired and old-PIN-version sessions are deleted and rejected', async () => {
  const expiredStub = room('auth-expired');
  const expiredLogin = await login(expiredStub, '2468', 'device-a');
  const expiredCookie = cookieFrom(expiredLogin);
  await runInDurableObject(expiredStub, async (_instance, state) => {
    state.storage.sql.exec('UPDATE sessions SET expires_at = 1');
  });
  const expired = await expiredStub.fetch(new Request(`${ORIGIN}/api/session`, {
    headers:{Cookie:expiredCookie}
  }));
  expect(expired.status).toBe(401);

  const resetStub = room('auth-pin-reset');
  const resetLogin = await login(resetStub, '2468', 'device-b');
  const resetCookie = cookieFrom(resetLogin);
  await runInDurableObject(resetStub, async (_instance, state) => {
    state.storage.sql.exec("UPDATE sessions SET pin_version = 'old-version'");
  });
  const reset = await resetStub.fetch(new Request(`${ORIGIN}/api/session`, {
    headers:{Cookie:resetCookie}
  }));
  expect(reset.status).toBe(401);

  const rowCounts = await Promise.all([expiredStub, resetStub].map(stub =>
    runInDurableObject(stub, async (_instance, state) =>
      [...state.storage.sql.exec('SELECT COUNT(*) AS count FROM sessions')][0].count
    )
  ));
  expect(rowCounts).toEqual([0,0]);
});

test('logout requires exact origin and CSRF then deletes the session', async () => {
  const stub = room('auth-logout');
  const loginResponse = await login(stub, '2468', 'device-a');
  const body = await loginResponse.json();
  const cookie = cookieFrom(loginResponse);

  const wrongOrigin = await stub.fetch(new Request(`${ORIGIN}/api/logout`, {
    method:'POST',headers:{Cookie:cookie,Origin:'https://evil.example','X-CSRF-Token':body.csrfToken}
  }));
  expect(wrongOrigin.status).toBe(403);
  expect(await wrongOrigin.json()).toMatchObject({code:'ORIGIN_REJECTED'});

  const wrongCsrf = await stub.fetch(new Request(`${ORIGIN}/api/logout`, {
    method:'POST',headers:{Cookie:cookie,Origin:ORIGIN,'X-CSRF-Token':'wrong'}
  }));
  expect(wrongCsrf.status).toBe(403);
  expect(await wrongCsrf.json()).toMatchObject({code:'CSRF_REJECTED'});

  const logout = await stub.fetch(new Request(`${ORIGIN}/api/logout`, {
    method:'POST',headers:{Cookie:cookie,Origin:ORIGIN,'X-CSRF-Token':body.csrfToken}
  }));
  expect(logout.status).toBe(200);
  expect(logout.headers.get('Set-Cookie')).toContain('hsm_session=;');
  expect(logout.headers.get('Set-Cookie')).toContain('Max-Age=0');
  expect(await logout.json()).toEqual({authenticated:false});

  const session = await stub.fetch(new Request(`${ORIGIN}/api/session`, {headers:{Cookie:cookie}}));
  expect(session.status).toBe(401);
});

test('login rejects a missing or foreign Origin before checking credentials', async () => {
  const stub = room('auth-origin');
  const missing = await stub.fetch(new Request(`${ORIGIN}/api/login`, {
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({pin:'2468',deviceId:'device-a'})
  }));
  const foreign = await login(stub, '2468', 'device-a', '203.0.113.10', 'https://evil.example');
  expect(missing.status).toBe(403);
  expect(foreign.status).toBe(403);
  expect(await missing.json()).toMatchObject({code:'ORIGIN_REJECTED'});
  expect(await foreign.json()).toMatchObject({code:'ORIGIN_REJECTED'});
});
