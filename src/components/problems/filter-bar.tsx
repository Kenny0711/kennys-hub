'use client';
import { Filters } from '@/hooks/use-filter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';

interface Props {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  allTags: string[];
  total: number;
  filtered: number;
}

export default function FilterBar({ filters, setFilter, allTags, total, filtered }: Props) {
  const isFiltering =
    filters.difficulty !== 'All' ||
    filters.proficiency !== 'All' ||
    filters.tag !== 'All' ||
    filters.search !== '';

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="font-medium uppercase tracking-wider">篩選</span>
        {isFiltering && (
          <span className="ml-auto text-sky-400 font-medium">
            {filtered} / {total} 題
          </span>
        )}
        {!isFiltering && (
          <span className="ml-auto">共 {total} 題</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋題目名稱..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-colors"
          />
        </div>

        <Select value={filters.difficulty} onValueChange={(v) => v && setFilter('difficulty', v)}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-sm h-9">
            <SelectValue placeholder="難度" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="All">全部難度</SelectItem>
            <SelectItem value="Easy" className="text-emerald-400">Easy</SelectItem>
            <SelectItem value="Medium" className="text-amber-400">Medium</SelectItem>
            <SelectItem value="Hard" className="text-rose-400">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.proficiency} onValueChange={(v) => v && setFilter('proficiency', v)}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10 text-sm h-9">
            <SelectValue placeholder="熟練度" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="All">全部熟練度</SelectItem>
            <SelectItem value="生疏">生疏</SelectItem>
            <SelectItem value="理解">理解</SelectItem>
            <SelectItem value="熟練">熟練</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.tag} onValueChange={(v) => v && setFilter('tag', v)}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-sm h-9">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag === 'All' ? '全部 Tag' : tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltering && (
          <button
            onClick={() => {
              setFilter('difficulty', 'All');
              setFilter('proficiency', 'All');
              setFilter('tag', 'All');
              setFilter('search', '');
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-auto"
          >
            清除篩選
          </button>
        )}
      </div>
    </div>
  );
}
