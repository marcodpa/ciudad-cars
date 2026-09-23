import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

const db = new PGlite({ extensions: { btree_gist } });
const admin = '00000000-0000-4000-8000-000000000001';
const customer = '00000000-0000-4000-8000-000000000002';
const randomId = () => crypto.randomUUID();
let dates;
let guestOrder;

async function asRole(role, user, sql, params = []) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    user || '',
  ]);
  await db.query("select set_config('request.jwt.claim.role',$1,false)", [
    role,
  ]);
  await db.exec(`set role ${role}`);
  return db.query(sql, params);
}

before(async () => {
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb default '{}'::jsonb
    );
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
  `);
  for (const file of [
    '202609220001_rental_system.sql',
    '202609220002_billing.sql',
    '202609220003_guest_reservations.sql',
    '202609230001_audit_trail.sql',
  ]) {
    await db.exec(
      await readFile(
        new URL(`../supabase/migrations/${file}`, import.meta.url),
        'utf8',
      ),
    );
  }
  await db.query('insert into auth.users(id,email) values($1,$2),($3,$4)', [
    admin,
    'admin@example.com',
    customer,
    'customer@example.com',
  ]);
  await db.query("update public.rental_profiles set role='admin' where id=$1", [
    admin,
  ]);
  const {
    rows: [range],
  } = await db.query(`
    select ((now() at time zone 'America/Caracas')::date+1)::text pickup,
           ((now() at time zone 'America/Caracas')::date+4)::text dropoff,
           ((now() at time zone 'America/Caracas')::date+365)::text expiry
  `);
  dates = range;
  await asRole(
    'authenticated',
    admin,
    'select public.rental_save_unit($1::jsonb)',
    [
      JSON.stringify({
        model_id: 'lancer',
        label: 'Lancer 01',
        plate: 'AUDIT-001',
        status: 'available',
      }),
    ],
  );
});
after(async () => {
  await db.close();
});

test('audit: records UTC timestamps, actor and safe business changes', async () => {
  const beforeRate = (
    await asRole(
      'authenticated',
      admin,
      "select updated_at from public.rental_models where id='lancer'",
    )
  ).rows[0].updated_at;
  await asRole(
    'authenticated',
    admin,
    "select public.rental_set_rate('lancer',80)",
  );
  const log = (
    await asRole(
      'authenticated',
      admin,
      `
    select * from public.rental_audit_log
    where entity_table='rental_models' and record_id='lancer'
    order by id desc limit 1
  `,
    )
  ).rows[0];
  assert.equal(log.operation, 'UPDATE');
  assert.equal(log.actor_id, admin);
  assert.equal(log.actor_source, 'authenticated');
  assert.deepEqual(log.changed_fields, ['daily_rate']);
  assert.equal(Number(log.before_state.daily_rate), 75);
  assert.equal(Number(log.after_state.daily_rate), 80);
  assert.ok(log.occurred_at);
  assert.ok(Number(log.transaction_id) > 0);
  const afterRate = (
    await asRole(
      'authenticated',
      admin,
      "select updated_at from public.rental_models where id='lancer'",
    )
  ).rows[0].updated_at;
  assert.ok(new Date(afterRate) >= new Date(beforeRate));
});

test('audit: public orders are logged without duplicating identity or address data', async () => {
  const input = {
    model_id: 'lancer',
    pickup: dates.pickup,
    dropoff: dates.dropoff,
    full_name: 'Private Name',
    phone: '+584120000000',
    email: 'private@example.com',
    document: 'PRIVATE-ID-123',
    license: 'PRIVATE-LIC-123',
    license_expiry: dates.expiry,
    home_address: 'Private home address, house 20',
    pickup_location: 'Office',
    return_location: 'Office',
    notes: 'Private note',
    consent: true,
  };
  const order = (
    await asRole(
      'service_role',
      null,
      `
    select * from public.rental_submit_guest_order($1::jsonb,$2::uuid,$3,$4,$5)
  `,
      [
        JSON.stringify(input),
        randomId(),
        'a'.repeat(64),
        'b'.repeat(64),
        'c'.repeat(64),
      ],
    )
  ).rows[0];
  guestOrder = order;
  assert.equal(order.status, 'pending');
  const logs = (
    await asRole(
      'authenticated',
      admin,
      `
    select * from public.rental_audit_log where order_id=$1 order by id
  `,
      [order.id],
    )
  ).rows;
  assert.deepEqual(
    logs.map((row) => row.entity_table),
    ['rental_orders', 'rental_events'],
  );
  assert.equal(logs[0].actor_source, 'public_booking');
  assert.equal(logs[0].record_id, order.id);
  assert.equal(logs[0].transaction_id, logs[1].transaction_id);
  assert.ok(logs[0].changed_fields.includes('home_address'));
  for (const entry of logs) {
    const snapshot = JSON.stringify([entry.before_state, entry.after_state]);
    for (const secret of [
      'Private Name',
      'private@example.com',
      'PRIVATE-ID-123',
      'PRIVATE-LIC-123',
      'Private home address',
      'Private note',
    ]) {
      assert.equal(snapshot.includes(secret), false);
    }
  }
});

test('audit: billing changes are grouped by transaction and private parties stay private', async () => {
  const party = {
    name: 'Private Company',
    tax_id: 'PRIVATE-TAX-ID',
    address: 'Private street 10',
    email: 'accounts@example.com',
    phone: '',
  };
  await asRole(
    'authenticated',
    admin,
    'select public.rental_billing_settings_save($1::jsonb)',
    [
      JSON.stringify({
        ...party,
        prefix: 'CC',
        terms: 'Payment terms',
        tax_label: 'Tax',
        tax_bps: 0,
      }),
    ],
  );
  const draft = (
    await asRole(
      'authenticated',
      admin,
      'select * from public.rental_billing_action($1::jsonb)',
      [
        JSON.stringify({
          action: 'save',
          request_id: randomId(),
          order_id: guestOrder.id,
          kind: 'invoice',
          customer: party,
          due_date: dates.dropoff,
          lines: [
            {
              description: 'Private line',
              quantity: 3,
              unit_cents: 8000,
              discount_cents: 0,
              tax_bps: 0,
            },
          ],
        }),
      ],
    )
  ).rows[0];
  const issued = (
    await asRole(
      'authenticated',
      admin,
      'select * from public.rental_billing_action($1::jsonb)',
      [
        JSON.stringify({
          action: 'issue',
          request_id: randomId(),
          order_id: guestOrder.id,
          id: draft.id,
          version: draft.version,
        }),
      ],
    )
  ).rows[0];
  assert.equal(issued.status, 'issued');
  const logs = (
    await asRole(
      'authenticated',
      admin,
      `
    select * from public.rental_audit_log
    where transaction_id = (
      select transaction_id from public.rental_audit_log
      where entity_table='rental_billing_documents' and record_id=$1
        and operation='UPDATE' order by id desc limit 1
    ) order by id
  `,
      [issued.id],
    )
  ).rows;
  assert.deepEqual(
    logs.map((row) => row.entity_table),
    [
      'rental_billing_settings',
      'rental_billing_documents',
      'rental_orders',
      'rental_events',
    ],
  );
  assert.equal(logs[1].after_state.number, issued.number);
  assert.equal(Number(logs[2].after_state.billing_total), 240);
  for (const entry of logs) {
    const snapshot = JSON.stringify([entry.before_state, entry.after_state]);
    for (const secret of [
      'Private Company',
      'PRIVATE-TAX-ID',
      'Private street',
      'accounts@example.com',
      'Private line',
    ]) {
      assert.equal(snapshot.includes(secret), false);
    }
  }
});

test('audit: only administrators can read and no client can change the log', async () => {
  await assert.rejects(
    () => asRole('anon', null, 'select * from public.rental_audit_log'),
    /permission denied/,
  );
  assert.equal(
    (
      await asRole(
        'authenticated',
        customer,
        'select * from public.rental_audit_log',
      )
    ).rows.length,
    0,
  );
  assert.ok(
    (
      await asRole(
        'authenticated',
        admin,
        'select count(*)::integer count from public.rental_audit_log',
      )
    ).rows[0].count > 0,
  );
  await assert.rejects(
    () => asRole('authenticated', admin, 'delete from public.rental_audit_log'),
    /permission denied/,
  );
  await db.exec('reset role');
  await assert.rejects(
    () =>
      db.query(
        "update public.rental_audit_log set actor_source='tampered' where id=(select min(id) from public.rental_audit_log)",
      ),
    /no puede editarse/,
  );
});
