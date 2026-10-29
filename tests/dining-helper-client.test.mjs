import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const code = await readFile(new URL('../public/dining-helper.js', import.meta.url), 'utf8');
const booking = 'https://reservation.centrestjhotpot.ca/book';
const reply = () => ({ language: 'en', topic: 'booking', parts: [{ id: 'booking', text: 'Please use Book Online.', href: booking }] });

class Element {
  constructor() { this.dataset = {}; this.attributes = {}; this.listeners = new Map(); this.children = []; this.hidden = true; this.textContent = ''; }
  addEventListener(name, callback) { this.listeners.set(name, [...(this.listeners.get(name) || []), callback]); }
  async fire(name) { for (const callback of this.listeners.get(name) || []) await callback({ preventDefault() {} }); }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; }
  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
  focus() { this.focused = true; }
  scrollIntoView() {}
}

function client(fetchImpl, language = 'en', analytics) {
  const root = new Element(), form = new Element(), textarea = new Element(), submit = new Element();
  const status = new Element(), answer = new Element(), details = new Element(), book = new Element(), quick = new Element();
  root.dataset.language = language;
  textarea.value = '';
  quick.dataset.helperQuestion = 'How do I book online?';
  const selectors = { '[data-helper-form]':form, '[data-helper-status]':status, '[data-helper-answer]':answer, details, '.dining-helper-book':book };
  root.querySelector = selector => selectors[selector];
  root.querySelectorAll = () => [quick];
  form.querySelector = selector => selector === 'textarea' ? textarea : submit;
  const events = [], requests = [], listeners = new Map();
  const document = {
    readyState: 'complete', querySelectorAll: () => [root], createElement: () => new Element(),
    addEventListener: (name, callback) => listeners.set(name, callback)
  };
  const window = { setTimeout, clearTimeout, gtag:analytics || ((...args) => events.push(args)) };
  vm.runInNewContext(code, { window, document, AbortController, fetch:async (...args) => { requests.push(args); return fetchImpl(...args); } });
  return { root, form, textarea, submit, status, answer, details, book, quick, events, requests, listeners };
}

test('no request before deliberate Ask; quick prompts only fill the input; initialization is idempotent', async () => {
  const c = client(async () => Response.json(reply()));
  assert.equal(c.requests.length, 0);
  assert.equal(c.form.hidden, false);
  await c.quick.fire('click');
  assert.equal(c.textarea.value, 'How do I book online?');
  assert.equal(c.requests.length, 0);
  c.listeners.get('hotpot:page-ready')();
  await c.form.fire('submit');
  assert.equal(c.requests.length, 1);
});

test('successful response safely renders text and hands off to original booking launcher', async () => {
  const c = client(async () => Response.json(reply()));
  c.textarea.value = 'How do I book?';
  await c.form.fire('submit');
  assert.equal(c.requests[0][0], 'https://assistant.centrestjhotpot.ca/ask');
  const options = c.requests[0][1];
  assert.equal(options.credentials, 'omit');
  assert.equal(options.referrerPolicy, 'no-referrer');
  assert.equal(JSON.parse(options.body).question, 'How do I book?');
  assert.equal(c.answer.hidden, false);
  assert.equal(c.answer.children[0].textContent, 'Please use Book Online.');
  const link = c.answer.children[1];
  assert.equal(link.href, booking);
  assert.equal(link.attributes['aria-haspopup'], 'dialog');
  assert.equal(link.dataset.reservationLauncher, '');
  assert.equal(c.answer.focused, true);
  await link.fire('click');
  assert(c.events.some(e => e[1] === 'dining_helper_booking_click'));
  assert(!JSON.stringify(c.events).includes('How do I book?'));
  assert(!c.events.some(e => /completed|conversion/.test(e[1])));
  await c.form.fire('submit');
  assert.deepEqual(JSON.parse(c.requests[1][1].body).context, ['booking']);
});

test('double submits cannot create extra calls and controls recover after completion', async () => {
  let resolve;
  const c = client(() => new Promise(r => { resolve = r; }));
  c.textarea.value = 'How much is AYCE?';
  const first = c.form.fire('submit');
  assert.equal(c.submit.disabled, true);
  await c.form.fire('submit');
  assert.equal(c.requests.length, 1);
  resolve(Response.json(reply()));
  await first;
  assert.equal(c.submit.disabled, false);
  assert.equal(c.root.attributes['aria-busy'], undefined);
});

test('unsafe links and malformed output fall back without rendering untrusted content', async () => {
  for (const href of ['javascript:alert(1)', 'https://evil.example/', '//evil.example', '/admin/']) {
    const c = client(async () => Response.json({ ...reply(), parts: [{ id:'booking', text:'Injected', href }] }));
    c.textarea.value = 'Book online';
    await c.form.fire('submit');
    assert.equal(c.answer.hidden, true);
    assert.equal(c.answer.children.length, 0);
    assert.match(c.status.textContent, /temporarily unavailable/);
    assert.equal(c.submit.disabled, false);
  }
});

test('privacy, quota, network and timeout failures have readable bilingual recovery', async () => {
  for (const lang of ['en', 'zh-Hant']) {
    for (const [error, status] of [['personal_details',400], ['rate_limited',429], ['temporarily_unavailable',503]]) {
      const c = client(async () => Response.json({ error }, { status }), lang);
      c.textarea.value = 'My question';
      await c.form.fire('submit');
      assert(c.status.textContent.length > 20);
      assert.equal(c.answer.hidden, true);
      assert.equal(c.submit.disabled, false);
      assert(c.events.some(e => e[1] === 'dining_helper_fallback'));
    }
  }
  const c = client(async () => { throw new DOMException('aborted', 'AbortError'); });
  c.textarea.value = 'My question';
  await c.form.fire('submit');
  assert.match(c.status.textContent, /Book Online/);
  assert.equal(c.submit.disabled, false);
});

test('analytics failure cannot break a valid answer or a booking link', async () => {
  const c = client(async () => Response.json(reply()), 'en', () => { throw new Error('blocked'); });
  c.textarea.value = 'How do I book?';
  await c.form.fire('submit');
  assert.equal(c.answer.hidden, false);
  assert.equal(c.status.textContent, 'Your answer is ready.');
  await c.book.fire('click');
});
