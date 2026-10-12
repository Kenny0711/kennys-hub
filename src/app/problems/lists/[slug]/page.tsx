import { notFound } from 'next/navigation';
import { ProblemListChecklist } from '@/components/problem-lists/problem-list-checklist';
import { ProblemsNavigation } from '@/components/problem-lists/problems-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { getProblemList } from '@/data/problem-lists';

export default async function ProblemListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const list = getProblemList(slug);
  if (!list) return notFound();

  return (
    <div className="min-h-screen">
      <PageHeader
        meta={`Kenny's Dev Hub / Problem Lists / ${list.title}`}
        status={list.author}
        title="Problem "
        accent="Lists."
        description="依學習路線整理的刷題計畫。"
      >
        <ProblemsNavigation active="lists" />
      </PageHeader>
      <ProblemListChecklist key={list.id} list={list} />
    </div>
  );
}
