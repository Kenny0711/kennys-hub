import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const token = (await cookies()).get(ADMIN_AUTH_COOKIE)?.value;
  if (!await isValidAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await getSupabaseAdmin().from('notion_webhook_setup')
    .select('verification_token, received_at').eq('id', true).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? { verification_token: null }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
