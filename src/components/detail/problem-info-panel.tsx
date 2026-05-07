'use client';
import { useState } from 'react';
import { LeetcodeRecord, Proficiency } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { RotateCcw, ExternalLink, Code2, Calendar } from 'lucide-react';

const PROFICIENCY_ORDER: Proficiency[] = ['生疏', '理解', '熟練'];

const PROFICIENCY_STYLE: Record<Proficiency, string> = {
  生疏: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  理解: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  熟練: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export default function ProblemInfoPanel({ record }: { record: LeetcodeRecord }) {
  const [proficiency, setProficiency] = useState<Proficiency>(record.proficiency);
  const [saving, setSaving] = useState(false);

  const cycleProficiency = async () => {
    const next =
      PROFICIENCY_ORDER[(PROFICIENCY_ORDER.indexOf(proficiency) + 1) % PROFICIENCY_ORDER.length];
    setProficiency(next);
    if (USE_MOCK) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('leetcode_records').update({ proficiency: next }).eq('id', record.id);
    setSaving(false);
  };

  const slug = record.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.015] p-5 space-y-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-muted-foreground/50 select-none">
            #{record.problem_id}
          </span>
          <h1 className="text-xl font-bold leading-snug mt-0.5">{record.title}</h1>
        </div>
        <a
          href={`https://leetcode.com/problems/${slug}/`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground/60 hover:text-foreground transition-colors mt-1"
        >
          LeetCode <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* One-line: Difficulty ┊ Proficiency [更新] ┊ Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Difficulty */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${DIFFICULTY_STYLE[record.difficulty]}`}
        >
          {record.difficulty}
        </span>

        <span className="h-4 w-px bg-white/12 shrink-0" />

        {/* Proficiency + cycle button */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${PROFICIENCY_STYLE[proficiency]}`}
        >
          {proficiency}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground gap-1 -ml-1"
          onClick={cycleProficiency}
          disabled={saving}
        >
          <RotateCcw className="w-3 h-3" />
          更新
        </Button>

        {record.tags.length > 0 && (
          <span className="h-4 w-px bg-white/12 shrink-0" />
        )}

        {/* Tags */}
        {record.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[11px] px-2 py-0 bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Footer meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 border-t border-white/5 text-[11px] text-muted-foreground/50">
        <span className="flex items-center gap-1">
          <Code2 className="w-3 h-3" />
          {record.solutions.length} 個解法
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          建立 {new Date(record.created_at).toLocaleDateString('zh-TW')}
        </span>
        <span>最後更新 {new Date(record.updated_at).toLocaleDateString('zh-TW')}</span>
      </div>
    </div>
  );
}
