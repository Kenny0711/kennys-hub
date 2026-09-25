import { notFound } from 'next/navigation';
import { PAGE_SHELL, SectionHeader } from '@/components/layout/page-header';
import { MOCK_RECORDS } from '@/lib/mock-data';
import { getLeetcodeReadClient } from '@/lib/leetcode-read-client';
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
    const supabase = await getLeetcodeReadClient();
    const { data } = await supabase
      .from('leetcode_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    record = data;
  }

  if (!record) return notFound();
  const now = new Date().toISOString();

  return (
    <div className="min-h-screen">
      <ProblemInfoPanel record={record} now={now} />

      <section className={`${PAGE_SHELL} py-12 lg:py-16`}>
        <SectionHeader
          eyebrow="Solutions / 02"
          title="Solutions."
          description="每一種寫法、複雜度與筆記。"
        />
        <SolutionTabs
          key={record.id}
          solutions={record.solutions}
          createdAt={record.created_at}
          updatedAt={record.updated_at}
          recordId={record.id}
          problemTitle={record.title}
        />
      </section>
    </div>
  );
}
