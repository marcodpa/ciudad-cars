export const dynamic = 'force-dynamic';
export function GET() {
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const enabled =
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    ) &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.TURNSTILE_SECRET_KEY &&
    !!sitekey;
  return Response.json(
    { enabled, sitekey: enabled ? sitekey : '' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
