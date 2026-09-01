import test from 'node:test';
import assert from 'node:assert/strict';
import { RESTAURANT_TABLES } from '../../src/domain/tables.js';
import * as scheduler from '../../src/domain/scheduler.js';

const { canSeatWithoutReservationConflict, findBestTableCombination, recommendWalkInSeat } = scheduler;

const at = (h,m=0) => new Date(2026,7,31,h,m).getTime();

test('fixed tables total 40 seats', () => {
  assert.deepEqual(RESTAURANT_TABLES.map(t => [t.id,t.capacity]), [[1,4],[2,4],[3,4],[4,6],[5,6],[6,4],[7,4],[8,4],[9,2],[10,2]]);
  assert.equal(RESTAURANT_TABLES.reduce((sum,t)=>sum+t.capacity,0),40);
});

test('two guests prefer a two-seat table', () => assert.deepEqual(findBestTableCombination(2, RESTAURANT_TABLES).map(t=>t.id), [9]));
test('four guests prefer a four-seat table', () => assert.deepEqual(findBestTableCombination(4, RESTAURANT_TABLES).map(t=>t.id), [1]));
test('six guests prefer a six-seat table', () => assert.deepEqual(findBestTableCombination(6, RESTAURANT_TABLES).map(t=>t.id), [4]));
test('eight guests use two four-seat tables', () => {
  const result=findBestTableCombination(8,RESTAURANT_TABLES);
  assert.equal(result.length,2); assert.equal(result.reduce((s,t)=>s+t.capacity,0),8);
});
test('17+ guests are manual', () => assert.deepEqual(findBestTableCombination(17, RESTAURANT_TABLES), []));

test('later two-person walk-in can bypass earlier six-person party when only a two-top fits', () => {
  const occupancies=RESTAURANT_TABLES.filter(t=>t.id!==9).map(t=>({tableId:t.id, expectedEndAt:at(20)}));
  const walkins=[
    {id:'a',name:'A',partySize:6,createdAt:at(18),status:'waiting'},
    {id:'b',name:'B',partySize:2,createdAt:at(18,10),status:'waiting'}
  ];
  const rec=recommendWalkInSeat({now:at(18,20),walkins,reservations:[],occupancies});
  assert.equal(rec.walkInId,'b'); assert.deepEqual(rec.tableIds,[9]);
});

test('recommendation protects future capacity for an imminent reservation', () => {
  const occupancies=RESTAURANT_TABLES.filter(t=>![1,9,10].includes(t.id)).map(t=>({tableId:t.id, expectedEndAt:at(20)}));
  const reservations=[{id:'r1',name:'Reserved',partySize:4,reservedAt:at(19),status:'confirmed'}];
  const walkins=[{id:'w1',name:'Walk',partySize:2,createdAt:at(18),status:'waiting'}];
  const rec=recommendWalkInSeat({now:at(18,20),walkins,reservations,occupancies});
  assert.deepEqual(rec.tableIds,[9]);
});

test('unnamed walk-ins receive the next readable anonymous number', () => {
  const result = typeof scheduler.nextAnonymousWalkInName === 'function'
    ? scheduler.nextAnonymousWalkInName([
        {name:'无名字客人 #1'},
        {name:'Amy'},
        {name:'无名客人 #3'}
      ])
    : undefined;

  assert.equal(result, '无名客人 #4');
});

test('legacy anonymous guest names use the shorter display label', () => {
  const normalize = scheduler.normalizeAnonymousGuestName;

  assert.equal(typeof normalize === 'function' ? normalize('无名字客人 #2') : undefined, '无名客人 #2');
  assert.equal(typeof normalize === 'function' ? normalize('Ricky') : undefined, 'Ricky');
});

test('party lookup preserves whether a draggable row is a reservation', () => {
  const walkin = {id:'w1',name:'Walk-in'};
  const reservation = {id:'r1',name:'Reserved'};
  const find = scheduler.findPartyWithKind;

  assert.deepEqual(typeof find === 'function'
    ? find({walkins:[walkin],reservations:[reservation]}, 'r1')
    : undefined, {party:reservation,kind:'reservation'});
});

test('a seven-person walk-in is not recommended until table joining is confirmed', () => {
  const base={id:'large',name:'Large',partySize:7,createdAt:at(18),status:'waiting'};
  const before=recommendWalkInSeat({now:at(18,10),walkins:[base],reservations:[],occupancies:[]});
  const after=recommendWalkInSeat({now:at(18,10),walkins:[{...base,tablePlanConfirmed:true}],reservations:[],occupancies:[]});

  assert.equal(before, null);
  assert.equal(after.walkInId, 'large');
  assert.equal(after.tableIds.length, 2);
});

test('reservations on a later day do not block a walk-in today', () => {
  const later=new Date(2026,8,3,18).getTime();
  const reservations=[
    {id:'r1',partySize:16,reservedAt:later,status:'confirmed',tablePlanConfirmed:true},
    {id:'r2',partySize:16,reservedAt:later,status:'confirmed',tablePlanConfirmed:true},
    {id:'r3',partySize:9,reservedAt:later,status:'confirmed',tablePlanConfirmed:true}
  ];

  assert.equal(canSeatWithoutReservationConflict({
    now:at(17),
    proposedTableIds:[9],
    reservations,
    occupancies:[]
  }), true);
});

test('active reservations are split into today and upcoming local dates', () => {
  const now=new Date(2026,7,31,12).getTime();
  const result = typeof scheduler.partitionReservationsByDay === 'function'
    ? scheduler.partitionReservationsByDay([
        {id:'today',reservedAt:new Date(2026,7,31,18).getTime()},
        {id:'tomorrow',reservedAt:new Date(2026,8,1,18).getTime()},
        {id:'later',reservedAt:new Date(2026,8,3,18).getTime()}
      ], now)
    : {};

  assert.deepEqual(result.today?.map(r=>r.id), ['today']);
  assert.deepEqual(result.upcoming?.map(r=>r.id), ['tomorrow','later']);
});

test('reservation summary reports both groups and guests', () => {
  const summarize = scheduler.summarizeReservations;
  const result = typeof summarize === 'function'
    ? summarize([{partySize:2},{partySize:7},{partySize:4}])
    : undefined;

  assert.deepEqual(result, {groupCount:3, guestCount:13});
});

test('today reservation preview keeps the dashboard to five rows', () => {
  const reservations = Array.from({length: 7}, (_, index) => ({id:`r${index + 1}`}));
  const preview = typeof scheduler.buildTodayReservationPreview === 'function'
    ? scheduler.buildTodayReservationPreview(reservations)
    : undefined;

  assert.deepEqual(preview, {
    reservations: reservations.slice(0, 5),
    totalCount: 7,
    hasMore: true
  });
});

test('future reservation stats include empty dates for the next fourteen days', () => {
  const buildStats = scheduler.buildUpcomingReservationStats;
  const referenceTime = new Date(2026,7,31,12).getTime();
  const reservations = [
    {id:'tomorrow-a',partySize:2,reservedAt:new Date(2026,8,1,18).getTime()},
    {id:'tomorrow-b',partySize:4,reservedAt:new Date(2026,8,1,19).getTime()},
    {id:'day-three',partySize:7,reservedAt:new Date(2026,8,3,18).getTime()},
    {id:'outside-window',partySize:10,reservedAt:new Date(2026,8,15,18).getTime()}
  ];
  const result = typeof buildStats === 'function'
    ? buildStats(reservations, referenceTime, 14)
    : [];

  assert.equal(result.length, 14);
  assert.deepEqual(result.slice(0,3).map(day=>({
    date:new Date(day.dateStart).getDate(),
    groups:day.groupCount,
    guests:day.guestCount
  })), [
    {date:1,groups:2,guests:6},
    {date:2,groups:0,guests:0},
    {date:3,groups:1,guests:7}
  ]);
  assert.equal(result.some(day=>day.reservations.some(r=>r.id==='outside-window')), false);
});

test('editing a reservation preserves or resets table confirmation based on party-size changes', () => {
  const applyEdit = scheduler.applyReservationEdit;
  const original = {id:'r1',name:'Ricky',phone:'111',partySize:7,reservedAt:at(19),status:'confirmed',tablePlanConfirmed:true};
  const timeOnly = typeof applyEdit === 'function'
    ? applyEdit(original,{name:'Ricky',phone:'222',partySize:7,reservedAt:at(20)})
    : undefined;
  const larger = typeof applyEdit === 'function'
    ? applyEdit(original,{name:'Ricky',phone:'111',partySize:8,reservedAt:at(20)})
    : undefined;
  const smaller = typeof applyEdit === 'function'
    ? applyEdit(original,{name:'Ricky',phone:'111',partySize:6,reservedAt:at(20)})
    : undefined;

  assert.equal(timeOnly?.tablePlanConfirmed, true);
  assert.equal(timeOnly?.status, 'confirmed');
  assert.equal(timeOnly?.phone, '222');
  assert.equal(larger?.tablePlanConfirmed, false);
  assert.equal(smaller?.tablePlanConfirmed, true);
});

test('walk-in wait duration includes live seconds and rolls into hours', () => {
  const format = scheduler.formatWaitDuration;
  const startedAt = new Date(2026,7,31,18).getTime();

  assert.equal(typeof format === 'function' ? format(startedAt, startedAt + 7_000) : undefined, '0m 07s');
  assert.equal(typeof format === 'function' ? format(startedAt, startedAt + 222_000) : undefined, '3m 42s');
  assert.equal(typeof format === 'function' ? format(startedAt, startedAt + 3_912_000) : undefined, '1h 05m 12s');
});

test('contacting a walk-in starts the notified return window', () => {
  const walkin = {id:'w1',name:'TTT',status:'waiting',createdAt:1000};
  const contactedAt = 5000;
  const result = typeof scheduler.markWalkInNotified === 'function'
    ? scheduler.markWalkInNotified(walkin, contactedAt)
    : undefined;

  assert.deepEqual(result, {
    id:'w1',
    name:'TTT',
    status:'notified',
    createdAt:1000,
    notifiedAt:5000
  });
  assert.equal(walkin.status, 'waiting');
});

test('the notified return window expires at five minutes', () => {
  const notifiedAt = at(18);
  const state = scheduler.notificationWindowState;

  assert.deepEqual(typeof state === 'function'
    ? state({status:'notified',notifiedAt}, notifiedAt + 299_999)
    : undefined, {isNotified:true,elapsedMs:299_999,expired:false});
  assert.deepEqual(typeof state === 'function'
    ? state({status:'notified',notifiedAt}, notifiedAt + 300_000)
    : undefined, {isNotified:true,elapsedMs:300_000,expired:true});
});

test('seat recommendation moves to the next party after notification expires', () => {
  const referenceTime = at(18,10);
  const walkins = [
    {id:'expired',name:'First',partySize:2,createdAt:at(18),status:'notified',notifiedAt:referenceTime-300_000},
    {id:'next',name:'Second',partySize:2,createdAt:at(18,5),status:'waiting'}
  ];
  const recommendation = recommendWalkInSeat({now:referenceTime,walkins,reservations:[],occupancies:[]});

  assert.equal(recommendation.walkInId, 'next');
});

test('dining starts at a fixed time ten minutes after seating', () => {
  const seatedAt = new Date(2026, 7, 31, 18, 3, 5).getTime();
  const start = typeof scheduler.diningStartsAt === 'function'
    ? scheduler.diningStartsAt(seatedAt)
    : undefined;

  assert.equal(start, new Date(2026, 7, 31, 18, 13, 5).getTime());
});

test('table clock time includes seconds in 24-hour format', () => {
  const at = new Date(2026, 7, 31, 18, 13, 5).getTime();
  const formatted = typeof scheduler.formatTableClockTime === 'function'
    ? scheduler.formatTableClockTime(at)
    : undefined;

  assert.equal(formatted, '18:13:05');
});

test('dragging a party to a free table seats only when capacity fits', () => {
  const mode = scheduler.tableDropMode;
  const table={id:9,capacity:2};

  assert.equal(typeof mode === 'function' ? mode({partySize:2},table,[]) : undefined, 'seat');
  assert.equal(typeof mode === 'function' ? mode({partySize:5},{id:1,capacity:4},[]) : undefined, 'blocked');
  assert.equal(typeof mode === 'function' ? mode({partySize:2},table,[9]) : undefined, 'blocked');
});

test('dragging a confirmed large party starts multi-table selection', () => {
  const mode = scheduler.tableDropMode;
  const table={id:1,capacity:4};

  assert.equal(typeof mode === 'function' ? mode({partySize:7,tablePlanConfirmed:false},table,[]) : undefined, 'blocked');
  assert.equal(typeof mode === 'function' ? mode({partySize:7,tablePlanConfirmed:true},table,[]) : undefined, 'multi');
});
