import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  let body: { slug: string; recordId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, recordId } = body;
  if (!slug || !recordId) {
    return NextResponse.json({ error: 'Missing slug or recordId' }, { status: 400 });
  }

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query questionContent($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              content
            }
          }
        `,
        variables: { titleSlug: slug },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `LeetCode API error: ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const description: string | null = json?.data?.question?.content ?? null;

    if (!description) {
      return NextResponse.json({ error: '無法取得題目描述（可能需要登入）' }, { status: 404 });
    }

    // Save to Supabase
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('leetcode_records')
      .update({ description })
      .eq('id', recordId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ description });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
