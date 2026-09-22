import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
const db = new PGlite({ extensions: { btree_gist } }),
  admin = '00000000-0000-4000-8000-000000000001',
  customer = '00000000-0000-4000-8000-000000000002';
let input, order;
async function role(name, user = '') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  await db.exec(`set role ${name}`);
}
async function submit(
  overrides = {},
  req = crypto.randomUUID(),
  client = 'a'.repeat(64),
  identity = 'b'.repeat(64),
  payload = 'c'.repeat(64),
) {
  return (
    await db.query(
      'select * from rental_submit_guest_order($1::jsonb,$2::uuid,$3,$4,$5)',
      [
        JSON.stringify({ ...input, ...overrides }),
        req,
        client,
        identity,
        payload,
      ],
    )
  ).rows[0];
}
before(async () => {
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
  );
  for (const file of [
    '202609220001_rental_system.sql',
    '202609220002_billing.sql',
    '202609220003_guest_reservations.sql',
  ])
    await db.exec(
      await readFile(
        new URL('../supabase/migrations/' + file, import.meta.url),
        'utf8',
      ),
    );
  for (const id of [admin, customer])
    await db.query('insert into auth.users(id,email) values($1,$2)', [
      id,
      id + '@example.com',
    ]);
  await db.query("update rental_profiles set role='admin' where id=$1", [
    admin,
  ]);
  await db.exec(
    "insert into rental_units(model_id,label,plate,status) values('lancer','Lancer 01','TEST-001','available')",
  );
  const {
    rows: [d],
  } = await db.query(
    "select ((now() at time zone 'America/Caracas')::date+1)::text as pickup,((now() at time zone 'America/Caracas')::date+4)::text as dropoff,((now() at time zone 'America/Caracas')::date+365)::text as expiry",
  );
  input = {
    model_id: 'lancer',
    pickup: d.pickup,
    dropoff: d.dropoff,
    full_name: 'Persona de ejemplo',
    phone: '+584120000000',
    email: 'guest@example.com',
    document: 'DEMO-123',
    license: 'DEMO-456',
    license_expiry: d.expiry,
    home_address: 'Maracaibo, sector ejemplo, calle 10, casa 2',
    pickup_location: 'Por coordinar',
    return_location: 'Por coordinar',
    notes: '',
    consent: true,
  };
});
after(() => db.close());
test('guest orders: visitors cannot bypass the server, and no customer account is created', async () => {
  await role('anon');
  await assert.rejects(() => submit(), /permission denied/);
  await role('authenticated', customer);
  await assert.rejects(() => submit(), /permission denied/);
  await assert.rejects(
    () =>
      db.query('select * from rental_create_order($1,$2)', [
        JSON.stringify(input),
        crypto.randomUUID(),
      ]),
    /permission denied/,
  );
  await role('service_role');
  const req = crypto.randomUUID();
  order = await submit({ total: 1, daily_rate: 1 }, req);
  assert.equal(Number(order.total), 225);
  assert.equal(order.status, 'pending');
  assert.equal(order.home_address, input.home_address);
  assert.equal((await submit({}, req)).id, order.id);
  await assert.rejects(
    () => submit({}, req, undefined, undefined, 'd'.repeat(64)),
    /inválida/,
  );
  await db.exec('reset role');
  assert.equal(
    (await db.query('select count(*)::int as n from auth.users')).rows[0].n,
    2,
  );
  assert.equal(
    (
      await db.query('select auth_user_id from rental_profiles where id=$1', [
        order.customer_id,
      ])
    ).rows[0].auth_user_id,
    null,
  );
});
test('guest orders: personal information is staff-only, including legacy accounts', async () => {
  await role('anon');
  await assert.rejects(
    () => db.query('select * from rental_orders'),
    /permission denied/,
  );
  await role('authenticated', customer);
  for (const table of [
    'rental_orders',
    'rental_profiles',
    'rental_payments',
    'rental_billing_documents',
  ])
    assert.equal((await db.query('select * from ' + table)).rows.length, 0);
  await role('authenticated', admin);
  assert.equal((await db.query('select id from rental_orders')).rows.length, 1);
});
test('guest orders: address, availability, and transactional request limits are enforced', async () => {
  await role('service_role');
  await assert.rejects(() => submit({ home_address: '' }), /domicilio/);
  for (let i = 0; i < 4; i++)
    await submit({}, undefined, undefined, String(i).repeat(64));
  await assert.rejects(
    () => submit({}, undefined, undefined, 'f'.repeat(64)),
    /Demasiadas/,
  );
  await assert.rejects(
    () =>
      submit(
        { pickup: input.dropoff, dropoff: input.pickup },
        undefined,
        'e'.repeat(64),
      ),
    /fechas/,
  );
});
test('guest migration: old customers cannot cancel, while staff can invoice and approve a guest order', async () => {
  await db.exec('reset role');
  await db.query('update rental_orders set customer_id=$1 where id=$2', [
    customer,
    order.id,
  ]);
  const action = async (input) =>
    (
      await db.query('select * from rental_order_action($1::jsonb)', [
        JSON.stringify({
          order_id: order.id,
          request_id: crypto.randomUUID(),
          ...input,
        }),
      ])
    ).rows[0];
  await role('authenticated', customer);
  await assert.rejects(() => action({ action: 'cancel' }), /administradores/);
  await db.exec('reset role');
  await db.query('update rental_orders set customer_id=$1 where id=$2', [
    order.customer_id,
    order.id,
  ]);
  await role('authenticated', admin);
  const party = {
    name: input.full_name,
    tax_id: input.document,
    address: input.home_address,
    email: input.email,
    phone: input.phone,
  };
  await db.query('select rental_billing_settings_save($1::jsonb)', [
    JSON.stringify({
      ...party,
      prefix: 'CC',
      terms: 'Ejemplo',
      tax_label: 'Impuesto',
      tax_bps: 0,
    }),
  ]);
  const bill = async (value) =>
    (
      await db.query('select * from rental_billing_action($1::jsonb)', [
        JSON.stringify({
          order_id: order.id,
          request_id: crypto.randomUUID(),
          ...value,
        }),
      ])
    ).rows[0];
  const draft = await bill({
    action: 'save',
    kind: 'invoice',
    customer: party,
    lines: [
      {
        description: 'Alquiler',
        quantity: 3,
        unit_cents: 7500,
        discount_cents: 0,
        tax_bps: 0,
      },
    ],
    due_date: input.pickup,
  });
  const invoice = await bill({
    action: 'issue',
    id: draft.id,
    version: draft.version,
  });
  assert.equal(invoice.customer.address, input.home_address);
  assert.equal(Number(invoice.total_cents), 22500);
  await action({
    action: 'payment',
    amount: 225,
    method: 'Transferencia',
    reference: 'GUEST-TEST',
  });
  const unit = (await db.query('select id from rental_units')).rows[0].id;
  assert.equal(
    (await action({ action: 'approve', unit_id: unit })).status,
    'approved',
  );
  await role('authenticated', customer);
  assert.equal(
    (await db.query('select * from rental_billing_documents')).rows.length,
    0,
  );
});
