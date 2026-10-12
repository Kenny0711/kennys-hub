'use client';

import { Bookmark, ChevronDown, ExternalLink } from 'lucide-react';
import {
  getSectionProblems,
  type ListProblem,
  type ProblemListSection as Section,
} from '@/data/problem-lists';

interface Props {
  section: Section;
  depth?: number;
  completed: Set<string>;
  review: Set<string>;
  matches: (problem: ListProblem) => boolean;
  filterActive: boolean;
  expanded: Set<string>;
  onToggleSection: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onToggleReview: (id: string) => void;
  optional?: boolean;
}

export function ProblemListSection({
  section,
  depth = 0,
  completed,
  review,
  matches,
  filterActive,
  expanded,
  onToggleSection,
  onToggleCompleted,
  onToggleReview,
  optional = false,
}: Props) {
  const allProblems = getSectionProblems(section);
  const visibleProblems = (section.problems ?? []).filter(matches);
  const visibleChildren = (section.sections ?? []).filter((child) =>
    getSectionProblems(child).some(matches)
  );
  if (filterActive && visibleProblems.length === 0 && visibleChildren.length === 0) return null;

  const done = allProblems.filter((problem) => completed.has(problem.id)).length;
  const open = filterActive || expanded.has(section.id);
  const isOptional = optional || !!section.optional;

  return (
    <section className={depth === 0 ? 'border-t border-white/15 first:border-t-0' : 'border-l border-white/15'}>
      <button
        type="button"
        onClick={() => onToggleSection(section.id)}
        disabled={filterActive}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-default ${depth === 0 ? 'bg-surface sm:px-5 sm:py-4' : 'sm:px-4'}`}
      >
        <ChevronDown className={`size-4 shrink-0 text-brand transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className={`min-w-0 flex-1 font-semibold text-paper ${depth === 0 ? 'text-base' : 'text-sm'}`}>{section.title}</span>
        {section.optional && <span className="hidden font-mono text-[11px] uppercase text-zinc-500 sm:inline">選做</span>}
        <span className="shrink-0 font-mono text-xs text-zinc-400">{done} / {allProblems.length}</span>
      </button>

      {open && (
        <div className={depth === 0 ? 'px-2 pb-2 sm:px-4' : 'pl-2 sm:pl-4'}>
          {visibleChildren.map((child) => (
            <ProblemListSection
              key={child.id}
              section={child}
              depth={depth + 1}
              completed={completed}
              review={review}
              matches={matches}
              filterActive={filterActive}
              expanded={expanded}
              onToggleSection={onToggleSection}
              onToggleCompleted={onToggleCompleted}
              onToggleReview={onToggleReview}
              optional={isOptional}
            />
          ))}
          {visibleProblems.map((problem) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              sectionId={section.id}
              completed={completed.has(problem.id)}
              review={review.has(problem.id)}
              optional={isOptional || !!problem.optional}
              onToggleCompleted={onToggleCompleted}
              onToggleReview={onToggleReview}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface RowProps {
  problem: ListProblem;
  sectionId: string;
  completed: boolean;
  review: boolean;
  optional: boolean;
  onToggleCompleted: (id: string) => void;
  onToggleReview: (id: string) => void;
}

function ProblemRow({
  problem,
  sectionId,
  completed,
  review,
  optional,
  onToggleCompleted,
  onToggleReview,
}: RowProps) {
  return (
    <div
      id={`problem-${sectionId}-${problem.id}`}
      className={`group flex scroll-mt-24 items-center gap-3 border-b border-white/10 px-2 py-3 last:border-b-0 sm:px-3 ${completed ? 'bg-brand/[0.035]' : ''}`}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggleCompleted(problem.id)}
        aria-label={`${completed ? '取消完成' : '標記完成'} ${problem.id} ${problem.title}`}
        className="size-4 shrink-0 cursor-pointer accent-brand"
      />
      <div className="min-w-0 flex-1">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex max-w-full items-baseline gap-2 text-sm font-medium transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-brand ${completed ? 'text-zinc-400' : 'text-paper'}`}
        >
          <span className="shrink-0 font-mono text-xs text-zinc-500">{problem.id}</span>
          <span className="min-w-0 break-words">{problem.title}</span>
          <ExternalLink className="hidden size-3 shrink-0 self-center text-zinc-500 sm:inline" />
        </a>
        {(problem.difficultyScore || problem.premium || optional) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
            {problem.difficultyScore && <span className="font-mono">{problem.difficultyScore}</span>}
            {problem.premium && <span>Premium</span>}
            {optional && <span>選做</span>}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onToggleReview(problem.id)}
        aria-label={`${review ? '取消複習標記' : '標記需要複習'} ${problem.id} ${problem.title}`}
        aria-pressed={review}
        title={review ? '取消複習標記' : '需要複習'}
        className={`inline-flex size-8 shrink-0 items-center justify-center transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand ${review ? 'text-coral' : 'text-zinc-500 hover:text-paper'}`}
      >
        <Bookmark className={`size-4 ${review ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
