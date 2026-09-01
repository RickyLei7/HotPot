const encoder = new TextEncoder();

const bytesToHex = bytes => [...bytes]
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('');

function hexToBytes(value) {
  const text = String(value || '');
  if (!text.length || text.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(text)) return null;
  return Uint8Array.from(text.match(/.{2}/g), pair => Number.parseInt(pair, 16));
}

export async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name:'HMAC',hash:'SHA-256'},
    false,
    ['sign']
  );
  const bytes = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  );
  return bytesToHex(bytes);
}

export function timingSafeEqualHex(left, right) {
  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  if (!leftBytes || !rightBytes || leftBytes.length !== rightBytes.length) return false;
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

export async function verifyPin(pin, env) {
  if (!/^\d{4}$/.test(String(pin))) return false;
  const actual = await hmacHex(env.PIN_PEPPER, `${env.PIN_SALT}:${pin}`);
  return timingSafeEqualHex(actual, env.PIN_VERIFIER);
}

export async function hashSessionToken(token) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', encoder.encode(token))
  );
  return bytesToHex(bytes);
}
