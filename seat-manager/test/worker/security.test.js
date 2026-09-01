import { env } from 'cloudflare:workers';
import { expect, test } from 'vitest';
import worker from '../../src/server/worker.js';

const ORIGIN='https://seat-manager.test';

function room(name){return env.RESTAURANT_ROOM.get(env.RESTAURANT_ROOM.idFromName(name));}

async function session(stub){
  const response=await stub.fetch(new Request(`${ORIGIN}/api/login`,{
    method:'POST',headers:{'Content-Type':'application/json',Origin:ORIGIN},
    body:JSON.stringify({pin:'2468',deviceId:'device-security'})
  }));
  const body=await response.json();
  return {cookie:response.headers.get('Set-Cookie').split(';',1)[0],csrf:body.csrfToken};
}

test('static asset responses receive restrictive browser security headers',async()=>{
  const response=await worker.fetch(new Request(`${ORIGIN}/client/app.js`),{
    ASSETS:{fetch:async()=>new Response('export default {};',{headers:{'Content-Type':'text/javascript'}})}
  });
  expect(response.headers.get('Content-Security-Policy')).toBe(
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' wss:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
  );
  expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
  expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
});

test('backup export and protected data remain no-store and require authentication',async()=>{
  const stub=room('security-export');
  const unauthorized=await stub.fetch(new Request(`${ORIGIN}/api/export`));
  expect(unauthorized.status).toBe(401);
  expect(unauthorized.headers.get('Cache-Control')).toBe('no-store');

  const auth=await session(stub);
  const before=Date.now();
  const response=await stub.fetch(new Request(`${ORIGIN}/api/export`,{headers:{Cookie:auth.cookie}}));
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(response.headers.get('Content-Disposition')).toMatch(/^attachment; filename="hotpot-seat-manager-\d{4}-\d{2}-\d{2}\.json"$/);
  const body=await response.json();
  expect(Object.keys(body).sort()).toEqual(['exportedAt','format','restaurantId','snapshot']);
  expect(body).toMatchObject({
    format:'hotpot-seat-manager-online-v1',restaurantId:'centre-street',
    snapshot:{walkins:[],reservations:[],occupancies:[],revision:0}
  });
  expect(body.exportedAt).toBeGreaterThanOrEqual(before);
  expect(body.exportedAt).toBeLessThanOrEqual(Date.now());
  expect(JSON.stringify(body)).not.toMatch(/csrf|session|pin|login_limits/i);
});
