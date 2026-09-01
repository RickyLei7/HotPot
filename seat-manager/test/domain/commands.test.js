import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMAND_TYPES,
  DomainCommandError,
  emptySnapshot
} from '../../src/shared/contracts.js';
import { applyRestaurantCommand } from '../../src/domain/commands.js';

const NOW = 1_788_264_000_000;
const context = (now = NOW) => {
  let sequence = 0;
  return {now,uid:()=> `generated-${++sequence}`};
};

const walkin = (overrides = {}) => ({
  id:'w1',name:'Walk-in',phone:'403-555-0100',partySize:2,status:'waiting',
  notifiedAt:null,tablePlanConfirmed:true,createdAt:NOW-1_000,updatedAt:NOW-1_000,version:1,
  ...overrides
});

const reservation = (overrides = {}) => ({
  id:'r1',name:'Reservation',phone:'403-555-0200',partySize:4,
  reservedAt:NOW+60_000,status:'confirmed',tablePlanConfirmed:true,
  createdAt:NOW-2_000,updatedAt:NOW-2_000,version:1,...overrides
});

const occupancy = (tableId, overrides = {}) => ({
  tableId,partyId:'old',partyKind:'walkin',partyName:'Old',partySize:2,
  seatedAt:NOW-5_000,expectedEndAt:NOW+5_000_000,createdAt:NOW-5_000,
  updatedAt:NOW-5_000,version:1,...overrides
});

const command = (type, fields = {}) => ({type,idempotencyKey:`key-${type}`,...fields});

test('every command requires an idempotency key', () => {
  assert.throws(
    () => applyRestaurantCommand(emptySnapshot(), {type:COMMAND_TYPES.CREATE_WALKIN,partySize:2}, context()),
    error => error instanceof DomainCommandError && error.code === 'IDEMPOTENCY_REQUIRED'
  );
});

test('create Walk-in uses server fields and the next normalized anonymous number', () => {
  const snapshot = {
    walkins:[walkin({id:'old-1',name:'无名字客人 #4'})],reservations:[],occupancies:[],revision:7
  };
  const output = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.CREATE_WALKIN, {
    name:'  ',phone:' 403-555-0300 ',partySize:7,createdAt:1,status:'seated'
  }), context());

  assert.equal(snapshot.walkins.length, 1, 'input snapshot must stay immutable');
  assert.deepEqual(output.snapshot.walkins[1], {
    id:'generated-1',name:'无名客人 #5',phone:'403-555-0300',partySize:7,
    status:'waiting',notifiedAt:null,tablePlanConfirmed:false,
    createdAt:NOW,updatedAt:NOW,version:1
  });
  assert.equal(output.snapshot.revision, 8);
  assert.deepEqual(output.writes, [{entity:'walkin',operation:'upsert',record:output.snapshot.walkins[1]}]);
});

test('notify Walk-in records only the server notification time and increments its version', () => {
  const snapshot = {walkins:[walkin()],reservations:[],occupancies:[],revision:1};
  const output = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.NOTIFY_WALKIN, {
    id:'w1',expectedVersion:1,notifiedAt:1
  }), context());
  assert.deepEqual(output.snapshot.walkins[0], {
    ...walkin(),status:'notified',notifiedAt:NOW,updatedAt:NOW,version:2
  });
  assert.equal(snapshot.walkins[0].status, 'waiting');
});

test('cancel Walk-in marks it left and rejects a stale version', () => {
  const snapshot = {walkins:[walkin({version:3})],reservations:[],occupancies:[],revision:3};
  assert.throws(
    () => applyRestaurantCommand(snapshot, command(COMMAND_TYPES.CANCEL_WALKIN, {id:'w1',expectedVersion:2}), context()),
    error => error.code === 'STALE_VERSION' && error.status === 409
  );
  const output = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.CANCEL_WALKIN, {id:'w1',expectedVersion:3}), context());
  assert.equal(output.snapshot.walkins[0].status, 'left');
  assert.equal(output.snapshot.walkins[0].version, 4);
});

test('create reservation validates its name and uses confirmed status', () => {
  assert.throws(
    () => applyRestaurantCommand(emptySnapshot(), command(COMMAND_TYPES.CREATE_RESERVATION, {
      name:' ',partySize:4,reservedAt:NOW+60_000
    }), context()),
    error => error.code === 'RESERVATION_NAME_REQUIRED'
  );
  const output = applyRestaurantCommand(emptySnapshot(), command(COMMAND_TYPES.CREATE_RESERVATION, {
    name:' Jessica ',phone:' 403-555-0400 ',partySize:8,reservedAt:NOW+60_000,status:'arrived'
  }), context());
  assert.deepEqual(output.snapshot.reservations[0], {
    id:'generated-1',name:'Jessica',phone:'403-555-0400',partySize:8,
    reservedAt:NOW+60_000,status:'confirmed',tablePlanConfirmed:false,
    createdAt:NOW,updatedAt:NOW,version:1
  });
});

test('editing a large reservation preserves confirmation until party size changes', () => {
  const start = reservation({partySize:8,tablePlanConfirmed:true});
  const first = applyRestaurantCommand(
    {walkins:[],reservations:[start],occupancies:[],revision:1},
    command(COMMAND_TYPES.EDIT_RESERVATION, {
      id:'r1',expectedVersion:1,name:'Renamed',phone:'403-555-9999',partySize:8,reservedAt:NOW+120_000
    }),
    context()
  );
  assert.equal(first.snapshot.reservations[0].tablePlanConfirmed, true);
  assert.equal(first.snapshot.reservations[0].version, 2);

  const second = applyRestaurantCommand(
    first.snapshot,
    command(COMMAND_TYPES.EDIT_RESERVATION, {
      id:'r1',expectedVersion:2,name:'Renamed',phone:'403-555-9999',partySize:9,reservedAt:NOW+120_000
    }),
    context(NOW+1)
  );
  assert.equal(second.snapshot.reservations[0].tablePlanConfirmed, false);
  assert.equal(second.snapshot.reservations[0].partySize, 9);
});

test('reservation status supports Arrived and enforces the 15-minute no-show grace', () => {
  const reservedAt = NOW-14*60_000;
  const snapshot = {walkins:[],reservations:[reservation({reservedAt})],occupancies:[],revision:1};
  const arrived = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SET_RESERVATION_STATUS, {
    id:'r1',expectedVersion:1,status:'arrived'
  }), context());
  assert.equal(arrived.snapshot.reservations[0].status, 'arrived');

  assert.throws(
    () => applyRestaurantCommand(arrived.snapshot, command(COMMAND_TYPES.SET_RESERVATION_STATUS, {
      id:'r1',expectedVersion:2,status:'no-show'
    }), context()),
    error => error.code === 'NO_SHOW_GRACE_ACTIVE'
  );

  const noShow = applyRestaurantCommand(arrived.snapshot, command(COMMAND_TYPES.SET_RESERVATION_STATUS, {
    id:'r1',expectedVersion:2,status:'no-show'
  }), context(NOW+60_000));
  assert.equal(noShow.snapshot.reservations[0].status, 'no-show');
});

test('reservation status supports cancellation but not direct seated status', () => {
  const snapshot = {walkins:[],reservations:[reservation()],occupancies:[],revision:1};
  assert.throws(
    () => applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SET_RESERVATION_STATUS, {
      id:'r1',expectedVersion:1,status:'seated'
    }), context()),
    error => error.code === 'INVALID_RESERVATION_STATUS'
  );
  const cancelled = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SET_RESERVATION_STATUS, {
    id:'r1',expectedVersion:1,status:'cancelled'
  }), context());
  assert.equal(cancelled.snapshot.reservations[0].status, 'cancelled');
});

test('confirm table plan enables explicit joined-table seating', () => {
  const snapshot = {walkins:[walkin({partySize:8,tablePlanConfirmed:false})],reservations:[],occupancies:[],revision:1};
  const confirmed = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.CONFIRM_TABLE_PLAN, {
    partyId:'w1',partyKind:'walkin',expectedVersion:1
  }), context());
  assert.equal(confirmed.snapshot.walkins[0].tablePlanConfirmed, true);
  assert.equal(confirmed.snapshot.walkins[0].version, 2);

  const seated = applyRestaurantCommand(confirmed.snapshot, command(COMMAND_TYPES.SEAT_PARTY, {
    partyId:'w1',partyKind:'walkin',expectedVersion:2,tableIds:[1,2]
  }), context(NOW+1));
  assert.equal(seated.snapshot.walkins[0].status, 'seated');
  assert.deepEqual(seated.snapshot.occupancies.map(row => row.tableId), [1,2]);
  assert.equal(seated.snapshot.occupancies[0].expectedEndAt, NOW+1+100*60_000);
  assert.deepEqual(seated.writes.map(write => [write.entity,write.operation]), [
    ['walkin','upsert'],['occupancy','upsert'],['occupancy','upsert']
  ]);
});

test('seating rejects an occupied table without changing the input snapshot', () => {
  const snapshot = {walkins:[walkin()],reservations:[],occupancies:[occupancy(9)],revision:1};
  assert.throws(
    () => applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SEAT_PARTY, {
      partyId:'w1',partyKind:'walkin',expectedVersion:1,tableIds:[9]
    }), context()),
    error => error.code === 'TABLE_OCCUPIED' && error.status === 409
  );
  assert.equal(snapshot.walkins[0].status, 'waiting');
  assert.equal(snapshot.occupancies.length, 1);
});

test('manual seating allows a confirmed 17-person party when selected capacity is sufficient', () => {
  const snapshot = {
    walkins:[walkin({partySize:17,tablePlanConfirmed:true})],reservations:[],occupancies:[],revision:1
  };
  const output = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SEAT_PARTY, {
    partyId:'w1',partyKind:'walkin',expectedVersion:1,tableIds:[1,2,4,5]
  }), context());
  assert.equal(output.snapshot.walkins[0].status, 'seated');
  assert.equal(output.snapshot.occupancies.length, 4);
});

test('automatic seating can protect future reservations while manual override remains available', () => {
  const busy = [1,2,3,4,5,6,7,8,10].map(tableId => occupancy(tableId));
  const snapshot = {
    walkins:[walkin()],
    reservations:[reservation({id:'future',partySize:2,reservedAt:NOW+60_000})],
    occupancies:busy,
    revision:1
  };
  assert.throws(
    () => applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SEAT_PARTY, {
      partyId:'w1',partyKind:'walkin',expectedVersion:1,tableIds:[9],protectFutureReservations:true
    }), context()),
    error => error.code === 'FUTURE_RESERVATION_CONFLICT'
  );
  const manual = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.SEAT_PARTY, {
    partyId:'w1',partyKind:'walkin',expectedVersion:1,tableIds:[9]
  }), context());
  assert.equal(manual.snapshot.walkins[0].status, 'seated');
});

test('clear table validates occupancy version and deletes only that table row', () => {
  const snapshot = {walkins:[],reservations:[],occupancies:[occupancy(1),occupancy(2)],revision:2};
  assert.throws(
    () => applyRestaurantCommand(snapshot, command(COMMAND_TYPES.CLEAR_TABLE, {tableId:1,expectedVersion:2}), context()),
    error => error.code === 'STALE_VERSION'
  );
  const output = applyRestaurantCommand(snapshot, command(COMMAND_TYPES.CLEAR_TABLE, {
    tableId:1,expectedVersion:1
  }), context());
  assert.deepEqual(output.snapshot.occupancies.map(row => row.tableId), [2]);
  assert.deepEqual(output.writes, [{entity:'occupancy',operation:'delete',record:{tableId:1}}]);
});

test('party sizes outside 1 through 40 are rejected', () => {
  for (const partySize of [0,41,2.5,'abc']) {
    assert.throws(
      () => applyRestaurantCommand(emptySnapshot(), command(COMMAND_TYPES.CREATE_WALKIN, {partySize}), context()),
      error => error.code === 'INVALID_PARTY_SIZE'
    );
  }
});
