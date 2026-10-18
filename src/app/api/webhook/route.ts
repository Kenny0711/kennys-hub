import { after, NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { notionConfigured } from '@/lib/notion-api';
import { drainNotionQueue } from '@/lib/notion-sync';
import { isAcceptedStatus } from '@/lib/notion-sync-core';
import { Solution, WebhookPayload } from '@/lib/types';

function stripCodeFence(code: string): string {
  return code
    .replace(/^\s*```[\w+-]*\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function normalizeLanguage(language: string | undefined, code: string): string {
  const raw = (language ?? '').toLowerCase();
  if (
    (raw === 'python' || raw === 'python3' || !raw) &&
    /\bclass\s+Solution\b/.test(code) &&
    /#include|vector<|std::|public:|private:|long long|unordered_map|unordered_set/.test(code)
  ) {
    return 'cpp';
  }
  if (raw === 'python3') return 'python';
  if (raw === 'c++') return 'cpp';
  return raw || 'code';
}

function isLikelyCompleteCode(code: string): boolean {
  const normalized = stripCodeFence(code);
  if (normalized.length < 40) return false;
  if (/^\w{1,3}$/.test(normalized)) return false;

  const hasEntryPoint = /\bclass\s+Solution\b|^\s*def\s+\w+\s*\(|\bfunction\s+\w+\s*\(/m.test(normalized);
  const hasLogic = /\b(return|for|while|if|else|switch|new|nullptr|null|None|push|pop|append)\b|->/.test(normalized);

  return (hasEntryPoint && hasLogic) || (normalized.length >= 120 && hasLogic);
}

function normalizeSolutionStatus(status: string | undefined, syncSource: string | undefined): string {
  const raw = (status ?? '').trim().toLowerCase();
  if (isAcceptedStatus(raw)) return 'accepted';
  if (raw.includes('runtime error')) return 'runtime_error';
  if (syncSource === 'manual') return 'manual_sync';
  return 'unknown';
}

async function queueNotionSync(problemId: number) {
  if (!notionConfigured()) return;
  try {
    const { error } = await getSupabaseAdmin().rpc('enqueue_notion_problem', { p_problem_id: problemId });
    if (error) throw error;
    after(async () => {
      try {
        await drainNotionQueue(1);
      } catch (cause) {
        console.error(`Notion queue worker failed for #${problemId}:`, cause);
      }
    });
  } catch (cause) {
    console.error(`Failed to enqueue Notion sync for #${problemId}:`, cause);
  }
}

async function saveAcceptedWithoutMigration(body: WebhookPayload, solution: Solution) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: readError } = await supabase.from('leetcode_records')
    .select('id, solutions').eq('problem_id', body.problem_id).maybeSingle();
  if (readError) throw readError;
  if (existing) {
    if (body.submission_id && (existing.solutions as Solution[]).some(
      (item) => item.submission_id === body.submission_id
    )) return { record_id: existing.id, added: false };
    const { error } = await supabase.from('leetcode_records').update({
      title: body.title, difficulty: body.difficulty, tags: body.tags ?? [],
      ...(body.lc_slug ? { lc_slug: body.lc_slug } : {}),
      solutions: [...(existing.solutions as Solution[]), solution],
    }).eq('id', existing.id);
    if (error) throw error;
    return { record_id: existing.id, added: true };
  }
  const { data, error } = await supabase.from('leetcode_records').insert({
    problem_id: body.problem_id, title: body.title, difficulty: body.difficulty,
    tags: body.tags ?? [], proficiency: '理解', solutions: [solution], lc_slug: body.lc_slug,
  }).select('id').single();
  if (error) throw error;
  return { record_id: data.id, added: true };
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (notionConfigured() && (!process.env.WEBHOOK_SECRET ||
      process.env.WEBHOOK_SECRET.length < 16 || process.env.WEBHOOK_SECRET === 'dev-secret')) {
    return NextResponse.json({ error: 'Set a strong WEBHOOK_SECRET before enabling Notion sync' }, { status: 503 });
  }
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!Number.isSafeInteger(body.problem_id) || body.problem_id <= 0 ||
      typeof body.title !== 'string' || !body.title.trim() ||
      !['Easy', 'Medium', 'Hard'].includes(body.difficulty)) {
    return NextResponse.json({ error: 'Invalid problem metadata' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const code = stripCodeFence(body.code ?? '');
  const language = normalizeLanguage(body.language, code);
  const isMetadataOnlySync = Boolean(body.skip_if_exists || body.tags_only);
  const syncSource = body.sync_source ?? 'auto';
  const solutionStatus = normalizeSolutionStatus(body.submission_status, syncSource);

  if (!isMetadataOnlySync && solutionStatus !== 'accepted') {
    return NextResponse.json(
      {
        error: 'Submission is not Accepted; sync skipped.',
        submission_status: body.submission_status ?? 'unknown',
      },
      { status: 422 }
    );
  }

  if (!isMetadataOnlySync && !isLikelyCompleteCode(code)) {
    return NextResponse.json(
      { error: 'Code capture looks incomplete. Please refresh LeetCode and submit again after the editor finishes syncing.' },
      { status: 422 }
    );
  }

  const parsedAcceptedAt = body.accepted_at ? new Date(body.accepted_at) : null;
  const hasVerifiedTime = Boolean(/^\d+$/.test(body.submission_id ?? '') && parsedAcceptedAt &&
    Number.isFinite(parsedAcceptedAt.getTime()) &&
    parsedAcceptedAt.getTime() > Date.UTC(2010, 0, 1) &&
    parsedAcceptedAt.getTime() <= Date.now() + 5 * 60_000);
  const solution = {
    method: '',
    code,
    language,
    time_complexity: '',
    space_complexity: '',
    notes: '',
    submitted_at: hasVerifiedTime ? parsedAcceptedAt!.toISOString() : new Date().toISOString(),
    accepted_at_verified: hasVerifiedTime,
    submission_id: body.submission_id,
    status: solutionStatus,
    submission_status: body.submission_status ?? (syncSource === 'manual' ? 'Manual Sync' : undefined),
    sync_source: syncSource,
  };

  if (isMetadataOnlySync) {
    const { data: existing, error: readError } = await supabase.from('leetcode_records')
      .select('id').eq('problem_id', body.problem_id).maybeSingle();
    if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
    if (existing) {
      if (body.skip_if_exists) return NextResponse.json({ status: 'skipped', id: existing.id });
      const { error } = await supabase.from('leetcode_records')
        .update({ tags: body.tags ?? [] }).eq('id', existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: 'tags_updated', id: existing.id });
    }
    const { data: inserted, error } = await supabase.from('leetcode_records').insert({
      problem_id: body.problem_id,
      title: body.title,
      difficulty: body.difficulty,
      tags: body.tags ?? [],
      proficiency: '理解',
      solutions: [solution],
      lc_slug: body.lc_slug,
    }).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'created', id: inserted.id }, { status: 201 });
  }

  const { data, error } = await supabase.rpc('append_accepted_solution', {
    p_problem_id: body.problem_id,
    p_title: body.title,
    p_difficulty: body.difficulty,
    p_tags: body.tags ?? [],
    p_lc_slug: body.lc_slug ?? null,
    p_solution: solution,
  });
  let result: { record_id: string; added: boolean };
  if (error) {
    if (!['PGRST202', '42883'].includes(error.code ?? '')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    try {
      result = await saveAcceptedWithoutMigration(body, solution);
    } catch (cause) {
      return NextResponse.json({ error: (cause as Error).message }, { status: 500 });
    }
  } else {
    result = (data as { record_id: string; added: boolean }[])[0];
  }
  await queueNotionSync(body.problem_id);
  return NextResponse.json({ status: result.added ? 'updated' : 'skipped_duplicate', id: result.record_id });
}
