import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

test('iPad Mini header controls share one compact row with touchable actions',async t=>{
  const styles=await readFile(new URL('../../src/client/styles.css',import.meta.url),'utf8');
  const browser=await chromium.launch({headless:true});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1133,height:744}});

  await page.setContent(`
    <style>${styles}</style>
    <main class="app-shell">
      <header class="topbar">
        <div class="brand">
          <h1>Hotpot Seat Manager <span>v2026.08.31</span></h1>
          <p>Today · Calgary</p>
        </div>
        <div class="header-controls">
          <div class="session-controls">
            <span class="connection-state online" role="status"><i></i>Online / 在线</span>
            <button class="logout-button" type="button">Logout / 安全退出</button>
          </div>
          <div class="top-actions">
            <button class="btn" type="button">+ Reservation</button>
            <button class="btn primary" type="button">+ Walk-in</button>
          </div>
        </div>
      </header>
    </main>
  `);

  const metrics=await page.locator('.header-controls').evaluate(element=>{
    const controls=[...element.querySelectorAll('.connection-state,.logout-button,.top-actions .btn')];
    const rects=controls.map(control=>control.getBoundingClientRect());
    const statusStyle=getComputedStyle(element.querySelector('.connection-state'));
    return {
      height:element.getBoundingClientRect().height,
      centerSpread:Math.max(...rects.map(rect=>rect.top+rect.height/2))-
        Math.min(...rects.map(rect=>rect.top+rect.height/2)),
      buttonHeights:rects.slice(1).map(rect=>rect.height),
      statusBorder:statusStyle.borderTopWidth,
      statusBackground:statusStyle.backgroundColor
    };
  });

  assert.ok(metrics.height<=52,`expected a compact header row, got ${metrics.height}px`);
  assert.ok(metrics.centerSpread<=1,`expected vertically aligned controls, spread was ${metrics.centerSpread}px`);
  assert.ok(metrics.buttonHeights.every(height=>height>=44),`expected 44px touch targets, got ${metrics.buttonHeights.join(', ')}`);
  assert.equal(metrics.statusBorder,'0px');
  assert.equal(metrics.statusBackground,'rgba(0, 0, 0, 0)');
});
