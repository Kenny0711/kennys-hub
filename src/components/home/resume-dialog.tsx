'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, FileText, X } from 'lucide-react';

const RESUME_URL = '/resume/YangChangHao-resume.pdf';

export default function ResumeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#d9ff43] hover:bg-[#d9ff43] hover:text-black"
      >
        <FileText className="h-4 w-4" />
        Resume
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="履歷預覽"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
        >
          <div className="flex h-full max-h-[900px] w-full max-w-5xl flex-col overflow-hidden border border-white/20 bg-ink shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between gap-3 border-b border-white/15 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-brand text-brand-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-paper">Yang Chang-Hao Resume</p>
                  <p className="font-mono text-[11px] uppercase text-zinc-500">PDF preview</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-zinc-300 transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
                  aria-label="在新分頁開啟履歷"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-zinc-300 transition-colors hover:border-white/50 hover:text-white"
                  aria-label="關閉履歷"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <iframe
              src={RESUME_URL}
              title="Yang Chang-Hao resume"
              className="min-h-0 flex-1 bg-zinc-900"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
