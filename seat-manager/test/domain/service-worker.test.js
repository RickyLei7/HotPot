import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('service worker caches only same-origin application shell files',async()=>{
  const source=await readFile(new URL('../../src/client/sw.js',import.meta.url),'utf8');
  assert.match(source,/const SHELL\s*=\s*\[/);
  assert.match(source,/\/client\/workflows\.js/);
  assert.match(source,/url\.origin\s*!==\s*location\.origin/);
  assert.match(source,/url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(source,/url\.pathname\s*===\s*'\/ws'/);
  const shellText=source.match(/const SHELL\s*=\s*\[([\s\S]*?)\];/)[1];
  assert.doesNotMatch(shellText,/['"]\/api\//);
  assert.doesNotMatch(shellText,/['"]\/ws['"]/);
});

test('manifest and client registration make the same-origin shell installable',async()=>{
  const [manifest,index,app]=await Promise.all([
    readFile(new URL('../../src/client/manifest.webmanifest',import.meta.url),'utf8'),
    readFile(new URL('../../src/client/index.html',import.meta.url),'utf8'),
    readFile(new URL('../../src/client/app.js',import.meta.url),'utf8')
  ]);
  assert.deepEqual(JSON.parse(manifest),{
    name:'Hotpot Seat Manager',short_name:'Seat Manager',start_url:'/',display:'standalone',
    background_color:'#f6f5f2',theme_color:'#9b2f27',
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
  });
  assert.match(index,/rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(index,/rel="apple-touch-icon" href="\/icon\.svg"/);
  assert.match(app,/navigator\.serviceWorker\.register\('\/sw\.js'/);
});
