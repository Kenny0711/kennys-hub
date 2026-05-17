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
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-blue-300/30 hover:bg-blue-400/10 hover:text-white"
      >
        <FileText className="h-4 w-4 text-blue-200" />
        Resume
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="履歷預覽"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
        >
          <div className="flex h-full max-h-[900px] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-300/20 bg-blue-400/10 text-blue-200">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">Yang Chang-Hao Resume</p>
                  <p className="text-xs text-zinc-500">PDF preview</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="在新分頁開啟履歷"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
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
