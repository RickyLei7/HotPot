import { env } from 'cloudflare:workers';
import { runInDurableObject } from 'cloudflare:test';
import { expect, test } from 'vitest';

const ORIGIN='https://seat-manager.test';

function room(name) {
  return env.RESTAURANT_ROOM.get(env.RESTAURANT_ROOM.idFromName(name));
}

async function staffSession(stub,deviceId='device-realtime') {
  const response=await stub.fetch(new Request(`${ORIGIN}/api/login`,{
    method:'POST',headers:{'Content-Type':'application/json',Origin:ORIGIN},
    body:JSON.stringify({pin:'2468',deviceId})
  }));
  const body=await response.json();
  return {cookie:response.headers.get('Set-Cookie').split(';',1)[0],csrf:body.csrfToken};
}

function upgrade(stub,session,origin=ORIGIN) {
  const headers={Upgrade:'websocket',Origin:origin};
  if (session) headers.Cookie=session.cookie;
  return stub.fetch(new Request(`${ORIGIN}/ws`,{headers}));
}

function command(stub,session,body) {
  return stub.fetch(new Request(`${ORIGIN}/api/commands`,{
    method:'POST',
    headers:{'Content-Type':'application/json',Origin:ORIGIN,Cookie:session.cookie,'X-CSRF-Token':session.csrf},
    body:JSON.stringify(body)
  }));
}

test('WebSocket upgrade requires a valid session and exact origin',async()=>{
  const stub=room('realtime-auth');
  const unauthorized=await upgrade(stub,null);
  expect(unauthorized.status).toBe(401);
  const session=await staffSession(stub);
  const foreign=await upgrade(stub,session,'https://evil.example');
  expect(foreign.status).toBe(403);
  const accepted=await upgrade(stub,session);
  expect(accepted.status).toBe(101);
  accepted.webSocket.accept();
  accepted.webSocket.close(1000,'done');
});

test('hibernating socket attachment contains only session hash and PIN version',async()=>{
  const stub=room('realtime-attachment');
  const session=await staffSession(stub);
  const response=await upgrade(stub,session);
  response.webSocket.accept();
  const attachments=await runInDurableObject(stub,async instance=>instance.socketAttachmentsForTest());
  expect(attachments).toHaveLength(1);
  expect(Object.keys(attachments[0]).sort()).toEqual(['pinVersion','sessionHash']);
  expect(JSON.stringify(attachments)).not.toContain(session.csrf);
  response.webSocket.close(1000,'done');
});

test('a committed command broadcasts exactly one authoritative snapshot',async()=>{
  const stub=room('realtime-broadcast');
  const session=await staffSession(stub);
  const response=await upgrade(stub,session);
  const socket=response.webSocket;
  socket.accept();
  const message=new Promise(resolve=>socket.addEventListener('message',event=>resolve(JSON.parse(event.data)),{once:true}));
  const saved=await command(stub,session,{
    type:'walkin.create',idempotencyKey:'realtime-create',name:'Realtime',partySize:2
  });
  expect(saved.status).toBe(200);
  await expect(message).resolves.toMatchObject({type:'snapshot',revision:1,snapshot:{revision:1}});
  const count=await runInDurableObject(stub,async instance=>instance.broadcastCountForTest());
  expect(count).toBe(1);
  socket.close(1000,'done');
});

test('failed and duplicate commands do not broadcast',async()=>{
  const stub=room('realtime-no-false-broadcast');
  const session=await staffSession(stub);
  const response=await upgrade(stub,session);
  response.webSocket.accept();
  const create={type:'walkin.create',idempotencyKey:'once',name:'Once',partySize:2};
  expect((await command(stub,session,create)).status).toBe(200);
  expect((await command(stub,session,create)).status).toBe(200);
  expect((await command(stub,session,{
    type:'party.seat',idempotencyKey:'bad-seat',partyId:'missing',partyKind:'walkin',
    expectedVersion:1,tableIds:[9]
  })).status).toBe(404);
  const count=await runInDurableObject(stub,async instance=>instance.broadcastCountForTest());
  expect(count).toBe(1);
  response.webSocket.close(1000,'done');
});

test('expired socket session is closed before a later snapshot can be disclosed',async()=>{
  const stub=room('realtime-expired-session');
  const expiredSession=await staffSession(stub,'device-expired');
  const response=await upgrade(stub,expiredSession);
  const socket=response.webSocket;
  socket.accept();
  const attachment=await runInDurableObject(stub,async instance=>instance.socketAttachmentsForTest()[0]);
  await runInDurableObject(stub,async (_instance,state)=>{
    state.storage.sql.exec('UPDATE sessions SET expires_at = 1 WHERE token_hash = ?',attachment.sessionHash);
  });
  const outcome=new Promise(resolve=>{
    socket.addEventListener('message',()=>resolve('message'),{once:true});
    socket.addEventListener('close',()=>resolve('close'),{once:true});
  });
  const activeSession=await staffSession(stub,'device-active');
  expect((await command(stub,activeSession,{
    type:'walkin.create',idempotencyKey:'after-expiry',name:'Protected',partySize:2
  })).status).toBe(200);
  await expect(outcome).resolves.toBe('close');
});
