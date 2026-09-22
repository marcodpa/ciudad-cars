export const dynamic = 'force-dynamic';
export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  // Only the explicitly named public key may leave the server. No service-role fallback.
  const configured =
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) &&
    key.startsWith('sb_publishable_');
  return Response.json(
    { configured, url: configured ? url : '', key: configured ? key : '' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
