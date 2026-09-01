import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

for(const filename of ['wrangler.jsonc','wrangler.production.jsonc']){
  test(`${filename} sends every request through the security Worker`,async()=>{
    const text=await readFile(new URL(`../../${filename}`,import.meta.url),'utf8');
    const config=JSON.parse(text);
    assert.equal(config.assets?.run_worker_first,true);
  });
}
