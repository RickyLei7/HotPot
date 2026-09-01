#!/usr/bin/env node

import {createHmac, randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {Writable} from 'node:stream';
import {createInterface} from 'node:readline/promises';

const ALLOWED_CONFIGS = new Set([
  'wrangler.jsonc',
  'wrangler.production.jsonc'
]);

export function parseProvisionConfig(args) {
  if (args.length !== 2 || args[0] !== '--config' || !ALLOWED_CONFIGS.has(args[1])) {
    throw new Error(
      '用法: node scripts/provision-pin.mjs --config wrangler.jsonc|wrangler.production.jsonc'
    );
  }
  return args[1];
}

export async function buildPinSecrets({readHidden, randomHex, hmacHex}) {
  let first = '';
  let second = '';
  try {
    first = await readHidden('输入新的 4 位 PIN: ');
    second = await readHidden('再次输入 PIN: ');
    if (!/^\d{4}$/.test(first)) throw new Error('PIN 必须正好是 4 位数字');
    if (first !== second) throw new Error('两次输入的 PIN 不一致');

    const salt = randomHex(16);
    const pepper = randomHex(32);
    const version = randomHex(16);
    const verifier = await hmacHex(pepper, `${salt}:${first}`);
    return {
      PIN_SALT: salt,
      PIN_PEPPER: pepper,
      PIN_VERIFIER: verifier,
      PIN_VERSION: version
    };
  } finally {
    first = '';
    second = '';
  }
}

export async function provisionPin({
  config,
  readHidden,
  randomHex,
  hmacHex,
  writeBulk
}) {
  let secrets = null;
  try {
    secrets = await buildPinSecrets({readHidden, randomHex, hmacHex});
    await writeBulk(config, secrets);
  } finally {
    secrets = null;
  }
}

export function readMacHiddenDialog(prompt, {spawnImpl = spawn} = {}) {
  const script = [
    'on run argv',
    'set dialogPrompt to item 1 of argv',
    'display dialog dialogPrompt default answer "" with hidden answer buttons {"取消", "继续"} default button "继续" with title "Hotpot Seat Manager"',
    'return text returned of result',
    'end run'
  ].join('\n');

  return new Promise((resolve, reject) => {
    const child = spawnImpl('osascript', ['-e', script, prompt], {
      stdio:['ignore', 'pipe', 'pipe']
    });
    let answer = '';
    child.stdout.on('data', (chunk) => { answer += chunk; });
    child.once('error', () => reject(new Error('无法打开安全 PIN 输入框')));
    child.once('exit', (code) => {
      if (code === 0) {
        resolve(answer.replace(/[\r\n]+$/, ''));
        answer = '';
        return;
      }
      answer = '';
      reject(new Error('已取消 PIN 输入'));
    });
  });
}

export function createHiddenReader({
  input = process.stdin,
  output = process.stdout,
  platform = process.platform,
  runDialog = readMacHiddenDialog
} = {}) {
  return async (prompt) => {
    if (!input.isTTY || !output.isTTY) {
      if (platform === 'darwin') return runDialog(prompt);
      throw new Error('PIN 必须在交互式终端中输入');
    }

    let muted = true;
    const hiddenOutput = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) output.write(chunk, encoding);
        callback();
      }
    });
    hiddenOutput.isTTY = true;
    const reader = createInterface({input, output:hiddenOutput, terminal:true});
    output.write(prompt);
    try {
      return await reader.question('');
    } finally {
      muted = false;
      reader.close();
      output.write('\n');
    }
  };
}

export function writeBulkWithWrangler(config, secrets) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['wrangler', 'secret', 'bulk', '--config', config],
      {stdio:['pipe', 'inherit', 'inherit']}
    );
    let payload = JSON.stringify(secrets);

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      payload = '';
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Wrangler secret bulk 失败 (${signal || code})`));
    });
    child.stdin.once('error', reject);
    child.stdin.end(payload);
  });
}

async function main() {
  const config = parseProvisionConfig(process.argv.slice(2));
  await provisionPin({
    config,
    readHidden: createHiddenReader(),
    randomHex: (bytes) => randomBytes(bytes).toString('hex'),
    hmacHex: async (key, value) => createHmac('sha256', key).update(value).digest('hex'),
    writeBulk: writeBulkWithWrangler
  });
  console.log('已安全上传: PIN_SALT, PIN_PEPPER, PIN_VERIFIER, PIN_VERSION');
}

const isEntrypoint = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isEntrypoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
