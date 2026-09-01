import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('index.html is a self-contained page that can run from file://', async () => {
  const html = await readFile(new URL('../../local-preview/index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(html, /<script\b[^>]*\bsrc\s*=/i, 'JavaScript must be inline');
  assert.doesNotMatch(html, /<link\b[^>]*\brel=["']stylesheet["']/i, 'CSS must be inline');
  assert.doesNotMatch(html, /<script\b[^>]*\btype=["']module["']/i, 'file:// cannot rely on ES modules');
  assert.match(html, /<style>[\s\S]+<\/style>/i, 'page should include its styles');
  assert.match(html, /<script>[\s\S]+Hotpot Seat Manager[\s\S]+<\/script>/i, 'page should include the app');
});
