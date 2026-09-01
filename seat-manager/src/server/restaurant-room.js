import { DurableObject } from 'cloudflare:workers';
import { verifyPin } from './auth-crypto.js';
import { applyWrites, readSnapshot } from './persistence.js';
import {
  activeLoginCooldown,
  clearSuccessfulLoginSources,
  deleteExpiredLoginLimits,
  loginSourceKeys,
  recordLoginFailure
} from './rate-limit.js';
import { initializeSchema } from './schema.js';
import {
  deleteSession,
  expiredSessionCookie,
  hasAllowedOrigin,
  hasValidCsrf,
  issueSession,
  requireSession,
  sessionCookie
} from './sessions.js';

const noStoreHeaders = {'Cache-Control':'no-store'};

function json(body, status = 200, headers = {}) {
  return Response.json(body, {status,headers:{...noStoreHeaders,...headers}});
}

function unauthorized() {
  return json({authenticated:false,code:'UNAUTHORIZED'}, 401);
}

function originRejected() {
  return json({authenticated:false,code:'ORIGIN_REJECTED'}, 403);
}

export class RestaurantRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.restaurantId = env.RESTAURANT_ID || 'centre-street';
    initializeSchema(ctx.storage.sql, this.restaurantId);
  }

  readSnapshotForTest() {
    return readSnapshot(this.ctx.storage.sql, this.restaurantId);
  }

  async applyWritesForTest(writes, revision) {
    await this.ctx.storage.transaction(async () => {
      applyWrites(this.ctx.storage.sql, this.restaurantId, writes, revision);
    });
  }

  async login(request, now) {
    if (!hasAllowedOrigin(request, this.env)) return originRejected();
    let body;
    try {
      body = await request.json();
    } catch {
      return json({authenticated:false,code:'INVALID_CREDENTIALS'}, 401);
    }
    const keys = Object.keys(body || {}).sort();
    const validShape = keys.length === 2
      && keys[0] === 'deviceId'
      && keys[1] === 'pin'
      && /^[A-Za-z0-9_-]{8,128}$/.test(String(body.deviceId || ''));
    if (!validShape) return json({authenticated:false,code:'INVALID_CREDENTIALS'}, 401);

    const sql = this.ctx.storage.sql;
    const sourceKeys = await loginSourceKeys(request, body.deviceId, this.env);
    deleteExpiredLoginLimits(sql, now);
    const activeCooldown = activeLoginCooldown(sql, this.restaurantId, sourceKeys, now);
    if (activeCooldown) {
      return json({
        authenticated:false,
        code:'LOGIN_COOLDOWN',
        retryAfterSeconds:activeCooldown.retryAfterSeconds
      }, 429, {'Retry-After':String(activeCooldown.retryAfterSeconds)});
    }

    if (!await verifyPin(body.pin, this.env)) {
      const newCooldown = recordLoginFailure(sql, this.restaurantId, sourceKeys, now);
      if (newCooldown) {
        return json({
          authenticated:false,
          code:'LOGIN_COOLDOWN',
          retryAfterSeconds:newCooldown.retryAfterSeconds
        }, 429, {'Retry-After':String(newCooldown.retryAfterSeconds)});
      }
      return json({authenticated:false,code:'INVALID_CREDENTIALS'}, 401);
    }

    clearSuccessfulLoginSources(sql, this.restaurantId, sourceKeys);
    const session = await issueSession(sql, this.env, now);
    return json({
      authenticated:true,
      csrfToken:session.csrfToken,
      expiresAt:session.expiresAt
    }, 200, {'Set-Cookie':sessionCookie(session.token)});
  }

  async session(request, now) {
    const session = await requireSession(request, this.ctx.storage.sql, this.env, now);
    if (!session) return unauthorized();
    return json({
      authenticated:true,
      csrfToken:session.csrfToken,
      expiresAt:session.expiresAt
    });
  }

  async logout(request, now) {
    if (!hasAllowedOrigin(request, this.env)) return originRejected();
    const session = await requireSession(request, this.ctx.storage.sql, this.env, now);
    if (!session) return unauthorized();
    if (!hasValidCsrf(request, session)) {
      return json({authenticated:true,code:'CSRF_REJECTED'}, 403);
    }
    deleteSession(this.ctx.storage.sql, session.tokenHash);
    return json(
      {authenticated:false},
      200,
      {'Set-Cookie':expiredSessionCookie()}
    );
  }

  async fetch(request) {
    const url = new URL(request.url);
    const now = Date.now();
    if (request.method === 'POST' && url.pathname === '/api/login') {
      return this.login(request, now);
    }
    if (request.method === 'GET' && url.pathname === '/api/session') {
      return this.session(request, now);
    }
    if (request.method === 'POST' && url.pathname === '/api/logout') {
      return this.logout(request, now);
    }
    return json({code:'NOT_FOUND'}, 404);
  }
}
