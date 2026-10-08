import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const code = await readFile(new URL('../public/site-events.js', import.meta.url), 'utf8');
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};
function visit(path, referrer, localStorage, sessionStorage, status = 'confirmed') {
  const listeners = new Map();
  const link = {
    href: 'https://reservation.centrestjhotpot.ca/book', textContent: 'Reserve',
    getAttribute(key) { return this[key] || ''; },
    setAttribute(key, value) { this[key] = value; },
    hasAttribute(key) { return Object.hasOwn(this, key); },
    closest: () => null, classList: { contains: () => false },
  };
  const location = new URL(path, 'https://centrestjhotpot.ca');
  const window = {
    location, localStorage, sessionStorage,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener() {},
  };
  const document = {
    referrer, readyState: 'loading', documentElement: { lang: 'en-CA' },
    querySelectorAll: selector => selector === 'a[href]' ? [link] : [],
    querySelector: selector => selector === 'a[data-reservation-launcher]' ? link : null,
    addEventListener() {}, body: { classList: { toggle() {} } },
  };
  vm.runInNewContext(code, { window, document, URL, URLSearchParams, Date });
  listeners.get('hotpot:booking-completed')({ detail: { status, partySize: 4 } });
  const event = window.dataLayer.find(entry => entry[0] === 'event' && entry[1] === 'online_booking_completed');
  return { url: new URL(link.href), event: event?.[2], events: window.dataLayer, meta: window.fbq.queue };
}

test('source and original landing survive internal navigation and reach booking and completion', () => {
  for (const [referrer, source, medium] of [
    ['https://www.google.com/', 'google', 'organic'],
    ['https://l.instagram.com/', 'instagram', 'social'],
    ['https://example.com/', 'example.com', 'referral'],
  ]) {
    const local = storage(), session = storage();
    visit('/', referrer, local, session);
    const result = visit('/menu/', 'https://centrestjhotpot.ca/', local, session);
    assert.equal(result.url.searchParams.get('source'), source);
    assert.equal(result.url.searchParams.get('medium'), medium);
    assert.equal(result.url.searchParams.get('landingPage'), '/');
    assert.equal(result.event.booking_source, source);
    assert.equal(result.event.party_size, 4);
  }
});

test('paid source survives navigation with local storage denied, without sending click IDs to analytics', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  const session = storage();
  visit('/?gclid=test_click&utm_campaign=search', '', blocked, session);
  const result = visit('/menu/', 'https://centrestjhotpot.ca/', blocked, session);
  assert.equal(result.url.searchParams.get('source'), 'google');
  assert.equal(result.url.searchParams.get('medium'), 'cpc');
  assert.equal(result.url.searchParams.get('clickId'), 'test_click');
  assert.equal(result.event.booking_source, 'google');
  assert.equal(JSON.stringify(result.event).includes('test_click'), false);
});

test('expired or malformed natural-source caches do not receive booking credit', () => {
  for (const raw of ['invalid JSON', JSON.stringify({ capturedAt: Date.now() - 31 * 60 * 1000, landingPage: '/', data: { campaign_source: 'google', campaign_medium: 'organic' } })]) {
    const session = storage();
    session.setItem('hotpot_session_source_v1', raw);
    assert.equal(visit('/menu/', '', storage(), session).url.searchParams.get('source'), 'direct');
  }
});

test('existing paid attribution still survives a new tab and a new tagged campaign replaces it', () => {
  const local = storage();
  visit('/?utm_source=instagram&utm_medium=paid_social&utm_campaign=first', '', local, storage());
  const returning = visit('/menu/', '', local, storage());
  assert.equal(returning.url.searchParams.get('source'), 'instagram');
  assert.equal(returning.url.searchParams.get('campaignName'), 'first');
  const next = visit('/?gclid=second_click&utm_campaign=second', '', local, storage());
  assert.equal(next.url.searchParams.get('source'), 'google');
  assert.equal(next.url.searchParams.get('campaignName'), 'second');
});

test('the natural-source session cache does not extend the paid attribution window', () => {
  const local = storage(), session = storage();
  visit('/?gclid=old_click', '', local, session);
  for (const store of [local, session]) {
    const record = JSON.parse(store.getItem('hotpot_campaign_attribution_v3'));
    record.capturedAt = Date.now() - 31 * 24 * 60 * 60 * 1000;
    store.setItem('hotpot_campaign_attribution_v3', JSON.stringify(record));
  }
  assert.equal(visit('/menu/', 'https://centrestjhotpot.ca/', local, session).url.searchParams.get('source'), 'direct');
});

test('Facebook click IDs alone remain social, while explicitly marked ads keep paid credit', () => {
  const social=visit('/?fbclid=social_click', '', storage(), storage());
  assert.equal(social.url.searchParams.get('medium'),'social');
  const paid=visit('/?fbclid=paid_click&utm_source=instagram&utm_medium=paid_social&utm_campaign=pinned', '', storage(), storage());
  assert.equal(paid.url.searchParams.get('source'),'instagram');
  assert.equal(paid.url.searchParams.get('medium'),'paid_social');
});


test('pending applications keep attribution and people without completed-booking conversions', () => {
  const result=visit('/?utm_source=instagram&utm_medium=paid_social&utm_campaign=test', '', storage(), storage(), 'pending');
  const submitted=result.events.find(entry=>entry[0]==='event'&&entry[1]==='online_booking_submitted');
  assert.equal(submitted[2].party_size,4);
  assert.equal(submitted[2].booking_source,'instagram');
  assert.equal(submitted[2].booking_status,'pending');
  assert.equal(result.event,undefined);
  assert.equal(result.events.some(entry=>entry[1]==='reservation_completed'),false);
  assert.equal(result.meta.some(entry=>entry[1]==='Schedule'),false);
  assert.equal(result.meta.some(entry=>entry[1]==='ReservationRequest'),true);
});

test('immediately confirmed bookings emit a single Schedule with booked party size', () => {
  const result=visit('/?gclid=test_click', '', storage(), storage());
  assert.equal(result.event.booking_status,'confirmed');
  const schedules=result.meta.filter(entry=>entry[1]==='Schedule');
  assert.equal(schedules.length,1);
  assert.equal(schedules[0][2].party_size,4);
});
