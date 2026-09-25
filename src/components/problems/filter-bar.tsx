'use client';
import { Filters } from '@/hooks/use-filter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Props {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  allTags: string[];
  total: number;
  filtered: number;
}

const TRIGGER_CLASS =
  'data-[size=default]:h-11 border-white/15 bg-transparent font-mono text-xs uppercase dark:bg-transparent dark:hover:bg-white/5';
const CONTENT_CLASS = 'border border-white/15 bg-surface ring-0';

export default function FilterBar({ filters, setFilter, allTags, total, filtered }: Props) {
  const isFiltering =
    filters.difficulty !== 'All' ||
    filters.proficiency !== 'All' ||
    filters.tag !== 'All' ||
    filters.search !== '';

  return (
    <div className="border border-white/15 bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-white/15 px-4 py-3 font-mono text-[11px] uppercase">
        <span className="text-zinc-400">Filter</span>
        <div className="flex items-center gap-4">
          {isFiltering ? (
            <>
              <span className="text-brand">
                {filtered} / {total} 題
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilter('difficulty', 'All');
                  setFilter('proficiency', 'All');
                  setFilter('tag', 'All');
                  setFilter('search', '');
                }}
                className="border-b border-white/30 text-zinc-300 transition-colors hover:border-brand hover:text-brand"
              >
                清除篩選
              </button>
            </>
          ) : (
            <span className="text-zinc-400">共 {total} 題</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="搜尋題目名稱..."
            aria-label="搜尋題目名稱"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="h-11 w-full border border-white/15 bg-transparent pl-9 pr-3 text-sm text-paper transition-colors placeholder:text-zinc-500 hover:border-white/30 focus:border-brand focus:outline-none"
          />
        </div>

        <Select value={filters.difficulty} onValueChange={(v) => v && setFilter('difficulty', v)}>
          <SelectTrigger className={`w-36 ${TRIGGER_CLASS}`}>
            <SelectValue placeholder="難度" />
          </SelectTrigger>
          <SelectContent className={CONTENT_CLASS}>
            <SelectItem value="All">全部難度</SelectItem>
            <SelectItem value="Easy" className="text-emerald-400">Easy</SelectItem>
            <SelectItem value="Medium" className="text-amber-400">Medium</SelectItem>
            <SelectItem value="Hard" className="text-rose-400">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.proficiency} onValueChange={(v) => v && setFilter('proficiency', v)}>
          <SelectTrigger className={`w-36 ${TRIGGER_CLASS}`}>
            <SelectValue placeholder="熟練度" />
          </SelectTrigger>
          <SelectContent className={CONTENT_CLASS}>
            <SelectItem value="All">全部熟練度</SelectItem>
            <SelectItem value="生疏">生疏</SelectItem>
            <SelectItem value="理解">理解</SelectItem>
            <SelectItem value="熟練">熟練</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.tag} onValueChange={(v) => v && setFilter('tag', v)}>
          <SelectTrigger className={`w-44 ${TRIGGER_CLASS}`}>
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent className={CONTENT_CLASS}>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag === 'All' ? '全部 Tag' : tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
