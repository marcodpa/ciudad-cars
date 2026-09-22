import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import {
  rentalToday,
  addDays,
  validateGuestBooking,
  orderMessage,
} from '../lib/rental-domain.ts';
async function route(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const js = ts
    .transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    })
    .outputText.replaceAll(
      "'@/lib/rental-domain'",
      JSON.stringify(new URL('../lib/rental-domain.ts', import.meta.url).href),
    );
  return import(
    'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
  );
}
const { POST } = await route('../app/api/reservations/route.ts'),
  { GET } = await route('../app/api/booking-config/route.ts');
const input = {
  model_id: 'lancer',
  pickup: addDays(rentalToday(), 1),
  dropoff: addDays(rentalToday(), 4),
  full_name: 'Persona de prueba',
  phone: '+584120000000',
  email: 'test@example.com',
  document: 'DEMO-1234',
  license: 'DEMO-5678',
  license_expiry: addDays(rentalToday(), 365),
  home_address: 'Domicilio privado de ejemplo',
  pickup_location: 'Por coordinar',
  return_location: 'Por coordinar',
  notes: '',
  consent: true,
};
const body = {
  input,
  request_id: crypto.randomUUID(),
  captcha: 'fake-test-token',
};
const req = (data = body, origin = 'https://booking.example', raw = false) =>
  new Request('https://booking.example/api/reservations', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: raw ? data : JSON.stringify(data),
  });
test('public API: fail closed, validate input, verify captcha and keep secrets server-only', async (t) => {
  const keys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TURNSTILE_SECRET_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  ];
  const saved = keys.map((k) => process.env[k]),
    originalFetch = globalThis.fetch;
  t.after(() => {
    keys.forEach((k, i) => {
      if (saved[i] === undefined) delete process.env[k];
      else process.env[k] = saved[i];
    });
    globalThis.fetch = originalFetch;
  });
  keys.forEach((k) => delete process.env[k]);
  assert.equal((await POST(req())).status, 503);
  assert.deepEqual(await (await GET()).json(), { enabled: false, sitekey: '' });
  Object.assign(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_TEST_ONLY',
    TURNSTILE_SECRET_KEY: 'TEST_SECRET',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'TEST_PUBLIC',
  });
  assert.deepEqual(await (await GET()).json(), {
    enabled: true,
    sitekey: 'TEST_PUBLIC',
  });
  const calls = [];
  let verification = {
    success: true,
    action: 'booking',
    hostname: 'booking.example',
  };
  globalThis.fetch = async (url, opts) => {
    calls.push([url, opts]);
    return Response.json(
      String(url).includes('siteverify')
        ? verification
        : { id: 'created-order', code: 'CC-TEST' },
    );
  };
  assert.equal((await POST(req(body, 'https://other.example'))).status, 403);
  assert.equal((await POST(req({ ...body, captcha: '' }))).status, 400);
  assert.equal(
    (await POST(req({ ...body, input: { ...input, home_address: '' } })))
      .status,
    400,
  );
  assert.equal((await POST(req('null', undefined, true))).status, 400);
  assert.equal((await POST(req('{', undefined, true))).status, 400);
  assert.equal(
    (await POST(req('x'.repeat(17000), undefined, true))).status,
    413,
  );
  assert.equal(calls.length, 0);
  verification = { ...verification, hostname: 'other.example' };
  assert.equal((await POST(req())).status, 403);
  assert.equal(calls.length, 1);
  verification = {
    ...verification,
    hostname: 'booking.example',
    action: 'other',
  };
  assert.equal((await POST(req())).status, 403);
  verification = { ...verification, action: 'booking' };
  const result = await POST(
    req({ ...body, input: { ...input, total: 1, daily_rate: 1 } }),
  );
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  const [url, opts] = calls.at(-1),
    sent = JSON.parse(opts.body);
  assert.ok(url.endsWith('/rpc/rental_submit_guest_order'));
  assert.equal(opts.headers.apikey, 'sb_secret_TEST_ONLY');
  assert.equal(opts.headers.Authorization, undefined);
  assert.equal(sent.p_input.total, undefined);
  assert.equal(sent.p_input.daily_rate, undefined);
  assert.equal(sent.p_input.home_address, input.home_address);
  for (const key of ['p_client_hash', 'p_identity_hash', 'p_payload_hash'])
    assert.match(sent[key], /^[a-f0-9]{64}$/);
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy-jwt';
  await POST(req());
  assert.equal(calls.at(-1)[1].headers.Authorization, 'Bearer legacy-jwt');
});
test('guest booking requires a home address and keeps identity and address out of WhatsApp', () => {
  assert.equal(validateGuestBooking(input), 3);
  for (const home_address of [undefined, '', 'casa', 'a'.repeat(501)])
    assert.throws(
      () => validateGuestBooking({ ...input, home_address }),
      /domicilio/,
    );
  const message = orderMessage(
    { ...input, code: 'CC-TEST', total: 225 },
    { make: 'Mitsubishi', model: 'Lancer' },
  );
  for (const value of [input.document, input.license, input.home_address])
    assert.ok(!message.includes(value));
});
