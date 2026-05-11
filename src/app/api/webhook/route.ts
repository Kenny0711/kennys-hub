import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { WebhookPayload } from '@/lib/types';

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

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const code = stripCodeFence(body.code ?? '');
  const language = normalizeLanguage(body.language, code);
  const isMetadataOnlySync = Boolean(body.skip_if_exists || body.tags_only);

  if (!isMetadataOnlySync && !isLikelyCompleteCode(code)) {
    return NextResponse.json(
      { error: 'Code capture looks incomplete. Please refresh LeetCode and submit again after the editor finishes syncing.' },
      { status: 422 }
    );
  }

  const solution = {
    method: '',
    code,
    language,
    time_complexity: '',
    space_complexity: '',
    notes: '',
    submitted_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('leetcode_records')
    .select('id, solutions')
    .eq('problem_id', body.problem_id)
    .maybeSingle();

  if (existing) {
    if (body.skip_if_exists) {
      return NextResponse.json({ status: 'skipped', id: existing.id });
    }

    if (body.tags_only) {
      const { error } = await supabase
        .from('leetcode_records')
        .update({ tags: body.tags ?? [] })
        .eq('id', existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: 'tags_updated', id: existing.id });
    }

    const solutions = [...(existing.solutions ?? []), solution];
    const updatePayload: Record<string, unknown> = {
      solutions,
      title: body.title,
      difficulty: body.difficulty,
      tags: body.tags ?? [],
    };
    const { error } = await supabase
      .from('leetcode_records')
      .update(updatePayload)
      .eq('id', existing.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: 'updated', id: existing.id });
  }

  const { data: inserted, error } = await supabase
    .from('leetcode_records')
    .insert({
      problem_id: body.problem_id,
      title: body.title,
      difficulty: body.difficulty,
      tags: body.tags,
      proficiency: '理解',
      solutions: [solution],
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: 'created', id: inserted.id }, { status: 201 });
}
