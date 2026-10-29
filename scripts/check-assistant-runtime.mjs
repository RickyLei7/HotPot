// Run after Wrangler's dry run. Executes the bundled Worker in local workerd,
// with real SQLite Durable Objects and an isolated OpenAI response fixture.
import { Miniflare } from 'miniflare';
import { resolve, dirname } from 'node:path';
import { realpath } from 'node:fs/promises';
import assert from 'node:assert/strict';

const scriptPath = await realpath(resolve(process.argv[2] || '/tmp/hotpot-assistant-bundle-20261029/worker.js'));
let calls = 0;
const mf = new Miniflare({
  modules: true, scriptPath, modulesRoot: dirname(scriptPath), compatibilityDate: '2026-05-22',
  bindings: { OPENAI_API_KEY: 'local-fixture-only', DAILY_REQUEST_LIMIT: '9' },
  durableObjects: { ASSISTANT_BUDGET: { className: 'AssistantBudget', useSQLite: true } },
  outboundService: async request => {
    assert.equal(new URL(request.url).origin, 'https://api.openai.com');
    calls++;
    return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ factIds: ['booking'], topic: 'booking', language: 'en', adultCount: 0, pricePlan: 'none' }) }] }] });
  }
});
const ask = client => mf.dispatchFetch('https://assistant.example/ask', {
  method: 'POST', headers: { Origin: 'https://centrestjhotpot.ca', 'Content-Type': 'application/json', 'CF-Connecting-IP': client },
  body: JSON.stringify({ question: 'How do I book?', language: 'en', context: [] })
});
try {
  const health = await mf.dispatchFetch('https://assistant.example/health');
  assert.equal((await health.json()).status, 'ready');
  const first = await ask('192.0.2.1');
  assert.equal(first.status, 200);
  assert.equal((await first.json()).parts[0].href, 'https://reservation.centrestjhotpot.ca/book');
  const burst = await Promise.all(Array.from({ length: 8 }, () => ask('192.0.2.1')));
  assert.equal(burst.filter(r => r.status === 200).length, 5);
  assert.equal(burst.filter(r => r.status === 429).length, 3);
  const clients = await Promise.all(Array.from({ length: 8 }, (_, i) => ask(`192.0.2.${i + 2}`)));
  assert.equal(clients.filter(r => r.status === 200).length, 3);
  assert.equal(calls, 9);
  assert.equal((await ask('192.0.2.99')).status, 429);
  assert.equal(calls, 9);
  console.log('Local workerd integration passed: endpoint → real SQLite quota → fixture provider → grounded booking link; concurrent per-client and global caps enforced. No live OpenAI request was made.');
} finally {
  await mf.dispose();
}
