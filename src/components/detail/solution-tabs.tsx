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
      className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    };
  }

  if (raw.includes('runtime_error') || raw.includes('runtime error')) {
    return {
      label: 'Runtime Error',
      title: 'LeetCode runtime error submission',
      icon: AlertTriangle,
      className: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
    };
  }

  if (raw.includes('manual') || syncSource === 'manual') {
    return {
      label: '手動同步',
      title: 'Manually captured from the extension popup',
      icon: Hand,
      className: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    };
  }

  return {
    label: 'Unknown',
    title: 'Legacy solution without submission status',
    icon: AlertTriangle,
    className: 'border-zinc-600/40 bg-zinc-800/50 text-zinc-400',
  };
}

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
    <div className="space-y-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.03] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">編輯解法</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground border border-white/10 hover:border-white/20 transition-colors"
          >
            <X className="w-3 h-3" /> 取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 disabled:opacity-50 transition-colors"
          >
            {saving
              ? <><Loader2 className="w-3 h-3 animate-spin" /> 儲存中</>
              : <><Check className="w-3 h-3" /> 儲存</>}
          </button>
        </div>
      </div>

      {/* Method name */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
          解法名稱
        </label>
        <input
          type="text"
          value={draft.method}
          onChange={(e) => onChange('method', e.target.value)}
          placeholder="e.g. Two Pointers, BFS..."
          className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 focus:border-sky-500/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
          Submission Status
        </label>
        <select
          value={draft.status ?? 'unknown'}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950 border border-white/10 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500/40 focus:border-sky-500/30 transition-colors"
        >
          <option className="bg-zinc-950 text-zinc-100" value="accepted">Accepted</option>
          <option className="bg-zinc-950 text-zinc-100" value="runtime_error">Runtime Error</option>
          <option className="bg-zinc-950 text-zinc-100" value="manual_sync">手動同步</option>
          <option className="bg-zinc-950 text-zinc-100" value="unknown">Unknown</option>
        </select>
      </div>

      {/* Time + Space */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
            <Clock className="w-3 h-3" /> 時間複雜度
          </label>
          <input
            type="text"
            value={draft.time_complexity}
            onChange={(e) => onChange('time_complexity', e.target.value)}
            placeholder="O(n)"
            className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 focus:border-sky-500/30 transition-colors"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
            <Database className="w-3 h-3" /> 空間複雜度
          </label>
          <input
            type="text"
            value={draft.space_complexity}
            onChange={(e) => onChange('space_complexity', e.target.value)}
            placeholder="O(1)"
            className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 focus:border-sky-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
          筆記 <span className="normal-case text-muted-foreground/40 tracking-normal ml-1">支援 Markdown</span>
        </label>
        <Textarea
          value={draft.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="記錄思路、技巧、易錯點..."
          rows={6}
          className="text-sm font-mono bg-white/5 border-white/10 resize-y placeholder:text-muted-foreground/40 focus:ring-sky-500/40 focus:border-sky-500/30"
        />
      </div>

      {/* Preview */}
      {draft.notes && (
        <div className="rounded-lg border border-white/6 bg-white/[0.02] p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold">預覽</p>
          <div className="text-sm text-foreground/80 leading-relaxed [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
            <Markdown rehypePlugins={[rehypeHighlight]}>{draft.notes}</Markdown>
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
        <div className="rounded-xl border border-white/8 bg-white/[0.02] flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground text-sm">尚無解法記錄</p>
          <p className="text-muted-foreground/40 text-xs mt-1">
            透過 Chrome Extension 擷取解題後會自動顯示
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/8 mb-5">
            {solutions.map((s, i) => (
              <TabsTrigger
                key={i}
                value={String(i)}
                className="text-xs data-[state=active]:bg-white/10"
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
                          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
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
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono border transition-colors ${
                        s.time_complexity
                          ? 'bg-white/5 text-muted-foreground border-white/10 hover:border-white/20'
                          : 'bg-transparent text-muted-foreground/30 border-dashed border-white/15 hover:border-white/25 hover:text-muted-foreground/50'
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      Time: {s.time_complexity || 'O(?)'}
                    </button>
                    <button
                      onClick={() => startEdit(i)}
                      disabled={editingIndex !== null}
                      title={s.space_complexity ? s.space_complexity : '點擊填入空間複雜度'}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono border transition-colors ${
                        s.space_complexity
                          ? 'bg-white/5 text-muted-foreground border-white/10 hover:border-white/20'
                          : 'bg-transparent text-muted-foreground/30 border-dashed border-white/15 hover:border-white/25 hover:text-muted-foreground/50'
                      }`}
                    >
                      <Database className="w-3 h-3 shrink-0" />
                      Space: {s.space_complexity || 'O(?)'}
                    </button>
                    <div className="ml-auto flex items-center gap-1.5">
                      {confirmDeleteIdx === i ? (
                        <>
                          <button
                            onClick={() => setConfirmDeleteIdx(null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => deleteSolution(i)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                          >
                            確認刪除
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(i)}
                            disabled={editingIndex !== null}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/20 hover:bg-white/5 disabled:opacity-30 transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> 編輯
                          </button>
                          <button
                            onClick={() => setConfirmDeleteIdx(i)}
                            disabled={editingIndex !== null}
                            className="inline-flex items-center p-1.5 rounded-md text-muted-foreground/40 hover:text-rose-400 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 disabled:opacity-30 transition-colors"
                            title="刪除此解法"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Code block */}
                  {s.code && (
                    <div className="rounded-xl border border-white/8 overflow-hidden">
                      <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        {(() => {
                          const language = normalizeDisplayLanguage(s.language, s.code);
                          return (
                            <span className="inline-flex items-center rounded bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                              {LANG_DISPLAY[language] ?? language}
                            </span>
                          );
                        })()}
                        <button
                          onClick={() => copyCode(stripCodeFence(s.code), i)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-muted-foreground/50 hover:text-muted-foreground border border-transparent hover:border-white/15 hover:bg-white/5 transition-colors"
                          title="複製程式碼"
                        >
                          {copiedIdx === i
                            ? <><CheckCheck className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">已複製</span></>
                            : <><Copy className="w-3 h-3" />複製</>}
                        </button>
                      </div>
                      <div className="overflow-x-auto custom-scrollbar-x bg-[#0d1117]">
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

                  {/* Notes */}
                  {s.notes ? (
                    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">
                        筆記
                      </p>
                      <div className="text-sm text-foreground/80 leading-relaxed space-y-2 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
                        <Markdown rehypePlugins={[rehypeHighlight]}>{s.notes}</Markdown>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(i)}
                      className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-6 text-sm text-muted-foreground/50 hover:text-muted-foreground hover:border-white/20 hover:bg-white/[0.03] transition-colors"
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

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-white/6 bg-white/[0.015] px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <Layers className="w-3.5 h-3.5" />
          <span>解法數</span>
          <span className="text-sky-400 font-semibold ml-1">{solutions.length}</span>
        </div>
        <div className="w-px h-4 bg-white/6 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>建立</span>
          <span className="text-foreground/50 ml-1">{fmt(createdAt)}</span>
        </div>
        <div className="w-px h-4 bg-white/6 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>最後更新</span>
          <span className="text-foreground/50 ml-1">{fmt(updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
