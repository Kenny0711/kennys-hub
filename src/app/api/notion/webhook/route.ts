import { createHmac, timingSafeEqual } from 'node:crypto';
import { after, NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { pullNotionPage } from '@/lib/notion-sync';

function validSignature(raw: string, signature: string | null, token: string): boolean {
  if (!signature) return false;
  const expected = `sha256=${createHmac('sha256', token).update(raw).digest('hex')}`;
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (typeof event.verification_token === 'string') {
    if (process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: 'Webhook is already configured' }, { status: 409 });
    }
    if (!event.verification_token.startsWith('secret_')) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }
    const { error } = await getSupabaseAdmin().from('notion_webhook_setup').upsert({
      id: true, verification_token: event.verification_token,
      received_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: 'Verification setup unavailable' }, { status: 503 });
    return new Response(null, { status: 204 });
  }
  const token = process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN;
  if (!token) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  if (!validSignature(raw, req.headers.get('x-notion-signature'), token)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  if (!['page.properties_updated', 'page.content_updated', 'page.created'].includes(String(event.type))) {
    return NextResponse.json({ status: 'ignored' });
  }
  const entity = event.entity as { type?: string; id?: string } | undefined;
  const data = event.data as { parent?: { data_source_id?: string } } | undefined;
  if (entity?.type !== 'page' || !entity.id ||
      data?.parent?.data_source_id !== process.env.NOTION_DATA_SOURCE_ID) {
    return NextResponse.json({ status: 'ignored' });
  }
  after(async () => {
    try {
      await pullNotionPage(entity.id!);
    } catch (cause) {
      console.error(`Notion webhook pull failed for page ${entity.id}:`, cause);
    }
  });
  return NextResponse.json({ status: 'accepted' });
}
