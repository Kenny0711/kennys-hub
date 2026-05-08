import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();

  const code = stripCodeFence(body.code ?? '');
  const language = normalizeLanguage(body.language, code);

  const solution = {
    method: '',
    code,
    language,
    time_complexity: '',
    space_complexity: '',
    notes: '',
  };

  const { data: existing } = await supabase
    .from('leetcode_records')
    .select('id, solutions')
    .eq('problem_id', body.problem_id)
    .maybeSingle();

  if (existing) {
    // 歷史匯入模式：已存在就直接跳過，不新增 solution
    if (body.skip_if_exists) {
      return NextResponse.json({ status: 'skipped', id: existing.id });
    }

    // Tags 補全模式：只更新 tags，不動 solutions
    if (body.tags_only) {
      const { error } = await supabase
        .from('leetcode_records')
        .update({ tags: body.tags ?? [] })
        .eq('id', existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: 'tags_updated', id: existing.id });
    }

    const solutions = [...(existing.solutions ?? []), solution];
    const { error } = await supabase
      .from('leetcode_records')
      .update({
        solutions,
        title: body.title,
        difficulty: body.difficulty,
        tags: body.tags ?? [],
      })
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
