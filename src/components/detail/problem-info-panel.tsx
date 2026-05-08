'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeetcodeRecord, Proficiency } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock4,
  Code2,
  ExternalLink,
  RotateCcw,
  Trash2,
} from 'lucide-react';

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
const REVIEW_INTERVAL: Record<Proficiency, number> = { 生疏: 1, 理解: 4, 熟練: 14 };

function ReviewBadge({
  proficiency,
  updatedAt,
  now,
}: {
  proficiency: Proficiency;
  updatedAt: string;
  now: string;
}) {
  const days = Math.max(
    0,
    Math.floor((new Date(now).getTime() - new Date(updatedAt).getTime()) / 86_400_000)
  );
  const interval = REVIEW_INTERVAL[proficiency];

  if (days >= interval * 2) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        強烈建議複習 · {days} 天
      </span>
    );
  }

  if (days >= interval) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
        <Clock4 className="h-3.5 w-3.5" />
        可以複習了 · {days} 天
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" />
      近期已練習
    </span>
  );
}

export default function ProblemInfoPanel({ record, now }: { record: LeetcodeRecord; now: string }) {
  const router = useRouter();
  const [proficiency, setProficiency] = useState<Proficiency>(record.proficiency);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [description, setDescription] = useState<string | undefined>(record.description);
  const [fetchingDesc, setFetchingDesc] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    if (!USE_MOCK) {
      const supabase = createClient();
      await supabase.from('leetcode_records').delete().eq('id', record.id);
    }
    router.push('/problems');
    router.refresh();
  };

  const leetcodeSlug =
    record.lc_slug ??
    record.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const fetchDescription = async () => {
    setFetchingDesc(true);
    setDescError(null);
    try {
      const res = await fetch('/api/fetch-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: leetcodeSlug, recordId: record.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDescription(json.description);
      setDescOpen(true);
    } catch (e) {
      setDescError((e as Error).message);
    } finally {
      setFetchingDesc(false);
    }
  };

  return (
    <>
    <div className="rounded-xl border border-white/8 bg-white/[0.015] p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-muted-foreground/50 select-none">
            #{record.problem_id}
          </span>
          <h1 className="text-xl font-bold leading-snug mt-0.5">{record.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <a
            href={`https://leetcode.com/problems/${leetcodeSlug}/`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            LeetCode <ExternalLink className="w-3 h-3" />
          </a>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground/50 hover:text-foreground"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                取消
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '刪除中...' : '確認刪除'}
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground/30 hover:text-rose-400 hover:bg-rose-500/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${DIFFICULTY_STYLE[record.difficulty]}`}
        >
          {record.difficulty}
        </span>

        <span className="h-4 w-px bg-white/12 shrink-0" />

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

        {record.tags.length > 0 && <span className="h-4 w-px bg-white/12 shrink-0" />}

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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-white/5 text-[11px] text-muted-foreground/50">
        <span className="flex items-center gap-1">
          <Code2 className="w-3 h-3" />
          {record.solutions.length} 個解法
        </span>
        <span>建立 {new Date(record.created_at).toLocaleDateString('zh-TW')}</span>
        <span>最後更新 {new Date(record.updated_at).toLocaleDateString('zh-TW')}</span>
        <ReviewBadge proficiency={proficiency} updatedAt={record.updated_at} now={now} />
      </div>
    </div>

    {/* Collapsible problem description */}
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => description && setDescOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <span>📄 題目描述</span>
          {description && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${descOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        {!description && (
          <button
            onClick={fetchDescription}
            disabled={fetchingDesc}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-white/12 text-muted-foreground/60 hover:text-foreground hover:border-white/25 hover:bg-white/5 disabled:opacity-40 transition-colors"
          >
            {fetchingDesc ? '載入中...' : '載入描述'}
          </button>
        )}
      </div>
      {descError && (
        <p className="px-5 pb-3 text-xs text-rose-400">{descError}</p>
      )}
      {description && descOpen && (
        <div
          className="px-6 pb-6 pt-1 border-t border-white/5 bg-white/[0.01] text-sm text-foreground/75 leading-relaxed
            [&_p]:mb-3 [&_p:last-child]:mb-0
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
            [&_pre]:bg-white/5 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre]:text-xs [&_pre]:font-mono
            [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
            [&_strong]:text-foreground [&_em]:text-foreground/60
            [&_sup]:text-[10px]"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
    </>
  );
}
