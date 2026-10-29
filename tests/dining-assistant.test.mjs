import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import knowledge from '../assistant/knowledge.json' with { type: 'json' };
import worker, { handleRequest, classify, validSelection, AssistantBudget } from '../assistant/worker.mjs';
import { explicitAdults, renderAnswer, BOOKING_URL } from '../assistant/facts.mjs';
import { widget } from '../assistant/widget.mjs';

const selection = (values = {}) => ({ factIds: ['ayce'], topic: 'prices', language: 'en', adultCount: 0, pricePlan: 'none', ...values });
const env = () => ({ OPENAI_API_KEY: 'unit-test-only', ASSISTANT_BUDGET: { idFromName: n => n, get: () => ({ fetch: async () => new Response(null, { status: 204 }) }) } });
const input = (values = {}) => ({ question: 'How much is AYCE?', language: 'en', context: [], ...values });
const request = (body = input(), headers = {}, path = '/ask', method = 'POST') => new Request(`https://assistant.example${path}`, {
  method, headers: { Origin: 'https://centrestjhotpot.ca', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...headers },
  ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {})
});
const provider = (route = selection()) => async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(route) }] }] });

test('generated knowledge and all eight shared chat pages match their sources', () => {
  execFileSync(process.execPath, ['scripts/build-dining-assistant.mjs', '--check']);
  execFileSync(process.execPath, ['scripts/build-dining-helper-pages.mjs', '--check']);
  assert.equal(knowledge.prices.ayce, 2899);
  assert.equal(knowledge.prices.snacks, 599);
  assert.equal(knowledge.prices.kids, 1299);
  assert.match(knowledge.facts.snacks.en, /Everyone at the same table/);
  assert.match(knowledge.facts.drinks.zh, /奶茶 \$5.95/);
  assert.match(knowledge.facts.rice_noodles.en, /Beef Noodle Soup \$16.99/);
});

test('integer-cent estimates cover English and Chinese and name the option', () => {
  const answer = renderAnswer(selection({ adultCount: 2, pricePlan: 'ayce_snacks' }), knowledge, 'AYCE with snacks for 2 adults');
  assert.match(answer.parts.at(-1).text, /AYCE with snacks totals \$69.96 CAD before tax/);
  const zh = renderAnswer(selection({ language: 'zh-Hant', adultCount: 2, pricePlan: 'ayce' }), knowledge, '兩位成人火鍋自助多少錢？');
  assert.match(zh.parts.at(-1).text, /\$57.98/);
  assert.equal(zh.parts[0].href, '/zh-hant/ayce-hot-pot-calgary/');
});

test('no estimate for children, ambiguous counts, model-invented count or unstated option', () => {
  for (const q of ['AYCE for 2 adults and 1 child', 'AYCE for 2 or 3 adults', 'AYCE for two or three adults', 'AYCE for two adults and three adults', 'AYCE for 21人', 'AYCE for 2.5 people', 'AYCE for 十一人', 'AYCE for -2 adults', 'AYCE for 2 adults and 3 adults', 'AYCE for 2 adults and a baby']) {
    assert.equal(renderAnswer(selection({ adultCount: 2, pricePlan: 'ayce' }), knowledge, q).parts.length, 1, q);
  }
  assert.equal(explicitAdults('21人'), null);
  assert.equal(explicitAdults('十一人'), null);
  assert.equal(renderAnswer(selection({ adultCount: 3, pricePlan: 'ayce' }), knowledge, 'AYCE for 2 adults').parts.length, 1);
  assert.equal(renderAnswer(selection({ adultCount: 2, pricePlan: 'personal' }), knowledge, 'What costs less for 2 adults?').parts.length, 1);
  assert.equal(renderAnswer(selection({ adultCount: 2, pricePlan: 'ayce_snacks' }), knowledge, 'AYCE for 2 adults').parts.length, 1);
});

test('responses are grounded facts; live booking and dietary claims direct to staff', () => {
  const booking = renderAnswer(selection({ factIds: ['booking'] }), knowledge, 'Book tonight');
  assert.equal(booking.parts[0].href, BOOKING_URL);
  assert.match(booking.parts[0].text, /cannot check live tables or make a reservation/);
  assert.match(renderAnswer(selection({ factIds: ['dietary'] }), knowledge, 'peanut allergy').parts[0].text, /cannot verify allergen safety/);
  assert.equal(validSelection(selection({ factIds: ['ignore-rules'] })), false);
  assert.equal(validSelection({ ...selection(), answer: 'confirmed' }), false);
});

test('successful endpoint has CORS, no cache and no secrets or raw question reflected', async () => {
  const response = await handleRequest(request(), env(), provider());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://centrestjhotpot.ca');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const body = await response.text();
  assert(!body.includes('unit-test-only'));
  assert(!body.includes('How much is AYCE?'));
});

test('runtime entrypoint does not treat the Cloudflare context as a fetch implementation', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = provider();
  try { assert.equal((await worker.fetch(request(), env(), { waitUntil() {} })).status, 200); }
  finally { globalThis.fetch = realFetch; }
});

test('CORS preflight, unexpected origins, methods and content types fail before provider call', async () => {
  const never = () => assert.fail('provider must not be called');
  assert.equal((await handleRequest(request(null, {}, '/ask', 'OPTIONS'), env(), never)).status, 204);
  assert.equal((await handleRequest(request(input(), { Origin: 'https://evil.example' }), env(), never)).status, 403);
  assert.equal((await handleRequest(request(null, {}, '/ask', 'GET'), env(), never)).status, 405);
  assert.equal((await handleRequest(request(input(), { 'Content-Type': 'text/plain' }), env(), never)).status, 415);
  assert.equal((await handleRequest(request(null, {}, '/unknown', 'GET'), env(), never)).status, 404);
});

test('oversized, malformed, unknown-context and personal-detail inputs are rejected', async () => {
  const never = () => assert.fail('provider must not be called');
  const invalid = ['{', 'x'.repeat(4097), input({ question: 'x'.repeat(501) }), input({ context: ['secret'] }), input({ question: '' }), { ...input(), admin: true }];
  for (const body of invalid) assert.equal((await handleRequest(request(body), env(), never)).status, 400);
  for (const q of ['Email me at customer@example.com', 'Call (403) 555-0123', 'my number is 403-555-0123', 'call +1 403 555 0123']) {
    const response = await handleRequest(request(input({ question: q })), env(), never);
    assert.equal(response.status, 400, q);
    assert.equal((await response.json()).error, 'personal_details');
  }
});

test('missing credentials, quota outage and per-client limit fail closed', async () => {
  const never = () => assert.fail('provider must not be called');
  assert.equal((await handleRequest(request(), {}, never)).status, 503);
  assert.equal((await handleRequest(request(), { OPENAI_API_KEY: 'test' }, never)).status, 503);
  const quota = env();
  quota.ASSISTANT_BUDGET.get = () => ({ fetch: async () => new Response(null, { status: 429 }) });
  const response = await handleRequest(request(), quota, never);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  quota.ASSISTANT_BUDGET.get = () => ({ fetch: async () => { throw new Error('private upstream detail'); } });
  const failed = await handleRequest(request(), quota, never);
  assert.equal(failed.status, 503);
  assert(!(await failed.text()).includes('private upstream detail'));
});

test('provider request uses strict structured output, no storage or tools and bounded output', async () => {
  await classify(input(), env(), async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.equal(body.max_output_tokens, 350);
    assert.equal(body.text.format.strict, true);
    assert.equal(body.tools, undefined);
    assert(options.signal instanceof AbortSignal);
    return provider()();
  });
});

test('provider errors, timeouts, refusal, incomplete or invalid structured output yield safe fallback', async () => {
  const bad = [
    async () => new Response('private provider detail', { status: 401 }),
    async () => new Response('', { status: 429 }),
    async () => { throw new DOMException('timeout', 'TimeoutError'); },
    async () => Response.json({ status: 'incomplete' }),
    async () => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }),
    provider(selection({ factIds: ['secret'] })), provider({ ...selection(), answer: 'booked' })
  ];
  for (const fetchImpl of bad) {
    const response = await handleRequest(request(), env(), fetchImpl);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'temporarily_unavailable' });
  }
});

function storageFixture() {
  const data = new Map();
  let chain = Promise.resolve();
  const storage = {
    get: async key => structuredClone(data.get(key)),
    put: async (key, value) => { data.set(key, structuredClone(value)); },
    transaction: fn => {
      const pending = chain.then(() => fn(storage));
      chain = pending.catch(() => {});
      return pending;
    }
  };
  return { storage, data };
}
const reserve = (budget, client = '192.0.2.1') => budget.fetch(new Request('https://budget/reserve', { method: 'POST', body: JSON.stringify({ client }) }));

test('atomic global budget persists across instance restarts and never saves raw IPs', async () => {
  const ctx = storageFixture();
  const a = new AssistantBudget(ctx, { DAILY_REQUEST_LIMIT: '3' });
  const responses = await Promise.all(Array.from({ length: 12 }, (_, i) => reserve(a, `192.0.2.${i}`)));
  assert.equal(responses.filter(r => r.status === 204).length, 3);
  const restarted = new AssistantBudget(ctx, { DAILY_REQUEST_LIMIT: '3' });
  assert.equal((await reserve(restarted, '192.0.2.99')).status, 429);
  assert(!JSON.stringify([...ctx.data]).includes('192.0.2.'));
});

test('six-per-minute client cap, daily client cap, expiry and daily reset', async () => {
  const originalNow = Date.now;
  let now = Date.UTC(2026, 9, 29, 12);
  Date.now = () => now;
  try {
    const budget = new AssistantBudget(storageFixture(), {});
    for (let i = 0; i < 6; i++) assert.equal((await reserve(budget)).status, 204);
    assert.equal((await reserve(budget)).status, 429);
    for (let i = 6; i < 20; i++) { now += 61000; assert.equal((await reserve(budget)).status, 204); }
    now += 61000;
    assert.equal((await reserve(budget)).status, 429);
    now += 86400000;
    assert.equal((await reserve(budget)).status, 204);
  } finally { Date.now = originalNow; }
});

test('widget is opt-in with persistent booking fallback, privacy and accessible labels', async () => {
  for (const lang of ['en', 'zh-Hant']) {
    const html = widget(lang);
    assert.match(html, /data-chat-panel[^>]*role="dialog"[^>]*hidden/);
    assert.match(html, /data-chat-open hidden/);
    assert.match(html, /tel:\+14034553188/);
    assert(!html.includes('Ask AI'));
    assert.match(html, /aria-describedby="dining-helper-privacy dining-helper-limits"/);
    assert.match(html, /data-reservation-launcher/);
    assert.match(html, /privacy-policy\/#ai-helper/);
    assert.match(html, /<noscript>/);
    assert.match(html, /maxlength="500"/);
  }
  const js = await readFile(new URL('../public/dining-helper.js', import.meta.url), 'utf8');
  assert(!js.includes('innerHTML'));
  assert(!js.includes('localStorage'));
  assert(!js.includes('booking-completed'));
});
