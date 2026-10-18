import { cookies } from 'next/headers';
import { after, NextRequest, NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { getNotionSchema, notionConfigured, queryNotionPages } from '@/lib/notion-api';
import { drainNotionQueue } from '@/lib/notion-sync';
import { isAcceptedStatus, problemIdFromPage } from '@/lib/notion-sync-core';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { LeetcodeRecord } from '@/lib/types';

export const maxDuration = 60;

async function authorized(): Promise<boolean> {
  return isValidAdminToken((await cookies()).get(ADMIN_AUTH_COOKIE)?.value);
}

async function inspectBackfill() {
  const supabase = getSupabaseAdmin();
  const [schema, pages] = await Promise.all([getNotionSchema(), queryNotionPages()]);
  const records: LeetcodeRecord[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('leetcode_records').select('*')
      .order('problem_id').range(offset, offset + 999);
    if (error) throw error;
    records.push(...(data as LeetcodeRecord[]));
    if (!data || data.length < 1000) break;
  }
  const byId = new Map<number, typeof pages>();
  for (const page of pages) {
    const id = problemIdFromPage(page);
    if (id) byId.set(id, [...(byId.get(id) ?? []), page]);
  }
  const plan = records.map((record) => {
    const accepted = record.solutions.some((solution) =>
      solution.status === 'accepted' || isAcceptedStatus(solution.submission_status));
    const matches = byId.get(record.problem_id) ?? [];
    return {
      problem_id: record.problem_id,
      title: record.title,
      action: !accepted ? 'skip_unverified' : matches.length > 1 ? 'ambiguous'
        : matches.length === 1 ? 'link_and_update_hub_fields' : 'create',
      notion_page_id: matches.length === 1 ? matches[0].id : null,
    };
  });
  return { schema_ready: schema.properties['LeetCode ID']?.type === 'number', plan };
}

export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!notionConfigured()) return NextResponse.json({ error: 'Notion is not configured' }, { status: 503 });
  try {
    return NextResponse.json(await inspectBackfill(), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Notion backfill dry-run failed:', error);
    return NextResponse.json({ error: 'Dry-run failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!notionConfigured()) return NextResponse.json({ error: 'Notion is not configured' }, { status: 503 });
  let body: { confirmation?: string; problem_ids?: number[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (body.confirmation !== 'APPLY_NOTION_BACKFILL' ||
      !Array.isArray(body.problem_ids) || body.problem_ids.length < 1 || body.problem_ids.length > 20) {
    return NextResponse.json({ error: 'Confirm and select 1-20 problem IDs' }, { status: 400 });
  }
  try {
    const { schema_ready, plan } = await inspectBackfill();
    if (!schema_ready) return NextResponse.json({ error: 'Add numeric LeetCode ID property first' }, { status: 412 });
    const selected = [...new Set(body.problem_ids)];
    const eligible = new Map(plan.filter((item) =>
      item.action === 'create' || item.action === 'link_and_update_hub_fields'
    ).map((item) => [item.problem_id, item]));
    if (selected.some((id) => !eligible.has(id))) {
      return NextResponse.json({ error: 'Selection contains an ambiguous or unverified problem' }, { status: 409 });
    }
    const supabase = getSupabaseAdmin();
    for (const id of selected) {
      const { error } = await supabase.rpc('enqueue_notion_problem', { p_problem_id: id });
      if (error) throw error;
    }
    after(async () => {
      try { await drainNotionQueue(3); }
      catch (error) { console.error('Notion backfill worker failed:', error); }
    });
    return NextResponse.json({ queued: selected });
  } catch (error) {
    console.error('Notion backfill apply failed:', error);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
