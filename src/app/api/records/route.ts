import { NextResponse } from 'next/server';
import { getLeetcodeReadClient } from '@/lib/leetcode-read-client';

export async function GET() {
  const supabase = await getLeetcodeReadClient();
  const { data, error } = await supabase
    .from('leetcode_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
