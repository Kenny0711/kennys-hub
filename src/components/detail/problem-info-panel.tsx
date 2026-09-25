'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeetcodeRecord, Proficiency } from '@/lib/types';
import { PAGE_SHELL } from '@/components/layout/page-header';
import DifficultyTag from '@/components/problems/difficulty-tag';
import ProficiencyBadge from '@/components/problems/proficiency-badge';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock4,
  FileText,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const PROFICIENCY_ORDER: Proficiency[] = ['生疏', '理解', '熟練'];

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const REVIEW_INTERVAL: Record<Proficiency, number> = { 生疏: 1, 理解: 4, 熟練: 14 };

const OUTLINE_BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2.5 text-sm transition-colors';

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
      <span className="inline-flex items-center gap-1.5 text-rose-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        強烈建議複習 · {days} 天
      </span>
    );
  }

  if (days >= interval) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400">
        <Clock4 className="h-3.5 w-3.5" />
        可以複習了 · {days} 天
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" />
      近期已練習
    </span>
  );
}

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-background p-5">
      <p className="font-mono text-[11px] uppercase text-zinc-500">{label}</p>
      <div className="mt-3 text-sm font-semibold text-paper">{children}</div>
    </div>
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
    await fetch(`/api/records/${record.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proficiency: next }),
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    if (!USE_MOCK) {
      await fetch(`/api/records/${record.id}`, { method: 'DELETE' });
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

  const fmt = (d: string) => new Date(d).toLocaleDateString('zh-TW');

  return (
    <>
      <section className="border-b border-white/15">
        <div className={`${PAGE_SHELL} py-7 lg:py-10`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[11px] uppercase text-zinc-400 sm:text-xs">
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Problem Set / #{record.problem_id}
            </Link>
            <ReviewBadge proficiency={proficiency} updatedAt={record.updated_at} now={now} />
          </div>

          <div className="rise grid gap-8 py-10 lg:grid-cols-12 lg:items-end lg:py-14">
            <h1 className="font-display break-words text-5xl leading-[0.9] text-paper sm:text-7xl lg:col-span-8 xl:text-8xl">
              {record.title}
            </h1>

            <div className="flex flex-wrap gap-2 lg:col-span-4 lg:justify-end">
              <a
                href={`https://leetcode.com/problems/${leetcodeSlug}/`}
                target="_blank"
                rel="noreferrer"
                className={`${OUTLINE_BUTTON} border-white/20 font-semibold text-zinc-200 hover:border-brand hover:bg-brand hover:text-brand-foreground`}
              >
                LeetCode
                <ArrowUpRight className="h-4 w-4" />
              </a>
              {confirmDelete ? (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className={`${OUTLINE_BUTTON} border-white/20 text-zinc-200 hover:border-white/50 hover:text-white disabled:opacity-40`}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`${OUTLINE_BUTTON} border-rose-400 bg-rose-400 font-semibold text-black hover:bg-rose-300 disabled:opacity-40`}
                  >
                    {deleting ? '刪除中...' : '確認刪除'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label="刪除這題"
                  title="刪除這題"
                  className="inline-flex h-11 w-11 items-center justify-center border border-white/20 text-zinc-400 transition-colors hover:border-rose-400 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCell label="Difficulty">
              <DifficultyTag difficulty={record.difficulty} />
            </InfoCell>
            <InfoCell label="Proficiency">
              <span className="flex items-center gap-3">
                <ProficiencyBadge proficiency={proficiency} />
                <button
                  type="button"
                  onClick={cycleProficiency}
                  disabled={saving}
                  className="inline-flex items-center gap-1 border-b border-white/30 font-mono text-[11px] font-normal uppercase text-zinc-400 transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
                >
                  <RotateCcw className="h-3 w-3" />
                  更新
                </button>
              </span>
            </InfoCell>
            <InfoCell label="Solutions">
              {record.solutions.length} 個解法
            </InfoCell>
            <InfoCell label="Timeline">
              <span className="font-mono text-xs font-normal text-zinc-300">
                建立 {fmt(record.created_at)} / 更新 {fmt(record.updated_at)}
              </span>
            </InfoCell>
          </div>

          {record.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {record.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/15 px-2 py-1 font-mono text-[11px] text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className={`${PAGE_SHELL} pt-12 lg:pt-16`}>
        <div className="border border-white/15">
          <div className="flex items-center justify-between gap-3 bg-surface px-5 py-3">
            <button
              type="button"
              onClick={() => description && setDescOpen((v) => !v)}
              aria-expanded={description ? descOpen : undefined}
              className="flex items-center gap-2 font-mono text-xs uppercase text-zinc-400 transition-colors hover:text-paper"
            >
              <FileText className="h-3.5 w-3.5" />
              Problem description
              {description && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${descOpen ? 'rotate-180' : ''}`}
                />
              )}
            </button>
            {!description && (
              <button
                type="button"
                onClick={fetchDescription}
                disabled={fetchingDesc}
                className="border border-white/20 px-3 py-1.5 font-mono text-[11px] uppercase text-zinc-300 transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
              >
                {fetchingDesc ? '載入中...' : '載入描述'}
              </button>
            )}
          </div>
          {descError && (
            <p className="border-t border-white/15 px-5 py-3 text-xs text-rose-400">{descError}</p>
          )}
          {description && descOpen && (
            <div
              className="border-t border-white/15 px-6 pb-6 pt-5 text-sm leading-relaxed text-paper/80
                [&_p]:mb-3 [&_p:last-child]:mb-0
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs
                [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs
                [&_strong]:text-paper [&_em]:text-paper/60
                [&_sup]:text-[10px]"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>
    </>
  );
}
