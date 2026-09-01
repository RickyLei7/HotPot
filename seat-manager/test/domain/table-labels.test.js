import test from 'node:test';
import assert from 'node:assert/strict';
import * as tables from '../../src/domain/tables.js';

test('table cards show only their number', () => {
  const format = tables.formatTableCardNumber;
  assert.equal(typeof format === 'function' ? format(1) : undefined, '1');
  assert.equal(typeof format === 'function' ? format(10) : undefined, '10');
});

test('table references use the Chinese table label without a T or Table prefix', () => {
  const format = tables.formatTableReference;
  assert.equal(typeof format === 'function' ? format([3]) : undefined, '桌位 3');
  assert.equal(typeof format === 'function' ? format([1,2]) : undefined, '桌位 1 + 2');
});
