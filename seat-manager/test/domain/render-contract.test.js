import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('rendered shell preserves iPad readability, status, colors, and overflow safeguards',async()=>{
  const [html,app,styles]=await Promise.all([
    readFile(new URL('../../src/client/index.html',import.meta.url),'utf8'),
    readFile(new URL('../../src/client/app.js',import.meta.url),'utf8'),
    readFile(new URL('../../src/client/styles.css',import.meta.url),'utf8')
  ]);
  assert.match(app,/id="staff-pin"[^>]*inputmode="numeric"[^>]*pattern="\[0-9\]\{4\}"[^>]*maxlength="4"[^>]*autocomplete="off"/);
  for(const text of ['Online / 在线','Reconnecting / 重新连接','Offline / 离线'])assert.ok(app.includes(text));
  assert.match(styles,/\.btn\{min-height:44px/);
  assert.match(styles,/\.walkin-panel\{[^}]*#fff5cf/);
  assert.match(styles,/\.reservations-panel\{[^}]*#e9f5ff/);
  assert.match(styles,/\.guest-name\{[^}]*#fff06a/);
  assert.match(styles,/\.dining-start\{[^}]*white-space:normal[^}]*overflow-wrap:anywhere/);
  assert.match(styles,/@media\(min-width:621px\) and \(max-width:1180px\)/);
  assert.match(html,/rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(app,/serviceWorker\.register\('\/sw\.js'/);
});
