// Sends the locally provisioned key over stdin, never argv or console output.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (!process.argv.includes('--upload')) throw new Error('Secret upload requires --upload. Nothing changed.');
if (!process.env.OPENAI_API_KEY) throw new Error('The dedicated API key is not configured. Nothing changed.');
if (!/^[a-f0-9]{32}$/i.test(process.env.CLOUDFLARE_ACCOUNT_ID || '')) {
  throw new Error('Set the independently verified HotPot CLOUDFLARE_ACCOUNT_ID before uploading. Nothing changed.');
}
const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'secret', 'put', 'OPENAI_API_KEY', '--config', 'assistant/wrangler.jsonc'], {
  cwd: root, env: process.env, input: `${process.env.OPENAI_API_KEY}\n`, stdio: ['pipe', 'inherit', 'inherit']
});
if (result.error) throw new Error('Unable to launch the assistant secret upload.');
process.exitCode = result.status ?? 1;
