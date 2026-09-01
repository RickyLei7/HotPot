import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import test from 'node:test';

import {
  buildPinSecrets,
  createHiddenReader,
  parseProvisionConfig,
  provisionPin
} from '../../scripts/provision-pin.mjs';

function dependencies(answers, randomCalls = []) {
  let answerIndex = 0;
  let randomIndex = 0;
  const randomValues = ['salt-value', 'pepper-value', 'version-value'];
  return {
    readHidden: async () => answers[answerIndex++],
    randomHex: (bytes) => {
      randomCalls.push(bytes);
      return randomValues[randomIndex++];
    },
    hmacHex: async (key, value) => createHmac('sha256', key).update(value).digest('hex')
  };
}

test('buildPinSecrets accepts exactly four matching digits and returns only derived secrets', async () => {
  const randomCalls = [];
  const secrets = await buildPinSecrets(dependencies(['4826', '4826'], randomCalls));

  assert.deepEqual(Object.keys(secrets).sort(), [
    'PIN_PEPPER',
    'PIN_SALT',
    'PIN_VERIFIER',
    'PIN_VERSION'
  ]);
  assert.equal(secrets.PIN_SALT, 'salt-value');
  assert.equal(secrets.PIN_PEPPER, 'pepper-value');
  assert.equal(secrets.PIN_VERSION, 'version-value');
  assert.equal(
    secrets.PIN_VERIFIER,
    createHmac('sha256', 'pepper-value').update('salt-value:4826').digest('hex')
  );
  assert.equal(JSON.stringify(secrets).includes('4826'), false);
  assert.deepEqual(randomCalls, [16, 32, 16]);
});

for (const pin of ['123', '12345', '12a4', '１２３４']) {
  test(`buildPinSecrets rejects invalid PIN ${pin}`, async () => {
    await assert.rejects(buildPinSecrets(dependencies([pin, pin])), /正好是 4 位数字/);
  });
}

test('buildPinSecrets rejects a mismatched confirmation', async () => {
  await assert.rejects(buildPinSecrets(dependencies(['4826', '4827'])), /两次输入的 PIN 不一致/);
});

test('provisionPin performs one atomic upload containing exactly four secret names', async () => {
  const writes = [];
  const result = await provisionPin({
    ...dependencies(['4826', '4826']),
    config: 'wrangler.jsonc',
    writeBulk: async (config, secrets) => {
      writes.push({config, secrets: structuredClone(secrets)});
    }
  });

  assert.equal(result, undefined);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].config, 'wrangler.jsonc');
  assert.deepEqual(Object.keys(writes[0].secrets).sort(), [
    'PIN_PEPPER',
    'PIN_SALT',
    'PIN_VERIFIER',
    'PIN_VERSION'
  ]);
  assert.equal(JSON.stringify(writes).includes('4826'), false);
});

test('parseProvisionConfig allows only the two reviewed Wrangler configs', () => {
  assert.equal(parseProvisionConfig(['--config', 'wrangler.jsonc']), 'wrangler.jsonc');
  assert.equal(
    parseProvisionConfig(['--config', 'wrangler.production.jsonc']),
    'wrangler.production.jsonc'
  );
  assert.throws(() => parseProvisionConfig([]), /用法/);
  assert.throws(() => parseProvisionConfig(['--config', '../wrangler.jsonc']), /用法/);
  assert.throws(() => parseProvisionConfig(['--config', 'wrangler.jsonc', '--env', 'x']), /用法/);
});

test('hidden reader uses the macOS password dialog when no interactive terminal is attached', async () => {
  const prompts = [];
  const readHidden = createHiddenReader({
    input:{isTTY:false},
    output:{isTTY:false},
    platform:'darwin',
    runDialog:async (prompt) => {
      prompts.push(prompt);
      return '4826';
    }
  });

  assert.equal(await readHidden('输入新的 4 位 PIN: '), '4826');
  assert.deepEqual(prompts, ['输入新的 4 位 PIN: ']);
});
