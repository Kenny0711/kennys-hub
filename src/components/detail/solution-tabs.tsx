'use client';
import 'highlight.js/styles/github-dark.css';
import { useEffect, useState } from 'react';
import hljs from 'highlight.js/lib/common';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Solution } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
  Clock, Database, CalendarPlus, CalendarCheck, Layers,
  Pencil, X, Check, Loader2, Copy, CheckCheck, Trash2,
  CheckCircle2, AlertTriangle, Hand,
} from 'lucide-react';
// import CodeVisualizer from '@/components/detail/code-visualizer'; // 視覺化功能（暫時停用，填入 ANTHROPIC_API_KEY 後可重新啟用）

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const LANG_DISPLAY: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  swift: 'Swift',
  ruby: 'Ruby',
  scala: 'Scala',
  php: 'PHP',
  sql: 'SQL',
  r: 'R',
};

function stripCodeFence(code: string): string {
  return code
    .replace(/^\s*```[\w+-]*\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function formatMarkdownNotes(notes: string): string {
  return notes
    .replace(/\\n/g, '\n')
    .replace(/\s*(Step\s+\d+\s*:)/gi, '\n\n$1')
    .replace(/\s*(Time Complexity\s*:)/gi, '\n\n$1')
    .replace(/\s*(Space Complexity\s*:)/gi, '\n\n$1')
    .replace(/\s*(Key Idea\s*:)/gi, '\n\n$1')
    .replace(/\s*(Approach\s*:)/gi, '\n\n$1')
    .replace(/\$([^$\n]+)\$/g, '`$1`')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeDisplayLanguage(language: string | undefined, code: string): string {
  const raw = (language ?? '').toLowerCase();
  if (raw === 'cpp' || raw === 'c++') return 'cpp';
  if (raw === 'python3') return 'python';
  if (raw && raw !== 'python') return raw;
  if (/\bclass\s+Solution\b/.test(code) && /#include|vector<|std::|public:|private:/.test(code)) {
    return 'cpp';
  }
  return raw || 'code';
}

function highlightCode(code: string, language: string): string {
  if (!hljs.getLanguage(language)) {
    return hljs.highlightAuto(code).value;
  }
  return hljs.highlight(code, { language, ignoreIllegals: true }).value;
}

function displayMethod(method: string | undefined, index: number): string {
  if (!method || method === 'Initial Capture') return `解法 ${index + 1}`;
  return method;
}

function getSolutionStatus(solution: Solution) {
  const raw = `${solution.status ?? ''} ${solution.submission_status ?? ''}`.toLowerCase();
  const syncSource = (solution.sync_source ?? '').toLowerCase();

  if (raw.includes('accepted')) {
    return {
      label: 'Accepted',
      title: 'LeetCode accepted submission',
      icon: CheckCircle2,
      className: 'border-emerald-400/40 text-emerald-400',
    };
  }

  if (raw.includes('runtime_error') || raw.includes('runtime error')) {
    return {
      label: 'Runtime Error',
      title: 'LeetCode runtime error submission',
      icon: AlertTriangle,
      className: 'border-rose-400/40 text-rose-400',
    };
  }

  if (raw.includes('manual') || syncSource === 'manual') {
    return {
      label: '手動同步',
      title: 'Manually captured from the extension popup',
      icon: Hand,
      className: 'border-amber-400/40 text-amber-400',
    };
  }

  return {
    label: 'Unknown',
    title: 'Legacy solution without submission status',
    icon: AlertTriangle,
    className: 'border-white/15 text-zinc-400',
  };
}

const FIELD_LABEL = 'mb-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase text-zinc-400';
const FIELD_INPUT =
  'w-full border border-white/15 bg-transparent px-3 py-2 text-sm text-paper transition-colors placeholder:text-zinc-600 hover:border-white/30 focus:border-brand focus:outline-none';
const CHIP_BUTTON =
  'inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-30';

interface Props {
  solutions: Solution[];
  createdAt: string;
  updatedAt: string;
  recordId: string;
  problemTitle: string;
}

function EditForm({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  draft: Solution;
  onChange: (field: keyof Solution, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5 border border-brand/40 bg-surface p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="font-mono text-xs font-semibold uppercase text-brand">Edit solution</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className={`${CHIP_BUTTON} border-white/20 text-zinc-300 hover:border-white/50 hover:text-white`}
          >
            <X className="h-3 w-3" /> 取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className={`${CHIP_BUTTON} border-brand bg-brand font-semibold text-brand-foreground hover:bg-brand/85`}
          >
            {saving
              ? <><Loader2 className="h-3 w-3 animate-spin" /> 儲存中</>
              : <><Check className="h-3 w-3" /> 儲存</>}
          </button>
        </div>
      </div>

      <div>
        <label className={FIELD_LABEL}>解法名稱</label>
        <input
          type="text"
          value={draft.method}
          onChange={(e) => onChange('method', e.target.value)}
          placeholder="e.g. Two Pointers, BFS..."
          className={FIELD_INPUT}
        />
      </div>

      <div>
        <label className={FIELD_LABEL}>Submission Status</label>
        <select
          value={draft.status ?? 'unknown'}
          onChange={(e) => onChange('status', e.target.value)}
          className={`${FIELD_INPUT} bg-ink`}
        >
          <option className="bg-ink text-paper" value="accepted">Accepted</option>
          <option className="bg-ink text-paper" value="runtime_error">Runtime Error</option>
          <option className="bg-ink text-paper" value="manual_sync">手動同步</option>
          <option className="bg-ink text-paper" value="unknown">Unknown</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FIELD_LABEL}>
            <Clock className="h-3 w-3" /> 時間複雜度
          </label>
          <input
            type="text"
            value={draft.time_complexity}
            onChange={(e) => onChange('time_complexity', e.target.value)}
            placeholder="O(n)"
            className={`${FIELD_INPUT} font-mono`}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>
            <Database className="h-3 w-3" /> 空間複雜度
          </label>
          <input
            type="text"
            value={draft.space_complexity}
            onChange={(e) => onChange('space_complexity', e.target.value)}
            placeholder="O(1)"
            className={`${FIELD_INPUT} font-mono`}
          />
        </div>
      </div>

      <div>
        <label className={FIELD_LABEL}>
          筆記 <span className="normal-case text-zinc-600">支援 Markdown</span>
        </label>
        <Textarea
          value={draft.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="記錄思路、技巧、易錯點..."
          rows={6}
          className="resize-y border-white/15 bg-transparent font-mono text-sm placeholder:text-zinc-600 focus-visible:border-brand focus-visible:ring-0 dark:bg-transparent"
        />
      </div>

      {draft.notes && (
        <div className="border border-white/10 bg-ink p-4">
          <p className="mb-2 font-mono text-[11px] uppercase text-zinc-400">預覽</p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-paper/80 [&_p]:my-2 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
            <Markdown rehypePlugins={[rehypeHighlight]}>{formatMarkdownNotes(draft.notes)}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SolutionTabs({ solutions: initialSolutions, createdAt, updatedAt, recordId }: Props) {
  const [syncedSolutions, setSyncedSolutions] = useState<Solution[] | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Solution | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('0');
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const solutions = syncedSolutions ?? initialSolutions ?? [];

  useEffect(() => {
    if (USE_MOCK) return;

    const supabase = createClient();
    const applySolutions = (nextSolutions: Solution[]) => {
      setSyncedSolutions(nextSolutions);
      setActiveTab((current) => {
        if (nextSolutions.length === 0) return '0';
        const currentIndex = Number.parseInt(current, 10);
        if (Number.isNaN(currentIndex)) return String(nextSolutions.length - 1);
        return String(Math.min(currentIndex, nextSolutions.length - 1));
      });
    };
    const refreshSolutions = async () => {
      const { data } = await supabase
        .from('leetcode_records')
        .select('solutions')
        .eq('id', recordId)
        .maybeSingle();
      if (data) applySolutions((data as { solutions?: Solution[] }).solutions ?? []);
    };

    const channel = supabase
      .channel(`leetcode-record-${recordId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leetcode_records',
          filter: `id=eq.${recordId}`,
        },
        (payload) => {
          const nextSolutions = ((payload.new as { solutions?: Solution[] }).solutions ?? []);
          applySolutions(nextSolutions);
        }
      )
      .subscribe();
    const intervalId = window.setInterval(refreshSolutions, 5000);

    return () => {
      window.clearInterval(intervalId);
      void supabase.removeChannel(channel);
    };
  }, [recordId]);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const deleteSolution = async (i: number) => {
    const newSolutions = solutions.filter((_, idx) => idx !== i);
    setSyncedSolutions(newSolutions);
    setConfirmDeleteIdx(null);
    // Keep active tab in bounds
    const newLen = newSolutions.length;
    if (newLen > 0) {
      const cur = parseInt(activeTab);
      if (cur >= newLen) setActiveTab(String(newLen - 1));
    }
    if (USE_MOCK) return;
    await fetch(`/api/records/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solutions: newSolutions }),
    });
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('zh-TW');

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setDraft({ ...solutions[i] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  const updateDraft = (field: keyof Solution, value: string) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const saveEdit = async () => {
    if (editingIndex === null || !draft) return;
    const newSolutions = solutions.map((s, i) => (i === editingIndex ? draft : s));
    setSyncedSolutions(newSolutions);
    setEditingIndex(null);
    setDraft(null);
    if (USE_MOCK) return;
    setSaving(true);
    await fetch(`/api/records/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solutions: newSolutions }),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {solutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-white/15 bg-surface py-24 text-center">
          <p className="font-mono text-xs uppercase text-zinc-500">No solutions yet</p>
          <p className="mt-2 text-sm text-zinc-400">
            透過 Chrome Extension 擷取解題後會自動顯示
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="custom-scrollbar-x mb-5 max-w-full justify-start gap-px overflow-x-auto border border-white/15 bg-white/15 p-0 group-data-horizontal/tabs:h-10">
            {solutions.map((s, i) => (
              <TabsTrigger
                key={i}
                value={String(i)}
                className="h-full flex-none bg-surface px-4 font-mono text-xs uppercase text-zinc-400 hover:text-paper data-active:bg-brand data-active:text-brand-foreground dark:data-active:border-transparent dark:data-active:bg-brand dark:data-active:text-brand-foreground"
              >
                {displayMethod(s.method, i)}
              </TabsTrigger>
            ))}
          </TabsList>

          {solutions.map((s, i) => (
            <TabsContent key={i} value={String(i)} className="space-y-5 mt-0">
              {editingIndex === i && draft ? (
                <EditForm
                  draft={draft}
                  onChange={updateDraft}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                  saving={saving}
                />
              ) : (
                <>
                  {/* Complexity badges + edit button */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const status = getSolutionStatus(s);
                      const StatusIcon = status.icon;
                      return (
                        <span
                          title={status.title}
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      );
                    })()}
                    <button
                      onClick={() => startEdit(i)}
                      disabled={editingIndex !== null}
                      title={s.time_complexity ? s.time_complexity : '點擊填入時間複雜度'}
                      className={`${CHIP_BUTTON} ${
                        s.time_complexity
                          ? 'border-white/15 text-zinc-300 hover:border-white/40'
                          : 'border-dashed border-white/15 text-zinc-600 hover:border-white/30 hover:text-zinc-400'
                      }`}
                    >
                      <Clock className="h-3 w-3 shrink-0" />
                      Time {s.time_complexity || 'O(?)'}
                    </button>
                    <button
                      onClick={() => startEdit(i)}
                      disabled={editingIndex !== null}
                      title={s.space_complexity ? s.space_complexity : '點擊填入空間複雜度'}
                      className={`${CHIP_BUTTON} ${
                        s.space_complexity
                          ? 'border-white/15 text-zinc-300 hover:border-white/40'
                          : 'border-dashed border-white/15 text-zinc-600 hover:border-white/30 hover:text-zinc-400'
                      }`}
                    >
                      <Database className="h-3 w-3 shrink-0" />
                      Space {s.space_complexity || 'O(?)'}
                    </button>
                    <div className="ml-auto flex items-center gap-1.5">
                      {confirmDeleteIdx === i ? (
                        <>
                          <button
                            onClick={() => setConfirmDeleteIdx(null)}
                            className={`${CHIP_BUTTON} border-white/20 text-zinc-300 hover:border-white/50 hover:text-white`}
                          >
                            取消
                          </button>
                          <button
                            onClick={() => deleteSolution(i)}
                            className={`${CHIP_BUTTON} border-rose-400 bg-rose-400 font-semibold text-black hover:bg-rose-300`}
                          >
                            確認刪除
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(i)}
                            disabled={editingIndex !== null}
                            className={`${CHIP_BUTTON} border-white/20 text-zinc-300 hover:border-brand hover:text-brand`}
                          >
                            <Pencil className="h-3 w-3" /> 編輯
                          </button>
                          <button
                            onClick={() => setConfirmDeleteIdx(i)}
                            disabled={editingIndex !== null}
                            className={`${CHIP_BUTTON} border-white/20 text-zinc-500 hover:border-rose-400 hover:text-rose-400`}
                            title="刪除此解法"
                            aria-label="刪除此解法"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {s.code && (
                    <div className="border border-white/15">
                      <div className="flex items-center justify-between border-b border-white/15 bg-surface px-4 py-2.5">
                        {(() => {
                          const language = normalizeDisplayLanguage(s.language, s.code);
                          return (
                            <span className="inline-flex items-center border border-brand/40 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase text-brand">
                              {LANG_DISPLAY[language] ?? language}
                            </span>
                          );
                        })()}
                        <button
                          onClick={() => copyCode(stripCodeFence(s.code), i)}
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase text-zinc-400 transition-colors hover:text-paper"
                          title="複製程式碼"
                        >
                          {copiedIdx === i
                            ? <><CheckCheck className="h-3 w-3 text-brand" /><span className="text-brand">已複製</span></>
                            : <><Copy className="h-3 w-3" />複製</>}
                        </button>
                      </div>
                      <div className="custom-scrollbar-x overflow-x-auto bg-[#0c0c0c]">
                        {(() => {
                          const code = stripCodeFence(s.code);
                          const language = normalizeDisplayLanguage(s.language, code);
                          return (
                            <pre className="m-0 min-w-full p-4 text-sm leading-6">
                              <code
                                className={`hljs language-${language} block whitespace-pre bg-transparent font-mono`}
                                dangerouslySetInnerHTML={{
                                  __html: highlightCode(code, language),
                                }}
                              />
                            </pre>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {s.notes ? (
                    <div className="border border-white/15 bg-surface p-5 md:p-6">
                      <p className="mb-4 border-b border-white/10 pb-3 font-mono text-[11px] uppercase text-zinc-400">
                        Notes
                      </p>
                      <div className="space-y-2 whitespace-pre-wrap text-sm leading-relaxed text-paper/80 [&_p]:my-2 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
                        <Markdown rehypePlugins={[rehypeHighlight]}>{formatMarkdownNotes(s.notes)}</Markdown>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(i)}
                      className="w-full border border-dashed border-white/15 py-6 font-mono text-xs uppercase text-zinc-500 transition-colors hover:border-brand hover:text-brand"
                    >
                      + 新增筆記
                    </button>
                  )}

                  {/* Visualization — 暫時停用，填入 ANTHROPIC_API_KEY 後取消此區塊註解
                  {s.code && (
                    <CodeVisualizer
                      recordId={recordId}
                      solutionIndex={i}
                      code={s.code}
                      language={s.language ?? ''}
                      problemTitle={problemTitle}
                    />
                  )}
                  */}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-4 font-mono text-[11px] uppercase text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          解法數 <span className="font-semibold text-brand">{solutions.length}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarPlus className="h-3.5 w-3.5" />
          建立 <span className="text-zinc-300">{fmt(createdAt)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarCheck className="h-3.5 w-3.5" />
          最後更新 <span className="text-zinc-300">{fmt(updatedAt)}</span>
        </span>
      </div>
    </div>
  );
}
