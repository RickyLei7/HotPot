import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RepositoryError } from '../../src/shared/contracts.js';
import { createStaffCommands, createWorkflowController } from '../../src/client/workflows.js';

test('staff action builders map every reviewed workflow to one versioned command',()=>{
  let sequence=0;
  const commands=createStaffCommands({uid:()=>`key-${++sequence}`});
  const walkin={id:'w1',version:2};
  const reservation={id:'r1',version:3};
  const occupancy={tableId:9,version:4};
  assert.deepEqual(commands.createWalkin({name:'A',phone:'1',partySize:2}),{
    type:'walkin.create',idempotencyKey:'key-1',name:'A',phone:'1',partySize:2
  });
  assert.deepEqual(commands.notifyWalkin(walkin),{
    type:'walkin.notify',idempotencyKey:'key-2',id:'w1',expectedVersion:2
  });
  assert.deepEqual(commands.cancelWalkin(walkin),{
    type:'walkin.cancel',idempotencyKey:'key-3',id:'w1',expectedVersion:2
  });
  assert.deepEqual(commands.createReservation({name:'R',phone:'2',partySize:4,reservedAt:10}),{
    type:'reservation.create',idempotencyKey:'key-4',name:'R',phone:'2',partySize:4,reservedAt:10
  });
  assert.deepEqual(commands.editReservation(reservation,{name:'E',phone:'3',partySize:5,reservedAt:11}),{
    type:'reservation.edit',idempotencyKey:'key-5',id:'r1',expectedVersion:3,
    name:'E',phone:'3',partySize:5,reservedAt:11
  });
  for(const [status,key] of [['arrived','key-6'],['no-show','key-7'],['cancelled','key-8']]) {
    assert.deepEqual(commands.reservationStatus(reservation,status),{
      type:'reservation.status',idempotencyKey:key,id:'r1',expectedVersion:3,status
    });
  }
  assert.deepEqual(commands.confirmTablePlan(walkin,'walkin'),{
    type:'party.confirmTablePlan',idempotencyKey:'key-9',partyId:'w1',
    partyKind:'walkin',expectedVersion:2
  });
  assert.deepEqual(commands.seatParty(reservation,'reservation',[1,2],true),{
    type:'party.seat',idempotencyKey:'key-10',partyId:'r1',partyKind:'reservation',
    expectedVersion:3,tableIds:[1,2],protectFutureReservations:true
  });
  assert.deepEqual(commands.clearTable(occupancy),{
    type:'table.clear',idempotencyKey:'key-11',tableId:9,expectedVersion:4
  });
});

test('successful command publishes authoritative state then clears through onSuccess',async()=>{
  const events=[];
  const controller=createWorkflowController({
    repository:{command:async command=>({snapshot:{revision:2},result:{revision:2,command}})},
    getConnectionState:()=> 'online',
    onSnapshot:snapshot=>events.push(['snapshot',snapshot]),
    onSuccess:result=>events.push(['success',result]),
    onError:error=>events.push(['error',error])
  });
  const command={type:'walkin.create',idempotencyKey:'create-1'};
  assert.equal(await controller.submit(command),true);
  assert.deepEqual(events.map(event=>event[0]),['snapshot','success']);
  assert.equal(await controller.retry(),false);
});

test('failed reservation save keeps its command and retries the exact object',async()=>{
  const calls=[];let operationError=null;
  const command={type:'reservation.create',idempotencyKey:'create-1',name:'Jessica'};
  const controller=createWorkflowController({
    repository:{command:async value=>{calls.push(value);if(calls.length===1)throw new RepositoryError(503,'RETRY','网络暂时不可用');return {snapshot:{revision:1},result:{}};}},
    getConnectionState:()=> 'online',onSnapshot:()=>{},onSuccess:()=>{},
    onError:error=>{operationError=error}
  });
  assert.equal(await controller.submit(command),false);
  assert.equal(operationError.retry,true);
  assert.equal(await controller.retry(),true);
  assert.equal(calls[0],command);
  assert.equal(calls[1],command);
});

test('conflict publishes server snapshot, disables retry, and requires reconfirmation',async()=>{
  const snapshots=[];let operationError;
  const controller=createWorkflowController({
    repository:{command:async()=>{throw new RepositoryError(409,'TABLE_OCCUPIED','桌位已更新',{snapshot:{revision:8}})}},
    getConnectionState:()=> 'online',onSnapshot:value=>snapshots.push(value),onSuccess:()=>{},
    onError:error=>{operationError=error}
  });
  assert.equal(await controller.submit({type:'party.seat',idempotencyKey:'seat-1'}),false);
  assert.deepEqual(snapshots,[{revision:8}]);
  assert.deepEqual(operationError,{message:'桌位已更新',retry:false,code:'TABLE_OCCUPIED',status:409});
  assert.equal(await controller.retry(),false);
});

test('offline command is not sent and clearPending removes a retained retry',async()=>{
  let calls=0;const errors=[];let online=false;
  const controller=createWorkflowController({
    repository:{command:async()=>{calls+=1;throw new RepositoryError(503,'RETRY','稍后再试')}},
    getConnectionState:()=>online,onSnapshot:()=>{},onSuccess:()=>{},onError:error=>errors.push(error)
  });
  assert.equal(await controller.submit({type:'walkin.create',idempotencyKey:'one'}),false);
  assert.equal(calls,0);
  assert.equal(errors.at(-1).code,'OFFLINE');
  online=true;
  await controller.submit({type:'walkin.create',idempotencyKey:'two'});
  controller.clearPending();
  assert.equal(await controller.retry(),false);
});

test('reviewed iPad service cues remain while direct snapshot mutation is removed',async()=>{
  const [app,styles]=await Promise.all([
    readFile(new URL('../../src/client/app.js',import.meta.url),'utf8'),
    readFile(new URL('../../src/client/styles.css',import.meta.url),'utf8')
  ]);
  for(const marker of [
    'phone-reveal','guest-name','data-notified-started','data-drag-party',
    'Arrived / 已到店',"lateMin<15?'disabled'",'buildTodayReservationPreview'
  ])assert.match(app,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  for(const marker of [
    '@media(min-width:621px) and (max-width:1180px)',
    '.dining-start','white-space:normal','.walkin-panel','.reservations-panel'
  ])assert.ok(styles.includes(marker),`missing ${marker}`);
  assert.doesNotMatch(app,/repo\.save|state\.(?:walkins|reservations|occupancies)\.(?:push|splice)/);
});
