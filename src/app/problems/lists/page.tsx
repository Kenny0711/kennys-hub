import { ProblemListOverview } from '@/components/problem-lists/problem-list-overview';
import { ProblemsNavigation } from '@/components/problem-lists/problems-navigation';
import { PAGE_SHELL, PageHeader } from '@/components/layout/page-header';
import { getListProblems, problemLists } from '@/data/problem-lists';
import { ArrowUpRight } from 'lucide-react';

export default function ProblemListsPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        meta="Kenny's Dev Hub / Problem Lists"
        status={`${problemLists.length} curated lists`}
        title="Problem "
        accent="Lists."
        description="靈神刷題路線：依原題單章節練習各主題。"
      >
        <ProblemsNavigation active="lists" />
      </PageHeader>
      <div className={`${PAGE_SHELL} py-12 lg:py-16`}>
        <div className="mb-7 flex flex-col items-start gap-3 border-b border-white/15 pb-5 font-mono text-xs uppercase sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-400">12 個主題 / 完整題單</p>
          <a
            href="https://leetcode.cn/discuss/post/3141566/ru-he-ke-xue-shua-ti-by-endlesscheng-q3yd/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-brand transition-colors hover:text-paper"
          >
            查看完整刷題路線 <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <ProblemListOverview lists={problemLists.map((list) => ({
          id: list.id,
          title: list.title,
          author: list.author,
          sourceUrl: list.sourceUrl,
          description: list.description,
          initialCompleted: list.initialCompleted,
          problems: getListProblems(list).map(({ id, title, difficultyScore }) => ({ id, title, difficultyScore })),
        }))} />
      </div>
    </div>
  );
}
