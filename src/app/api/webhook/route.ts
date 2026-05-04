import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WebhookPayload } from '@/lib/types';

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

  const solution = {
    method: 'Initial Capture',
    code: body.code ?? '',
    language: body.language ?? 'python',
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
    const solutions = [...(existing.solutions ?? []), solution];
    const { error } = await supabase
      .from('leetcode_records')
      .update({ solutions })
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
