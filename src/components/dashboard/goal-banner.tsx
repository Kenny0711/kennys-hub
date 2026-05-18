'use client';

import { Target } from 'lucide-react';
import { useState } from 'react';

const GOOGLE_LETTERS = [
  { letter: 'G', color: 'text-blue-400', line: 'bg-blue-400' },
  { letter: 'o', color: 'text-red-400', line: 'bg-red-400' },
  { letter: 'o', color: 'text-yellow-300', line: 'bg-yellow-300' },
  { letter: 'g', color: 'text-blue-400', line: 'bg-blue-400' },
  { letter: 'l', color: 'text-green-400', line: 'bg-green-400' },
  { letter: 'e', color: 'text-red-400', line: 'bg-red-400' },
];

export default function GoalBanner() {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <section
      role="button"
      tabIndex={0}
      aria-pressed={isRevealed}
      aria-label={isRevealed ? 'Hide target company goal' : 'Reveal target company goal'}
      onClick={() => setIsRevealed((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsRevealed((value) => !value);
        }
      }}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#080808] outline-none transition-colors hover:border-white/15 focus-visible:ring-2 focus-visible:ring-sky-300/40"
    >
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-400 via-yellow-300 to-red-400" />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
      </div>

      <div className="relative p-7 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-sky-300" />
              North Star
            </div>

            <div className={isRevealed ? 'opacity-100' : 'pointer-events-none select-none opacity-20 blur-md'}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/35">
                Target Company
              </p>
              <div className="mt-2 flex items-end gap-1.5">
                {GOOGLE_LETTERS.map((item, index) => (
                  <span
                    key={`${item.letter}-${index}`}
                    className={`relative font-mono text-5xl font-black leading-none md:text-6xl ${item.color}`}
                  >
                    {item.letter}
                    <span className={`absolute -bottom-1 left-1 right-1 h-0.5 rounded-full ${item.line}`} />
                  </span>
                ))}
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                SWE Interview Ready
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                每一道題都往同一個方向前進：想清楚、寫乾淨、講明白。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
