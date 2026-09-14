# Website Reservation Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the existing online reservation flow in a secure, responsive dialog inside `centrestjhotpot.ca`, with a warm one-page form and unchanged telephone-booking options.

**Architecture:** The public website owns a lightweight dialog shell and embeds `/embed/book` from the existing reservation Worker. The reservation origin remains responsible for availability, validation, Turnstile, submission, confirmation, email, and customer records; the parent receives lifecycle messages only and never receives personal information.

**Tech Stack:** Vinext/React 19 website with static GitHub Pages output, plain browser JavaScript and CSS, Cloudflare Worker, SQLite Durable Object, Cloudflare Turnstile, Node test runner, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-website-reservation-modal-design.md`

## Global Constraints

- Existing reservations, customer records, and database schema must not be migrated, deleted, or rewritten.
- `https://reservation.centrestjhotpot.ca/book` remains the direct fallback and structured-data target.
- Existing telephone reservation links to `(403) 455-3188` remain unchanged and usable.
- Only `https://centrestjhotpot.ca` may frame `/embed/book`; every other reservation-system page retains `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- No name, phone, email, booking token, private URL, date, or time may cross the parent/iframe message channel or enter website analytics.
- iPhone uses a full-screen dialog; iPad and desktop use a centered 600–640px dialog.
- Inputs remain at least 16px and interactive targets remain at least 44 CSS pixels.
- English is primary, concise Traditional Chinese is secondary, and all approved warm copy comes from the design spec.
- Date and time use native selects; the ordinary creation flow contains no `Find a time` screen.
- Failed and uncertain submissions preserve input and reuse the original idempotency key.
- Work in both dirty repositories without resetting, cleaning, or committing unrelated user changes. Stage exact files only and inspect the staged file list before every commit.

---

### Task 1: Add a narrowly frameable booking route

**Files:**
- Modify: `.codex-seat-manager-recovered/src/server/worker.js`
- Modify: `.codex-seat-manager-recovered/src/client/sw.js`
- Modify: `.codex-seat-manager-recovered/test/worker/security.test.js`
- Modify: `.codex-seat-manager-recovered/test/domain/service-worker.test.js`

**Interfaces:**
- Consumes: existing `secureAssetResponse(response, options)` and `/book` asset routing.
- Produces: `GET /embed/book`, serving `book.html` with Turnstile enabled, `Cache-Control: no-store`, a single allowed frame ancestor, and no `X-Frame-Options` header.

- [ ] **Step 1: Write failing Worker security tests**

Add an embedded-route case that checks exact framing behavior while proving every existing route stays denied:

```js
test('only the embedded booking route can be framed by the restaurant website',async()=>{
  const embedded=await worker.fetch(new Request(`${ORIGIN}/embed/book`),{
    ASSETS:{fetch:async request=>{
      expect(new URL(request.url).pathname).toBe('/book.html');
      return new Response('<title>Booking</title>');
    }}
  });
  expect(embedded.status).toBe(200);
  expect(embedded.headers.get('Cache-Control')).toBe('no-store');
  expect(embedded.headers.get('Content-Security-Policy')).toContain(
    "frame-ancestors https://centrestjhotpot.ca"
  );
  expect(embedded.headers.get('Content-Security-Policy')).not.toContain("frame-ancestors 'none'");
  expect(embedded.headers.get('X-Frame-Options')).toBeNull();

  for(const path of ['/','/book','/join','/guest.html']){
    const response=await worker.fetch(new Request(`${ORIGIN}${path}`),{
      ASSETS:{fetch:async()=>new Response('ok')}
    });
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  }
});
```

Add `/embed/book` to the service-worker no-cache route assertions.

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
cd .codex-seat-manager-recovered
npx vitest run test/worker/security.test.js
node --test test/domain/service-worker.test.js
```

Expected: the Worker test fails because `/embed/book` does not yet map to `book.html`, and the cache-contract test fails because the new route is absent.

- [ ] **Step 3: Implement route-specific framing headers**

Refactor the response helper without changing the default:

```js
const WEBSITE_ORIGIN='https://centrestjhotpot.ca';
const EMBED_BOOKING_CSP=BOOKING_CSP.replace(
  "frame-ancestors 'none'",
  `frame-ancestors ${WEBSITE_ORIGIN}`
);

function secureAssetResponse(response,{noStore=false,booking=false,embeddedBooking=false}={}){
  const headers=new Headers(response.headers);
  headers.set('Content-Security-Policy',embeddedBooking?EMBED_BOOKING_CSP:booking?BOOKING_CSP:CSP);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','no-referrer');
  if(embeddedBooking)headers.delete('X-Frame-Options');
  else headers.set('X-Frame-Options','DENY');
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  if(noStore)headers.set('Cache-Control','no-store');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
```

Route the dedicated path before the existing `/book` block:

```js
if(url.pathname==='/embed/book'){
  if(request.method!=='GET')return publicPageMethodNotAllowed();
  return secureAssetResponse(
    await env.ASSETS.fetch(new Request(new URL('/book.html',url),request)),
    {noStore:true,booking:true,embeddedBooking:true}
  );
}
```

Add `/embed/book` to the service worker's explicit network-only/no-cache list.

- [ ] **Step 4: Re-run focused tests**

Run the two commands from Step 2.

Expected: both commands pass; `/book` still has `DENY`, and only `/embed/book` permits the production website origin.

- [ ] **Step 5: Commit only Task 1 files in the reservation repository**

```bash
cd .codex-seat-manager-recovered
git add src/server/worker.js test/worker/security.test.js test/domain/service-worker.test.js
git add -p -- src/client/sw.js
git diff --cached --name-only
git diff --cached
git commit -m "feat(booking): add secure website embed route"
```

Expected staged paths: exactly the four paths listed above.

---

### Task 2: Isolate the booking iframe message bridge

**Files:**
- Create: `.codex-seat-manager-recovered/src/client/booking-embed.js`
- Create: `.codex-seat-manager-recovered/test/domain/booking-embed.test.js`
- Modify: `.codex-seat-manager-recovered/scripts/build-client.mjs`
- Modify: `.codex-seat-manager-recovered/test/domain/static-bundle.test.js`

**Interfaces:**
- Consumes: browser `location`, `window.parent`, and `postMessage`.
- Produces: `isEmbeddedBooking(pathname)`, `createBookingBridge(windowObject)`, and copied public asset `/client/booking-embed.js`.

- [ ] **Step 1: Write failing pure bridge tests**

Cover exact route detection, the four permitted message types, and the absence of personal fields:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {createBookingBridge,isEmbeddedBooking} from '../../src/client/booking-embed.js';

test('embedded mode is exact',()=>{
  assert.equal(isEmbeddedBooking('/embed/book'),true);
  for(const path of ['/book','/embed/book/','/embed/booking','/b/']){
    assert.equal(isEmbeddedBooking(path),false);
  }
});

test('bridge sends lifecycle state only to the website origin',()=>{
  const sent=[];
  const fakeWindow={
    location:{pathname:'/embed/book'},
    parent:{postMessage:(message,origin)=>sent.push({message,origin})}
  };
  const bridge=createBookingBridge(fakeWindow);
  bridge.ready();
  bridge.dirty(true);
  bridge.completed('pending');
  bridge.requestClose();
  assert.deepEqual(sent.map(item=>item.origin),Array(4).fill('https://centrestjhotpot.ca'));
  assert.deepEqual(sent.map(item=>item.message.type),[
    'booking:ready','booking:dirty','booking:completed','booking:request-close'
  ]);
  assert.doesNotMatch(JSON.stringify(sent),/name|phone|email|token|manageUrl|reservedAt/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

```bash
cd .codex-seat-manager-recovered
node --test test/domain/booking-embed.test.js
```

Expected: FAIL because `booking-embed.js` does not exist.

- [ ] **Step 3: Implement the bridge as a focused module**

Use a fixed target origin and fixed message construction:

```js
const WEBSITE_ORIGIN='https://centrestjhotpot.ca';
const SOURCE='hotpot-booking';

export const isEmbeddedBooking=pathname=>pathname==='/embed/book';

export function createBookingBridge(windowObject=window){
  const enabled=isEmbeddedBooking(windowObject.location.pathname)&&windowObject.parent!==windowObject;
  const send=(type,detail={})=>{
    if(!enabled)return;
    windowObject.parent.postMessage({source:SOURCE,type,...detail},WEBSITE_ORIGIN);
  };
  return {
    embedded:enabled,
    ready:()=>send('booking:ready'),
    dirty:value=>send('booking:dirty',{dirty:Boolean(value)}),
    completed:status=>send('booking:completed',{status:status==='pending'?'pending':'confirmed'}),
    requestClose:()=>send('booking:request-close')
  };
}
```

Update `build-client.mjs` to copy `src/client/booking-embed.js` to `public/client/booking-embed.js`. Add that exact copy contract to `static-bundle.test.js`.

- [ ] **Step 4: Run bridge and bundle tests**

```bash
cd .codex-seat-manager-recovered
node --test test/domain/booking-embed.test.js test/domain/static-bundle.test.js
npm run build
test -f public/client/booking-embed.js
```

Expected: all tests pass and the built module exists.

- [ ] **Step 5: Commit only Task 2 files**

```bash
cd .codex-seat-manager-recovered
git add src/client/booking-embed.js test/domain/booking-embed.test.js test/domain/static-bundle.test.js
git add -p -- scripts/build-client.mjs
git diff --cached --name-only
git diff --cached
git commit -m "feat(booking): add privacy-safe embed bridge"
```

---

### Task 3: Convert new reservations to the warm one-page form

**Files:**
- Modify: `.codex-seat-manager-recovered/src/client/book.html`
- Modify: `.codex-seat-manager-recovered/src/client/booking-client.js`
- Modify: `.codex-seat-manager-recovered/src/client/booking.css`
- Modify: `.codex-seat-manager-recovered/test/domain/booking-client.test.js`
- Modify: `.codex-seat-manager-recovered/e2e/booking.spec.mjs`

**Interfaces:**
- Consumes: `/api/public/bookings/availability`, the booking bridge from Task 2, existing Turnstile setup, and existing idempotent submission recovery.
- Produces: `refreshAvailability()`, native `#booking-time`, one-page creation state, warm result copy, and lifecycle messages to the website parent.

- [ ] **Step 1: Add failing domain assertions for the new labels and time preservation**

Export a pure helper `retainedBookingTime(slots, selected)` and update label expectations:

```js
test('one-page form keeps a selected time only while it remains available',()=>{
  const slots=[1000,2000];
  assert.equal(retainedBookingTime(slots,2000),2000);
  assert.equal(retainedBookingTime(slots,3000),null);
});

test('guest actions use warm concise wording',()=>{
  assert.equal(bookingSubmitLabel(),'Reserve / 預訂');
  assert.equal(bookingSubmitLabel({requiresReview:true}),'Request this time / 申請此時段');
  assert.equal(bookingSubmitLabel({managing:true}),'Save changes / 儲存修改');
});
```

- [ ] **Step 2: Run the domain test and verify it fails**

```bash
cd .codex-seat-manager-recovered
node --test test/domain/booking-client.test.js
```

Expected: FAIL on the missing helper and old labels.

- [ ] **Step 3: Replace the creation markup with one compact form**

Keep the management/result sections but replace the create-only search grid with this structure:

```html
<section id="booking-create">
  <p class="join-intro">We look forward to welcoming you. <span lang="zh-Hant">期待您的光臨。</span></p>
  <div class="booking-choice-row">
    <div class="join-field">
      <label for="booking-date">Date <span lang="zh-Hant">日期</span></label>
      <select class="join-control" id="booking-date" name="date" required></select>
    </div>
    <div class="join-field">
      <label for="booking-time">Time <span lang="zh-Hant">時間</span></label>
      <select class="join-control" id="booking-time" name="time" required disabled>
        <option value="">Choose a time / 選擇時間</option>
      </select>
    </div>
  </div>
  <fieldset class="join-field booking-party-field">
    <legend>Guests <span lang="zh-Hant">人數</span></legend>
    <div class="join-party-grid" id="booking-party">
      <button type="button" data-party="1">1</button>
      <button type="button" data-party="2">2</button>
      <button type="button" data-party="3">3</button>
      <button type="button" data-party="4">4</button>
      <button type="button" data-party="5">5</button>
      <button type="button" data-party="6">6</button>
    </div>
  </fieldset>
  <div class="join-field"><label for="booking-name">Name <span lang="zh-Hant">姓名</span></label><input class="join-control" id="booking-name" name="name" required maxlength="50" autocomplete="name"></div>
  <div class="join-field"><label for="booking-phone">Mobile <span lang="zh-Hant">電話</span></label><input class="join-control" id="booking-phone" name="phone" required maxlength="24" type="tel" inputmode="tel" autocomplete="tel" placeholder="(403) 555-0100"></div>
  <div class="join-field"><label for="booking-email">Email <span lang="zh-Hant">電郵</span></label><input class="join-control" id="booking-email" name="email" required maxlength="254" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"></div>
  <p class="booking-summary" id="booking-selection" aria-live="polite"></p>
  <p class="booking-note" id="booking-review-note" hidden>We'll confirm this time with you by email. <span lang="zh-Hant">此時段需由餐廳確認，我們會以電郵回覆您。</span></p>
  <div id="booking-challenge"></div>
  <button type="button" class="booking-button join-primary" id="booking-submit">Reserve / 預訂</button>
</section>
```

Retain one compact hold note and one 7-or-more call note. Remove the visible `Find a time`, time-button grid, and long private-link explanation from the creation form.

- [ ] **Step 4: Implement automatic availability refresh without weakening retries**

Import and initialize the bridge:

```js
import {createBookingBridge,isEmbeddedBooking} from './booking-embed.js';
const bridge=createBookingBridge();
const embedded=isEmbeddedBooking(location.pathname);
```

Use a monotonically increasing request generation so stale responses cannot overwrite a newer choice:

```js
let availabilityGeneration=0;

async function refreshAvailability(){
  const generation=++availabilityGeneration;
  const previous=reservedAt;
  message('Checking available times… / 正在查看可訂時段…');
  $('time').disabled=true;
  try{
    const result=await request(`${API}s/availability`,{
      token:managing?token:null,
      body:{date:$('date').value,partySize,deviceId,startedAt,botField:$('form').elements.website.value}
    });
    if(generation!==availabilityGeneration)return;
    availability=result;
    reservedAt=retainedBookingTime(result.slots,previous);
    renderTimeOptions(result,reservedAt);
    $('time').disabled=!result.slots.length;
    updateSelection();
  }catch(error){
    if(generation===availabilityGeneration)message(bookingError(error),true);
  }
}
```

Call `refreshAvailability()` after initial dates load and after every date or party-size change. On time change, set `reservedAt`, derive `requiresReview`, refresh the summary, and mount/reset Turnstile. Keep `pending` and its idempotency key untouched during uncertain retries.

Report lifecycle without personal data:

```js
$('form').addEventListener('input',()=>bridge.dirty(true));
$('form').addEventListener('change',()=>bridge.dirty(true));

function reportCompletion(booking){
  const pending=bookingAwaitingApproval(booking);
  bridge.dirty(false);
  bridge.completed(pending?'pending':'confirmed');
}
```

Call `bridge.ready()` after initialization and `reportCompletion()` only after a successful new-booking response.

- [ ] **Step 5: Apply responsive and embedded CSS**

Add body-mode classes in initialization and style them explicitly:

```js
document.body.classList.toggle('booking-embedded',embedded);
```

```css
.booking-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.booking-embedded{min-height:100%;background:#fff}
.booking-embedded .join-shell{min-height:100%;max-width:none;padding:12px}
.booking-embedded .join-brand{display:none}
.booking-embedded .join-card{border:0;border-radius:0;box-shadow:none;padding:0}
.booking-embedded .join-control{font-size:16px;min-height:44px}
.booking-embedded .booking-button{min-height:48px}
@media(max-width:430px){
  .booking-choice-row{grid-template-columns:1fr 1fr;gap:8px}
  .booking-embedded .join-shell{padding:10px 12px calc(12px + env(safe-area-inset-bottom))}
}
```

The document must have no horizontal overflow at 390px and must remain vertically usable with a 390×600 viewport representing an open keyboard.

- [ ] **Step 6: Rewrite the booking E2E path for the one-page flow**

Replace search-grid interactions with native select expectations:

```js
await page.locator('#booking-date').selectOption(date);
await page.locator('[data-party="4"]').click();
await page.locator('#booking-time option:not([value=""])').first().waitFor();
await page.locator('#booking-time').selectOption(String(slot));
assert.match(await page.locator('#booking-review-note').innerText(),/confirm this time/i);
await page.locator('#booking-name').fill('Test guest');
await page.locator('#booking-phone').fill('4035550100');
await page.locator('#booking-email').fill('guest@example.com');
```

Keep the existing double-click, uncertain-response retry, management-link, edit-conflict, cancellation, XSS, and no-horizontal-overflow assertions. Add screenshots for `/embed/book` at 390×844, 768×1024, 1024×768, and 1280×900.

- [ ] **Step 7: Run focused and full reservation tests**

```bash
cd .codex-seat-manager-recovered
node --test test/domain/booking-client.test.js test/domain/booking-embed.test.js
npm run test
npm run e2e -- --booking-only
```

Expected: every domain and Worker test passes; booking E2E passes all four sizes with no horizontal overflow or runtime errors.

- [ ] **Step 8: Commit only Task 3 files**

Because these files already contain uncommitted approved system work, stage only the new task hunks and inspect the complete staged patch:

```bash
cd .codex-seat-manager-recovered
git add -p -- src/client/book.html src/client/booking-client.js src/client/booking.css test/domain/booking-client.test.js e2e/booking.spec.mjs
git diff --cached --name-only
git diff --cached --check
git diff --cached
git commit -m "feat(booking): simplify guest reservations to one page"
```

If a new hunk cannot be separated safely from a pre-existing change, leave that hunk uncommitted and report it rather than staging unrelated work.

---

### Task 4: Add the website dialog controller without replacing phone booking

**Files:**
- Create: `public/reservation-modal.js`
- Create: `public/reservation-modal.css`
- Modify: `public/site-events.js`
- Modify: `app/site-nav.tsx`
- Modify: `app/layout.tsx`
- Modify: `public/**/*.html` only for the shared `site-events.js` cache-key replacement

**Interfaces:**
- Consumes: booking links whose URL starts with `https://reservation.centrestjhotpot.ca/book` and lifecycle messages from Task 2.
- Produces: `openReservationModal({trigger, language})`, a lazy-loaded same-page dialog, and non-personal `hotpot:booking-completed` events.

- [ ] **Step 1: Create a failing static contract test**

Create `tests/reservation-modal.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';

test('reservation modal keeps direct and telephone fallbacks',async()=>{
  const nav=await readFile(new URL('../app/site-nav.tsx',import.meta.url),'utf8');
  const layout=await readFile(new URL('../app/layout.tsx',import.meta.url),'utf8');
  const events=await readFile(new URL('../public/site-events.js',import.meta.url),'utf8');
  assert.match(nav,/https:\/\/reservation\.centrestjhotpot\.ca\/book/);
  assert.match(layout,/tel:\+14034553188/);
  assert.match(events,/reservation-modal\.js/);
  assert.match(events,/online_booking_click/);
});
```

- [ ] **Step 2: Run the static test and verify it fails**

```bash
node --test tests/reservation-modal.test.mjs
```

Expected: FAIL because `site-events.js` does not load `reservation-modal.js`.

- [ ] **Step 3: Implement the isolated modal module**

Use fixed origins and reject every unrelated message:

```js
const BOOKING_ORIGIN='https://reservation.centrestjhotpot.ca';
const EMBED_URL=`${BOOKING_ORIGIN}/embed/book`;

export function trustedBookingMessage(event,frame){
  return event.origin===BOOKING_ORIGIN
    && event.source===frame.contentWindow
    && event.data?.source==='hotpot-booking';
}
```

`openReservationModal()` must:

- return the existing dialog when already open
- load `/reservation-modal.css?v=20260914` once
- record the trigger and current `scrollY`
- render one `role="dialog"` surface with a visible close button, loading state, fallback link, and sandboxed iframe
- set iframe `src` to `EMBED_URL`, `title` to the current website language, and `sandbox="allow-forms allow-scripts allow-same-origin"`
- accept only the four message types defined in the spec
- never close on backdrop click
- show an in-dialog discard confirmation when `booking:dirty` is true
- lock the body without losing scroll position and restore both body styles and scroll position on close
- restore focus to the triggering Reserve link
- dispatch `hotpot:booking-completed` with only `{status:'confirmed'|'pending'}`
- replace a 15-second loading timeout with retry and direct-page fallback actions

Use a real link for the fallback:

```html
<a href="https://reservation.centrestjhotpot.ca/book">Open booking page / 打開訂位頁面</a>
```

- [ ] **Step 4: Add responsive dialog styling**

The new stylesheet begins with an isolated namespace:

```css
.reservation-dialog-root{position:fixed;inset:0;z-index:1000}
.reservation-dialog-backdrop{position:absolute;inset:0;background:rgba(12,8,7,.78)}
.reservation-dialog{
  position:relative;
  width:min(640px,calc(100vw - 32px));
  height:min(90dvh,900px);
  margin:5dvh auto 0;
  overflow:hidden;
  border:1px solid rgba(246,201,76,.58);
  border-radius:20px;
  background:#fff;
  box-shadow:0 24px 90px rgba(0,0,0,.48);
}
.reservation-dialog iframe{display:block;width:100%;height:100%;border:0}
@media(max-width:600px){
  .reservation-dialog{
    width:100vw;
    height:100dvh;
    margin:0;
    border:0;
    border-radius:0;
    padding-top:env(safe-area-inset-top);
  }
}
```

Keep the close control above the iframe and at least 44×44px. Prevent horizontal overflow at the root and keep the body scroll lock compatible with iOS Safari.

- [ ] **Step 5: Lazy-load the module from the existing booking-click branch**

In `site-events.js`, preserve current analytics and add:

```js
var reservationModalPromise;
function openReservationDialog(event,link){
  event.preventDefault();
  if(!reservationModalPromise){
    reservationModalPromise=import('/reservation-modal.js?v=20260914');
  }
  reservationModalPromise
    .then(function(module){module.openReservationModal({trigger:link,language:pageLanguage()});})
    .catch(function(){window.location.assign(link.href);});
}
```

Call `openReservationDialog(event, link)` after the existing `online_booking_click` analytics event. Do not intercept any `tel:` link. On startup, add `aria-haspopup="dialog"` to matching online-booking links.

Add `aria-haspopup="dialog"` and `data-reservation-launcher` to the source `SiteNav` anchor. Keep its real `href` unchanged.

- [ ] **Step 6: Bump the shared script cache key everywhere**

Change only this exact string in `app/layout.tsx` and every static HTML page:

```text
/site-events.js?v=20260829-conversion
```

to:

```text
/site-events.js?v=20260914-reservation-modal
```

Use a scoped mechanical replacement and verify there are no old occurrences:

```bash
rg -l 'site-events\.js\?v=20260829-conversion' app/layout.tsx public --glob '*.html'
rg -n 'site-events\.js\?v=20260829-conversion' app/layout.tsx public --glob '*.html'
```

Expected after replacement: the second command returns no matches.

- [ ] **Step 7: Run source and build checks**

```bash
node --test tests/reservation-modal.test.mjs
npm run lint
npm run build
```

Expected: test, lint, and build pass. The existing telephone link remains in `app/layout.tsx`, and `Reserve` retains a working direct href.

- [ ] **Step 8: Commit only Task 4 website files**

Stage the new files directly. For already-modified files, stage only the new task hunks and inspect the entire staged patch before committing:

```bash
git add public/reservation-modal.js public/reservation-modal.css tests/reservation-modal.test.mjs
git add -p -- public/site-events.js app/site-nav.tsx app/layout.tsx public/**/*.html
git diff --cached --name-only
git diff --cached --check
git diff --cached
git commit -m "feat(reservations): open online booking inside website"
```

If a new hunk cannot be separated safely from a pre-existing change, leave that hunk uncommitted and report it rather than staging unrelated work.

---

### Task 5: Add cross-origin modal browser coverage

**Files:**
- Create: `scripts/check-reservation-modal.mjs`
- Modify: `package.json`
- Modify: `tests/reservation-modal.test.mjs`
- Modify: `.codex-seat-manager-recovered/e2e/booking.spec.mjs`

**Interfaces:**
- Consumes: website modal assets, `/embed/book`, fixed message origins, and existing booking API mocks.
- Produces: `npm run check:reservation-modal` and cross-origin screenshots for phone, iPad mini portrait/landscape, and desktop.

- [ ] **Step 1: Write a browser check that initially fails**

The script starts the existing static server pattern, intercepts the production iframe URL with a synthetic child document, and tests the modal lifecycle:

```js
const profiles=[
  {name:'iphone',width:390,height:844},
  {name:'ipad-mini-portrait',width:768,height:1024},
  {name:'ipad-mini-landscape',width:1024,height:768},
  {name:'desktop',width:1440,height:900}
];

await page.route('https://reservation.centrestjhotpot.ca/embed/book',route=>route.fulfill({
  contentType:'text/html',
  body:`<!doctype html><button id="dirty">Dirty</button><script>
    parent.postMessage({source:'hotpot-booking',type:'booking:ready'},'${baseUrl}');
    dirty.onclick=()=>parent.postMessage({source:'hotpot-booking',type:'booking:dirty',dirty:true},'${baseUrl}');
  <\/script>`
}));
```

For each profile, assert:

- clicking the online Reserve link does not change `page.url()`
- exactly one iframe opens
- the body is scroll-locked
- backdrop click does not close
- an untrusted-origin message changes nothing
- dirty close shows the discard confirmation
- confirmed close restores the prior `scrollY` and trigger focus
- no horizontal overflow exists
- a `tel:+14034553188` link still exists and is not intercepted

- [ ] **Step 2: Add the package command and run it red**

Add:

```json
"check:reservation-modal": "node scripts/check-reservation-modal.mjs"
```

Run:

```bash
npm run check:reservation-modal
```

Expected before final script completion: FAIL on at least one modal lifecycle assertion.

- [ ] **Step 3: Complete the browser harness and integrate it into site checks**

Finish local server cleanup with `try/finally`, close every browser context, and write screenshots to `reports/reservation-modal/`. Add `npm run check:reservation-modal` to `check:site` before Lighthouse so modal failures stop the pipeline early.

Extend the static contract test to assert every HTML page that contains an online booking link also loads the new `site-events.js` cache key.

- [ ] **Step 4: Test the real embedded child under an allowed parent origin**

In the reservation E2E, intercept `https://centrestjhotpot.ca/embed-test` with a tiny parent page containing:

```html
<iframe src="https://127.0.0.1:8787/embed/book" title="Reservation"></iframe>
<script>
  addEventListener('message',event=>{
    if(event.origin==='https://127.0.0.1:8787')document.body.dataset.lastMessage=event.data.type||'';
  });
</script>
```

Navigate the parent page to the production website origin, exercise the child frame, and assert the frame renders rather than being blocked by CSP. Confirm the child sends `booking:ready`, then complete the mocked booking and confirm `booking:completed` contains only `source`, `type`, and `status`.

- [ ] **Step 5: Run both browser suites**

```bash
npm run check:reservation-modal
cd .codex-seat-manager-recovered
npm run e2e -- --booking-only
```

Expected: both pass on all required viewports and generate readable screenshots.

- [ ] **Step 6: Commit Task 5 in each repository**

Reservation repository:

```bash
cd .codex-seat-manager-recovered
git add -p -- e2e/booking.spec.mjs
git diff --cached --name-only
git diff --cached
git commit -m "test(booking): cover website embed lifecycle"
```

Website repository:

```bash
git add scripts/check-reservation-modal.mjs tests/reservation-modal.test.mjs
git add -p -- package.json
git diff --cached --name-only
git diff --cached
git commit -m "test(reservations): verify responsive booking dialog"
```

---

### Task 6: Run complete local verification and visual review

**Files:**
- Verify only; do not edit files unless a failing check identifies an in-scope defect.
- Review screenshots under `.codex-seat-manager-recovered` E2E artifacts and `reports/reservation-modal/`.

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: a release candidate with automated evidence and user-approved iPhone/iPad layouts.

- [ ] **Step 1: Run the complete reservation suite**

```bash
cd .codex-seat-manager-recovered
npm run build
npm test
npm run e2e
```

Expected: build, all domain tests, all Worker tests, staff E2E, and booking E2E pass.

- [ ] **Step 2: Run the complete relevant website suite**

```bash
npm run lint
npm run build
npm run check:attribution
npm run check:bilingual
npm run check:html
npm run check:reservation-modal
```

Expected: every command passes. Phone-conversion tracking and online-booking tracking both remain present.

- [ ] **Step 3: Inspect screenshots at exact target sizes**

Check all four profiles for:

- readable date/time/native-select labels
- no second horizontal axis
- no content behind the iPhone safe areas
- stable layout with a 390×600 keyboard-reduced viewport
- close button always visible
- iPad dialog centered and no larger than 640px
- warm success and pending copy fully visible
- phone reservation actions still visible on their existing website sections

- [ ] **Step 4: Present iPhone and iPad screenshots for owner approval**

Show at least:

- iPhone initial form
- iPhone keyboard-reduced form
- iPad mini portrait form
- iPad mini landscape form
- confirmed result
- pending-confirmation result

Do not deploy until the owner approves these rendered screens.

---

### Task 7: Back up, deploy in safe order, and verify production

**Files:**
- No source changes expected.
- Do not commit generated secrets, backup data, session cookies, or customer records.

**Interfaces:**
- Consumes: owner-approved release candidate and authenticated reservation export.
- Produces: live `/embed/book`, live website modal, verified fallback links, and recorded rollback identifiers.

- [ ] **Step 1: Capture a verified reservation backup without exposing it in logs**

Use the authenticated staff export from the owner's logged-in device or the established protected export procedure. Save it outside Git with a timestamped filename and verify that it parses as `hotpot-seat-manager-online-v1` with reservations present when production contains reservations.

Do not print the export body or customer fields to the terminal transcript.

- [ ] **Step 2: Record current rollback points**

Record:

- current Cloudflare reservation Worker deployment version
- current website production commit/deployment
- new reservation repository commit range
- new website repository commit range

Do not deploy if either current production identifier cannot be resolved.

- [ ] **Step 3: Deploy the reservation service first**

```bash
cd .codex-seat-manager-recovered
npm run deploy:production
```

Verify with headers only:

```bash
curl -sS -D - -o /dev/null https://reservation.centrestjhotpot.ca/embed/book
curl -sS -D - -o /dev/null https://reservation.centrestjhotpot.ca/book
```

Expected:

- `/embed/book` is 200, no-store, allows only `https://centrestjhotpot.ca` as frame ancestor, and omits `X-Frame-Options`
- `/book` is 200, no-store, retains `frame-ancestors 'none'`, and retains `X-Frame-Options: DENY`

If either check fails, roll back the Worker before changing the website.

- [ ] **Step 4: Deploy the website release**

Use the existing website production workflow after confirming the intended commits are on the deployment branch. Do not include unrelated dirty files. Wait for the GitHub Pages deployment to reach a successful terminal state.

- [ ] **Step 5: Run a non-mutating live smoke test**

On production iPhone and iPad dimensions:

- open the homepage
- click Reserve
- confirm the address bar remains on `centrestjhotpot.ca`
- choose date, 1–6 guests, and an available time
- confirm manual-review wording appears only when applicable
- type test text but do not press the final Reserve action
- close and confirm the discard guard
- reopen and confirm a fresh form
- confirm a telephone reservation action still opens `tel:+14034553188`

Do not create or delete a production reservation during this smoke test.

- [ ] **Step 6: Verify staff data and fallback health**

Confirm:

- the staff system opens and shows the same existing reservation counts as before deployment
- direct `/book` still opens independently
- `/api/session` remains unauthorized without a staff session
- no new database migration ran
- no console error or horizontal overflow appears in the live modal

- [ ] **Step 7: Report release evidence**

Report the live website URL, reservation Worker version, website deployment/commit, test totals, tested viewports, backup verification, and any remaining limitation. Do not call the release complete if the visual approval, backup, or production smoke test is missing.
