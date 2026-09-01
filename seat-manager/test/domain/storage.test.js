import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalRepository } from '../../src/data/local-repository.js';

test('local repository saves and loads the preserved snapshot shape', async () => {
  const mem=new Map();
  const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};
  const repo=createLocalRepository(storage,'test-key');
  const snapshot={walkins:[{id:'1'}],reservations:[],occupancies:[]};
  await repo.save(snapshot);
  assert.deepEqual(await repo.load(),snapshot);
});
