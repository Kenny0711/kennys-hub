'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { getListProblems, getProblemSectionPath, getStudyTargetProgress } from '@/data/problem-lists/utils';
import type { ListProblem, ProblemList, ProblemListSection as Section } from '@/data/problem-lists/types';
import { useProblemListProgress } from '@/hooks/use-problem-list-progress';
import { useRecords } from '@/hooks/use-records';
import { getRecordedCompletionIds } from '@/data/problem-lists/recorded-completions';
import { PAGE_SHELL } from '@/components/layout/page-header';
import { ProblemListSection } from './problem-list-section';
import { ProgressMeter } from './progress-meter';

type Filter = 'all' | 'todo' | 'completed' | 'review';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '未完成' },
  { value: 'completed', label: '已完成' },
  { value: 'review', label: '需複習' },
];

function sectionTitle(sections: Section[], id: string): string {
  for (const section of sections) {
    if (section.id === id) return section.title;
    const child = sectionTitle(section.sections ?? [], id);
    if (child) return child;
  }
  return '';
}

export function ProblemListChecklist({ list }: { list: ProblemList }) {
  const { records } = useRecords();
  const problems = getListProblems(list);
  const progress = useProblemListProgress({
    id: list.id,
    initialCompleted: list.initialCompleted,
    problemIds: problems.map((problem) => problem.id),
  }, getRecordedCompletionIds(records));
  const target = getStudyTargetProgress(problems, progress.completed);
  const reviewCount = problems.filter((problem) => progress.review.has(problem.id)).length;
  const next = target.next;
  const nextId = next?.id;
  const nextPath = useMemo(
    () => nextId ? getProblemSectionPath(list.sections, nextId) : [],
    [list, nextId]
  );
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initialNext = problems.find((problem) => !list.initialCompleted.includes(problem.id));
    return new Set(initialNext ? getProblemSectionPath(list.sections, initialNext.id) : []);
  });
  const openedSavedProgress = useRef(false);

  useEffect(() => {
    if (progress.updatedAt && !openedSavedProgress.current) {
      openedSavedProgress.current = true;
      setExpanded(new Set(nextPath));
    }
  }, [progress.updatedAt, nextPath]);

  const query = search.trim().toLocaleLowerCase();
  const filterActive = filter !== 'all' || query.length > 0;
  const matches = (problem: ListProblem) => {
    if (filter === 'todo' && progress.completed.has(problem.id)) return false;
    if (filter === 'completed' && !progress.completed.has(problem.id)) return false;
    if (filter === 'review' && !progress.review.has(problem.id)) return false;
    return !query || problem.id.toLocaleLowerCase().includes(query) ||
      problem.title.toLocaleLowerCase().includes(query);
  };
  const matchCount = problems.filter(matches).length;

  function toggleSection(id: string) {
    setExpanded((current) => {
      const nextSet = new Set(current);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      return nextSet;
    });
  }

  function continueLearning() {
    if (!next) return;
    setFilter('all');
    setSearch('');
    setExpanded((current) => new Set([...current, ...nextPath]));
    const targetId = `problem-${nextPath.at(-1)}-${next.id}`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
  }

  function resetProgress() {
    if (window.confirm(`確定要清空「${list.title}」的完成與複習進度嗎？這不會影響題庫或其他題單。`)) {
      progress.reset();
    }
  }

  return (
    <div className={`${PAGE_SHELL} py-12 lg:py-16`}>
      <Link href="/problems/lists" className="inline-flex items-center gap-2 font-mono text-xs uppercase text-zinc-400 transition-colors hover:text-brand">
        <ArrowLeft className="size-4" /> 題單列表
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-5 border-b border-white/15 pb-7">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold uppercase text-coral">Curated / {list.author}</p>
          <h2 className="font-display mt-3 text-4xl leading-none text-paper sm:text-6xl">{list.title}</h2>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{list.description}</p>
          <a href={list.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 font-mono text-xs uppercase text-zinc-400 transition-colors hover:text-brand">
            {list.author} · 原始題單 <ExternalLink className="size-3" />
          </a>
        </div>
        <button
          type="button"
          onClick={resetProgress}
          className="inline-flex h-10 items-center gap-2 border border-white/15 px-3 font-mono text-xs uppercase text-zinc-400 transition-colors hover:border-coral hover:text-coral focus-visible:outline-2 focus-visible:outline-coral"
        >
          <RotateCcw className="size-3.5" /> Reset Progress
        </button>
      </div>

      <div className="grid border-b border-white/15 py-7 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div><p className="font-mono text-[11px] uppercase text-zinc-500">1800 以下已完成</p><p className="mt-1 font-display text-4xl leading-none text-paper">{target.completed} <span className="font-mono text-sm font-normal text-zinc-500">/ {target.total}</span></p></div>
            <div><p className="font-mono text-[11px] uppercase text-zinc-500">1800 以下待完成</p><p className="mt-1 font-display text-4xl leading-none text-paper">{target.total - target.completed}</p></div>
            <div><p className="font-mono text-[11px] uppercase text-zinc-500">需要複習</p><p className="mt-1 font-display text-4xl leading-none text-paper">{reviewCount}</p></div>
          </div>
        </div>
        <span className="font-display text-6xl leading-none text-brand">{target.total ? Math.round(target.completed / target.total * 100) : 0}%</span>
        <div className="lg:col-span-2">
          <ProgressMeter completed={target.completed} total={target.total} />
          {progress.updatedAt && <p className="mt-2 text-right font-mono text-[11px] uppercase text-zinc-500">最後更新 {new Date(progress.updatedAt).toLocaleDateString('zh-TW')}</p>}
        </div>
      </div>

      <div className="mt-8 border-l-2 border-brand bg-surface px-5 py-5 sm:px-6">
        <p className="font-mono text-[11px] font-semibold uppercase text-brand">Continue Learning</p>
        {next ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-semibold text-paper">{next.id}. {next.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{nextPath.slice(1).map((id) => sectionTitle(list.sections, id)).join(' / ')}</p>
            </div>
            <button type="button" onClick={continueLearning} className="inline-flex min-h-10 items-center gap-2 bg-brand px-4 py-2 font-mono text-xs font-semibold uppercase text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand">
              繼續刷題 <ArrowDown className="size-4" />
            </button>
          </div>
        ) : <p className="mt-2 text-sm text-zinc-400">{target.total ? '1800 以下題目已完成。' : '尚無標示 1800 以下的題目。'}</p>}
      </div>

      <div className="mt-10 border border-white/15 bg-surface">
        <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 font-mono text-[11px] uppercase text-zinc-400">
          <span>Filter / Checklist</span>
          <span>{filterActive ? `顯示 ${matchCount} / ${problems.length} 題` : `共 ${problems.length} 題`}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap gap-1" aria-label="題單篩選">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`border px-3 py-2 font-mono text-xs uppercase transition-colors focus-visible:outline-2 focus-visible:outline-brand ${filter === item.value ? 'border-brand bg-brand text-ink' : 'border-white/15 text-zinc-400 hover:border-white/30 hover:text-paper'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <span className="sr-only">搜尋題號或題名</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜尋題號或題名"
            className="h-10 w-full border border-white/15 bg-transparent py-2 pl-9 pr-3 text-sm text-paper outline-none placeholder:text-zinc-500 focus:border-brand"
          />
        </label>
        </div>
      </div>

      <div className="mt-6 border border-white/15">
        {matchCount ? list.sections.map((section) => (
          <ProblemListSection
            key={section.id}
            section={section}
            completed={progress.completed}
            review={progress.review}
            matches={matches}
            filterActive={filterActive}
            expanded={expanded}
            onToggleSection={toggleSection}
            onToggleCompleted={progress.toggleCompleted}
            onToggleReview={progress.toggleReview}
          />
        )) : <p className="px-5 py-12 text-center text-sm text-zinc-400">沒有符合條件的題目</p>}
      </div>
    </div>
  );
}
