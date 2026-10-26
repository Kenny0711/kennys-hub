'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { ProblemListSummary } from '@/data/problem-lists/types';
import { getStudyRouteStep } from '@/data/problem-lists/study-route';
import { getStudyTargetProgress } from '@/data/problem-lists/utils';
import { useProblemListProgress } from '@/hooks/use-problem-list-progress';
import { useRecords } from '@/hooks/use-records';
import { getRecordedCompletionIds } from '@/data/problem-lists/recorded-completions';
import { ProgressMeter } from './progress-meter';

export function ProblemListOverview({ lists }: { lists: ProblemListSummary[] }) {
  const { records } = useRecords();
  const completedRecordIds = getRecordedCompletionIds(records);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lists.map((list) => <ProblemListCard key={list.id} list={list} completedRecordIds={completedRecordIds} />)}
    </div>
  );
}

function ProblemListCard({ list, completedRecordIds }: { list: ProblemListSummary; completedRecordIds: ReadonlySet<string> }) {
  const problems = list.problems;
  const routeStep = getStudyRouteStep(list.id);
  const { completed, updatedAt } = useProblemListProgress({
    id: list.id,
    initialCompleted: list.initialCompleted,
    problemIds: problems.map((problem) => problem.id),
  }, completedRecordIds);
  const target = getStudyTargetProgress(problems, completed);
  const percent = target.total ? Math.round((target.completed / target.total) * 100) : 0;

  return (
    <article className="flex h-full flex-col border border-white/15 bg-surface p-5 transition-colors hover:border-white/30 hover:bg-surface-hover sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase text-coral">{routeStep ? `核心路線 / ${routeStep}` : '延伸主題'}</div>
          <h2 className="text-xl font-semibold leading-snug text-paper sm:text-2xl">
            <Link href={`/problems/lists/${list.id}`} className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
              {list.title}
            </Link>
          </h2>
          <p className="mt-2 font-mono text-[11px] uppercase text-zinc-500">by {list.author}</p>
        </div>
        <Link
          href={`/problems/lists/${list.id}`}
          aria-label={`開啟${list.title}`}
          className="inline-flex size-10 shrink-0 items-center justify-center border border-white/15 text-zinc-400 transition-colors hover:border-brand hover:bg-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-5 text-sm leading-6 text-zinc-400">{list.description}</p>

      <div className="mt-auto flex items-end justify-between gap-4 pt-10">
        <p className="font-mono text-xs uppercase text-zinc-400">1800 以下 <span className="font-semibold text-paper">{target.completed}</span> / {target.total}</p>
        <span className="font-mono text-lg font-semibold text-brand">{percent}%</span>
      </div>
      <ProgressMeter completed={target.completed} total={target.total} className="mt-3" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-xs text-zinc-400">
        <span className="min-w-0 break-words">{target.next ? `Next: #${target.next.id} ${target.next.title}` : target.total ? '1800 以下題目已完成' : '尚無標示 1800 以下的題目'}</span>
        {updatedAt && (
          <time dateTime={updatedAt}>更新 {new Date(updatedAt).toLocaleDateString('zh-TW')}</time>
        )}
      </div>
      <a
        href={list.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase text-zinc-400 transition-colors hover:text-brand"
      >
        原始題單 <ExternalLink className="size-3" aria-hidden="true" />
      </a>
    </article>
  );
}
