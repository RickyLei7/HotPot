import { env } from 'cloudflare:workers';
import { abortAllDurableObjects, runInDurableObject } from 'cloudflare:test';
import { expect, test } from 'vitest';

const ORIGIN = 'https://seat-manager.test';

function room(name) {
  return env.RESTAURANT_ROOM.get(env.RESTAURANT_ROOM.idFromName(name));
}

async function staffSession(stub, deviceId = 'device-a') {
  const response = await stub.fetch(new Request(`${ORIGIN}/api/login`, {
    method:'POST',
    headers:{'Content-Type':'application/json',Origin:ORIGIN,'CF-Connecting-IP':'203.0.113.10'},
    body:JSON.stringify({pin:'2468',deviceId})
  }));
  expect(response.status).toBe(200);
  const body = await response.json();
  return {cookie:response.headers.get('Set-Cookie').split(';',1)[0],csrf:body.csrfToken};
}

function sendCommand(stub, session, command, origin = ORIGIN) {
  return stub.fetch(new Request(`${ORIGIN}/api/commands`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',Cookie:session.cookie,Origin:origin,
      'X-CSRF-Token':session.csrf
    },
    body:JSON.stringify(command)
  }));
}

function snapshot(stub, session) {
  return stub.fetch(new Request(`${ORIGIN}/api/snapshot`, {
    headers:{Cookie:session.cookie}
  }));
}

const createWalkin = (key, name, partySize = 2, extra = {}) => ({
  type:'walkin.create',idempotencyKey:key,name,phone:'403-555-0100',partySize,...extra
});

test('snapshot and command endpoints reject unauthenticated access', async () => {
  const stub = room('commands-unauthorized');
  const read = await stub.fetch(new Request(`${ORIGIN}/api/snapshot`));
  const write = await stub.fetch(new Request(`${ORIGIN}/api/commands`, {
    method:'POST',headers:{'Content-Type':'application/json',Origin:ORIGIN},
    body:JSON.stringify(createWalkin('u1','Unauthorized'))
  }));
  expect(read.status).toBe(401);
  expect(write.status).toBe(401);
  expect(read.headers.get('Cache-Control')).toBe('no-store');
});

test('authorized room starts empty and creates with server timestamps', async () => {
  const stub = room('commands-create');
  const session = await staffSession(stub);
  const empty = await snapshot(stub, session);
  expect(await empty.json()).toEqual({
    snapshot:{walkins:[],reservations:[],occupancies:[],revision:0}
  });

  const before = Date.now();
  const created = await sendCommand(stub, session, createWalkin('create-1','First',2,{
    createdAt:1,updatedAt:1,status:'seated',restaurantId:'other'
  }));
  const after = Date.now();
  expect(created.status).toBe(200);
  const body = await created.json();
  expect(body.snapshot.walkins).toHaveLength(1);
  expect(body.snapshot.walkins[0].createdAt).toBeGreaterThanOrEqual(before);
  expect(body.snapshot.walkins[0].createdAt).toBeLessThanOrEqual(after);
  expect(body.snapshot.walkins[0].status).toBe('waiting');
  expect(body.snapshot.revision).toBe(1);
});

test('duplicate idempotency key returns the original result exactly once', async () => {
  const stub = room('commands-idempotent');
  const session = await staffSession(stub);
  const command = createWalkin('same-key','Only once');
  const first = await sendCommand(stub, session, command);
  const second = await sendCommand(stub, session, command);
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
  const firstBody = await first.json();
  expect(await second.json()).toEqual(firstBody);
  expect(firstBody.snapshot.walkins).toHaveLength(1);
  expect(firstBody.snapshot.revision).toBe(1);
});

test('same-version reservation edits produce one success and one authoritative conflict', async () => {
  const stub = room('commands-version-conflict');
  const session = await staffSession(stub);
  const created = await sendCommand(stub, session, {
    type:'reservation.create',idempotencyKey:'reservation-1',name:'Jessica',phone:'403',
    partySize:4,reservedAt:Date.now()+60_000
  });
  const reservation = (await created.json()).snapshot.reservations[0];
  const edit = (key, name) => ({
    type:'reservation.edit',idempotencyKey:key,id:reservation.id,expectedVersion:1,
    name,phone:'403',partySize:4,reservedAt:reservation.reservedAt
  });
  const [first,second] = await Promise.all([
    sendCommand(stub,session,edit('edit-a','First edit')),
    sendCommand(stub,session,edit('edit-b','Second edit'))
  ]);
  expect([first.status,second.status].sort()).toEqual([200,409]);
  const conflict = first.status === 409 ? first : second;
  expect(await conflict.json()).toMatchObject({code:'STALE_VERSION',snapshot:{revision:2}});
});

test('two devices cannot seat different parties at table 9', async () => {
  const stub = room('commands-table-race');
  const sessionA = await staffSession(stub,'device-a');
  const sessionB = await staffSession(stub,'device-b');
  const firstCreate = await sendCommand(stub,sessionA,createWalkin('walkin-a','A'));
  const secondCreate = await sendCommand(stub,sessionB,createWalkin('walkin-b','B'));
  const firstParty = (await firstCreate.json()).snapshot.walkins[0];
  const secondParty = (await secondCreate.json()).snapshot.walkins.find(row => row.name === 'B');
  const seat = (key, party) => ({
    type:'party.seat',idempotencyKey:key,partyId:party.id,partyKind:'walkin',
    expectedVersion:1,tableIds:[9]
  });
  const [first,second] = await Promise.all([
    sendCommand(stub,sessionA,seat('seat-a',firstParty)),
    sendCommand(stub,sessionB,seat('seat-b',secondParty))
  ]);
  expect([first.status,second.status].sort()).toEqual([200,409]);
  const current = await snapshot(stub,sessionA);
  const body = await current.json();
  expect(body.snapshot.occupancies.filter(row => row.tableId === 9)).toHaveLength(1);
});

test('joined-table seating is atomic when one selected table is occupied', async () => {
  const stub = room('commands-joined-atomic');
  const session = await staffSession(stub);
  const blockerCreate = await sendCommand(stub,session,createWalkin('blocker','Blocker',4));
  const blocker = (await blockerCreate.json()).snapshot.walkins[0];
  await sendCommand(stub,session,{
    type:'party.seat',idempotencyKey:'block-seat',partyId:blocker.id,
    partyKind:'walkin',expectedVersion:1,tableIds:[1]
  });
  const largeCreate = await sendCommand(stub,session,createWalkin('large','Large',8));
  const large = (await largeCreate.json()).snapshot.walkins.find(row => row.name === 'Large');
  await sendCommand(stub,session,{
    type:'party.confirmTablePlan',idempotencyKey:'confirm-large',partyId:large.id,
    partyKind:'walkin',expectedVersion:1
  });
  const failed = await sendCommand(stub,session,{
    type:'party.seat',idempotencyKey:'seat-large',partyId:large.id,
    partyKind:'walkin',expectedVersion:2,tableIds:[1,2]
  });
  expect(failed.status).toBe(409);
  const current = await snapshot(stub,session);
  const body = await current.json();
  expect(body.snapshot.occupancies.map(row => row.tableId)).toEqual([1]);
  expect(body.snapshot.walkins.find(row => row.id === large.id).status).toBe('waiting');
});

test('stale table clear leaves the occupancy untouched', async () => {
  const stub = room('commands-stale-clear');
  const session = await staffSession(stub);
  const created = await sendCommand(stub,session,createWalkin('walkin','Table guest'));
  const party = (await created.json()).snapshot.walkins[0];
  await sendCommand(stub,session,{
    type:'party.seat',idempotencyKey:'seat',partyId:party.id,
    partyKind:'walkin',expectedVersion:1,tableIds:[9]
  });
  const clear = await sendCommand(stub,session,{
    type:'table.clear',idempotencyKey:'clear',tableId:9,expectedVersion:2
  });
  expect(clear.status).toBe(409);
  const current = await snapshot(stub,session);
  expect((await current.json()).snapshot.occupancies).toHaveLength(1);
});

test('client restaurant identifiers cannot escape the configured room scope', async () => {
  const stub = room('commands-scope');
  const session = await staffSession(stub);
  const response = await sendCommand(stub,session,createWalkin('scope','Scoped',2,{
    restaurantId:'another-restaurant'
  }));
  expect(response.status).toBe(200);
  const restaurantIds = await runInDurableObject(stub, async (_instance,state) => [
    ...state.storage.sql.exec('SELECT DISTINCT restaurant_id FROM walkins')
  ].map(row => row.restaurant_id));
  expect(restaurantIds).toEqual(['centre-street']);
});

test('authorized writes require exact Origin and session CSRF', async () => {
  const stub = room('commands-request-security');
  const session = await staffSession(stub);
  const foreign = await sendCommand(stub,session,createWalkin('foreign','Foreign'), 'https://evil.example');
  const badCsrf = await sendCommand(stub,{...session,csrf:'wrong'},createWalkin('csrf','CSRF'));
  expect(foreign.status).toBe(403);
  expect(await foreign.json()).toMatchObject({code:'ORIGIN_REJECTED'});
  expect(badCsrf.status).toBe(403);
  expect(await badCsrf.json()).toMatchObject({code:'CSRF_REJECTED'});
});

test('snapshot persists after the Durable Object instance is evicted', async () => {
  const stub = room('commands-persistence');
  const session = await staffSession(stub);
  await sendCommand(stub,session,createWalkin('persist','Persistent'));
  await abortAllDurableObjects();
  const reloaded = await snapshot(room('commands-persistence'),session);
  expect(reloaded.status).toBe(200);
  expect((await reloaded.json()).snapshot.walkins[0].name).toBe('Persistent');
});
