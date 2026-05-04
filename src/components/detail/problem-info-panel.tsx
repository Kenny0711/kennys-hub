'use client';
import { useState } from 'react';
import { LeetcodeRecord, Proficiency } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { RotateCcw } from 'lucide-react';

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

  const leetcodeSlug = record.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="space-y-6">
      {/* Number + Title */}
      <div>
        <p className="text-xs text-muted-foreground font-mono mb-1 select-none">
          #{record.problem_id}
        </p>
        <h1 className="text-xl font-bold leading-snug">{record.title}</h1>
      </div>

      {/* Difficulty + LeetCode link */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${DIFFICULTY_STYLE[record.difficulty]}`}
        >
          {record.difficulty}
        </span>
        <a
          href={`https://leetcode.com/problems/${leetcodeSlug}/`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          在 LeetCode 查看 ↗
        </a>
      </div>

      {/* Tags */}
      {record.tags.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {record.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Proficiency */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
          熟練度
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${PROFICIENCY_STYLE[proficiency]}`}
          >
            {proficiency}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={cycleProficiency}
            disabled={saving}
          >
            <RotateCcw className="w-3 h-3" />
            更新
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          點擊「更新」循環切換熟練度
        </p>
      </div>

      {/* Meta info */}
      <div className="pt-4 border-t border-white/5 space-y-1.5">
        <p className="text-xs text-muted-foreground">
          <span className="text-muted-foreground/50">解法數：</span>
          <span className="text-sky-400 font-medium">{record.solutions.length}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="text-muted-foreground/50">建立：</span>
          {new Date(record.created_at).toLocaleDateString('zh-TW')}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="text-muted-foreground/50">最後更新：</span>
          {new Date(record.updated_at).toLocaleDateString('zh-TW')}
        </p>
      </div>
    </div>
  );
}
