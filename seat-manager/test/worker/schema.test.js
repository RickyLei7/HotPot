import { env } from 'cloudflare:workers';
import { runInDurableObject } from 'cloudflare:test';
import { expect, test } from 'vitest';

const walkin = {
  id:'w1',name:'Schema guest',phone:'403-555-0100',partySize:2,
  status:'waiting',notifiedAt:null,tablePlanConfirmed:true,
  createdAt:100,updatedAt:100,version:1
};
const reservation = {
  id:'r1',name:'Reserved guest',phone:'403-555-0200',partySize:8,
  reservedAt:500,status:'confirmed',tablePlanConfirmed:false,
  createdAt:200,updatedAt:200,version:1
};
const occupancy = {
  tableId:9,partyId:'w1',partyKind:'walkin',partyName:'Schema guest',partySize:2,
  seatedAt:300,expectedEndAt:6_300,createdAt:300,updatedAt:300,version:1
};

test('new restaurant room initializes with no QA data', async () => {
  const id = env.RESTAURANT_ROOM.idFromName('schema-empty');
  const stub = env.RESTAURANT_ROOM.get(id);
  const snapshot = await runInDurableObject(stub, async instance => instance.readSnapshotForTest());
  expect(snapshot).toEqual({walkins:[],reservations:[],occupancies:[],revision:0});
});

test('normalized persistence round-trips all snapshot record types', async () => {
  const id = env.RESTAURANT_ROOM.idFromName('schema-roundtrip');
  const stub = env.RESTAURANT_ROOM.get(id);
  const snapshot = await runInDurableObject(stub, async instance => {
    await instance.applyWritesForTest([
      {entity:'walkin',operation:'upsert',record:walkin},
      {entity:'reservation',operation:'upsert',record:reservation},
      {entity:'occupancy',operation:'upsert',record:occupancy}
    ], 1);
    return instance.readSnapshotForTest();
  });
  expect(snapshot).toEqual({walkins:[walkin],reservations:[reservation],occupancies:[occupancy],revision:1});
});

test('targeted writes update and delete only their named rows', async () => {
  const id = env.RESTAURANT_ROOM.idFromName('schema-targeted');
  const stub = env.RESTAURANT_ROOM.get(id);
  const snapshot = await runInDurableObject(stub, async instance => {
    await instance.applyWritesForTest([
      {entity:'walkin',operation:'upsert',record:walkin},
      {entity:'occupancy',operation:'upsert',record:occupancy}
    ], 1);
    await instance.applyWritesForTest([
      {entity:'walkin',operation:'upsert',record:{...walkin,status:'notified',notifiedAt:400,updatedAt:400,version:2}},
      {entity:'occupancy',operation:'delete',record:{tableId:9}}
    ], 2);
    return instance.readSnapshotForTest();
  });
  expect(snapshot).toEqual({
    walkins:[{...walkin,status:'notified',notifiedAt:400,updatedAt:400,version:2}],
    reservations:[],occupancies:[],revision:2
  });
});
