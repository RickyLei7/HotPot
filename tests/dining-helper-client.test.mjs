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
  append(...children) { children.forEach(child => { child.parent = this; }); this.children.push(...children); }
  get firstElementChild() { return this.children[0]; }
  remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  replaceChildren() { this.children = []; }
  focus() { this.focused = true; }
  scrollIntoView() {}
}

function client(fetchImpl, language = 'en', analytics) {
  const root = new Element(), form = new Element(), textarea = new Element(), submit = new Element();
  const status = new Element(), answer = new Element(), messages = new Element(), book = new Element(), quick = new Element();
  root.dataset.language = language;
  textarea.value = '';
  quick.dataset.helperQuestion = 'How do I book online?';
  const selectors = { '[data-helper-form]':form, '[data-helper-status]':status, '[data-helper-answer]':answer, '[data-chat-messages]':messages, '.dining-helper-book':book };
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
  return { root, form, textarea, submit, status, answer, messages, book, quick, events, requests, listeners };
}

test('no request before deliberate Send; quick prompts only fill the input; initialization is idempotent', async () => {
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
  const turn = c.answer.children[0];
  assert.equal(turn.children[0].textContent, 'How do I book?');
  assert.equal(turn.children[1].textContent, 'Please use Book Online.');
  const link = turn.children[2];
  assert.equal(link.href, booking);
  assert.equal(link.attributes['aria-haspopup'], 'dialog');
  assert.equal(link.dataset.reservationLauncher, '');
  assert.equal(c.answer.focused, undefined, 'async replies do not steal focus or jump the page');
  await link.fire('click');
  assert(c.events.some(e => e[1] === 'dining_helper_booking_click'));
  assert(!JSON.stringify(c.events).includes('How do I book?'));
  assert(!c.events.some(e => /completed|conversion/.test(e[1])));
  c.textarea.value = 'Can I book for four?';
  await c.form.fire('submit');
  assert.equal(c.answer.children.length, 2, 'previous turn remains available');
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
    assert.equal(c.answer.children[0].children.length, 3);
    assert.equal(c.answer.children[0].children[2].href, 'tel:+14034553188');
    assert(!c.answer.children[0].children.some(element => element.textContent.includes('Injected')));
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
      assert.equal(c.answer.children[0].children[2].href, 'tel:+14034553188');
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


test('conversation stays bounded in page memory and staff replies include a phone action', async () => {
  const c = client(async () => Response.json({language:'en',topic:'other',parts:[{id:'staff',text:'Please call our team.',href:'/contact/'}]}));
  for (let i=0; i<12; i++) { c.textarea.value = `Question ${i}`; await c.form.fire('submit'); }
  assert.equal(c.answer.children.length, 10);
  assert.equal(c.answer.children[0].children[0].textContent, 'Question 2');
  assert.equal(c.answer.children[9].children[3].href, 'tel:+14034553188');
  assert.deepEqual(JSON.parse(c.requests[11][1].body).context, ['staff']);
});
