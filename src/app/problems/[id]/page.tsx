import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MOCK_RECORDS } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import ProblemInfoPanel from '@/components/detail/problem-info-panel';
import SolutionTabs from '@/components/detail/solution-tabs';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let record = null;
  if (USE_MOCK) {
    record = MOCK_RECORDS.find((r) => r.id === id) ?? null;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('leetcode_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    record = data;
  }

  if (!record) return notFound();

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/problems"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            題庫
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 space-y-6">
        <ProblemInfoPanel record={record} />
        <SolutionTabs solutions={record.solutions} />
      </div>
    </div>
  );
}
