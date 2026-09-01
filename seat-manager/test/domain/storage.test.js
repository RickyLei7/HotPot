import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalRepository } from '../../src/data/local-repository.js';
import { COMMAND_TYPES } from '../../src/shared/contracts.js';

test('local repository saves and loads the preserved snapshot shape', async () => {
  const mem=new Map();
  const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  const repo=createLocalRepository(storage,{key:'test-key'});
  const snapshot={walkins:[{id:'1'}],reservations:[],occupancies:[],revision:0};
  await repo.save(snapshot);
  assert.deepEqual(await repo.load(),snapshot);
});

test('local repository applies authoritative commands, persists, and publishes snapshots', async () => {
  const mem=new Map();
  const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  const repo=createLocalRepository(storage,{
    key:'test-key',clock:()=>123,uid:()=> 'generated-1'
  });
  const observed=[];
  const unsubscribe=repo.subscribe(snapshot=> observed.push(snapshot));

  const output=await repo.command({
    type:COMMAND_TYPES.CREATE_WALKIN,idempotencyKey:'local-1',
    name:'Local guest',phone:'403-555-0100',partySize:2
  });

  assert.equal(output.snapshot.revision,1);
  assert.equal(output.snapshot.walkins[0].createdAt,123);
  assert.deepEqual(await repo.load(),output.snapshot);
  assert.deepEqual(observed,[output.snapshot]);

  unsubscribe();
  await repo.command({
    type:COMMAND_TYPES.CREATE_WALKIN,idempotencyKey:'local-2',partySize:3
  });
  assert.equal(observed.length,1);
});
