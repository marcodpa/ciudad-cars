import { createHmac } from 'node:crypto';
import { validateGuestBooking, type BookingInput } from '@/lib/rental-domain';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
const failure = (message: string, status = 400) =>
  Response.json({ error: message }, { status, headers });
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key = process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    secret = process.env.TURNSTILE_SECRET_KEY || '';
  if (
    !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) ||
    !key ||
    !secret ||
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  )
    return failure(
      'Las solicitudes en línea todavía no están habilitadas.',
      503,
    );
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin)
    return failure('Origen de solicitud no permitido.', 403);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return failure('Formato no admitido.', 415);
  try {
    const reader = request.body?.getReader();
    if (!reader) return failure('Faltan los datos.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16384) {
        await reader.cancel();
        return failure('La solicitud es demasiado extensa.', 413);
      }
      chunks.push(value);
    }
    let body: {
      input: BookingInput;
      request_id: string;
      captcha: string;
    };
    try {
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!body || typeof body !== 'object' || Array.isArray(body))
        return failure('Solicitud inválida.');
    } catch {
      return failure('Solicitud inválida.');
    }
    if (
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        body.request_id || '',
      )
    )
      return failure('Solicitud inválida.');
    if (
      typeof body.captcha !== 'string' ||
      body.captcha.length > 2048 ||
      !body.captcha
    )
      return failure('Completa la verificación antes de enviar.');
    const fields = [
      'model_id',
      'pickup',
      'dropoff',
      'full_name',
      'phone',
      'email',
      'document',
      'license',
      'license_expiry',
      'pickup_location',
      'return_location',
      'home_address',
      'notes',
    ] as const;
    const input = {} as BookingInput;
    for (const field of fields) {
      if (typeof body.input?.[field] !== 'string')
        return failure('Completa todos los datos de la solicitud.');
      input[field] = body.input[field]!.trim();
    }
    input.consent = body.input.consent === true;
    try {
      validateGuestBooking(input);
    } catch (e) {
      return failure(e instanceof Error ? e.message : 'Revisa los datos.');
    }
    // Vercel overwrites this header at its edge. Never accept arbitrary proxy IP headers elsewhere.
    const ip =
      process.env.VERCEL === '1'
        ? (request.headers.get('x-forwarded-for') || 'unknown')
            .split(',')[0]
            .trim()
        : 'local';
    const verification = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({ secret, response: body.captcha }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!verification.ok)
      return failure('No pudimos verificar el envío. Intenta nuevamente.', 503);
    const verified = (await verification.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
    };
    if (
      verified.success !== true ||
      verified.action !== 'booking' ||
      verified.hostname !== new URL(origin).hostname
    )
      return failure(
        'La verificación venció o no es válida. Intenta nuevamente.',
        403,
      );
    const hash = (value: string) =>
      createHmac('sha256', key).update(value).digest('hex');
    const result = await fetch(url + '/rest/v1/rpc/rental_submit_guest_order', {
      method: 'POST',
      headers: {
        apikey: key,
        ...(key.startsWith('sb_secret_')
          ? {}
          : { Authorization: 'Bearer ' + key }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_input: input,
        p_request_id: body.request_id,
        p_client_hash: hash('ip:' + ip),
        p_identity_hash: hash(
          'contact:' +
            input.document.toUpperCase() +
            ':' +
            input.email.toLowerCase(),
        ),
        p_payload_hash: hash(JSON.stringify(input)),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) {
      const error = (await result.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
      };
      if (error.code === 'P0001' && typeof error.message === 'string')
        return failure(
          error.message,
          /solicitudes|más tarde/.test(error.message) ? 429 : 409,
        );
      return failure(
        'No pudimos guardar la solicitud. Revisa los datos o intenta nuevamente.',
        503,
      );
    }
    const order = await result.json();
    return Response.json({ order }, { headers });
  } catch {
    return failure(
      'No pudimos guardar la solicitud. Revisa tu conexión e intenta nuevamente.',
      503,
    );
  }
}
