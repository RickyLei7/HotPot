import { createHmac } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const salt = 'local-test-salt';
const pepper = 'local-test-pepper-not-for-production';
const verifier = createHmac('sha256', pepper).update(`${salt}:2468`).digest('hex');
const lines = [
  `PIN_SALT=${salt}`,
  `PIN_PEPPER=${pepper}`,
  `PIN_VERIFIER=${verifier}`,
  'PIN_VERSION=local-test-v1'
];

await writeFile('.dev.vars', `${lines.join('\n')}\n`, {mode:0o600});
