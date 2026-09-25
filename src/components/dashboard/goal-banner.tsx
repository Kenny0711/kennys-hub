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
      className="relative cursor-pointer overflow-hidden border border-white/15 bg-surface outline-none transition-colors hover:border-white/30 focus-visible:ring-2 focus-visible:ring-brand/60"
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

      <div className="relative p-7 md:p-10">
        <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase">
          <p className="flex items-center gap-2 font-semibold text-coral">
            <Target className="h-3.5 w-3.5" />
            North Star
          </p>
          <p className="text-zinc-500">{isRevealed ? 'Click to hide' : 'Click to reveal'}</p>
        </div>

        <div className={`mt-8 transition-[opacity,filter] duration-300 ${isRevealed ? 'opacity-100' : 'pointer-events-none select-none opacity-20 blur-md'}`}>
          <p className="font-mono text-xs uppercase text-zinc-500">Target Company</p>
          <div className="mt-3 flex items-end gap-1.5">
            {GOOGLE_LETTERS.map((item, index) => (
              <span
                key={`${item.letter}-${index}`}
                className={`relative font-mono text-5xl font-black leading-none md:text-6xl ${item.color}`}
              >
                {item.letter}
                <span className={`absolute -bottom-1 left-1 right-1 h-0.5 ${item.line}`} />
              </span>
            ))}
          </div>
          <h2 className="font-display mt-6 text-5xl leading-none text-paper sm:text-6xl">
            SWE Interview Ready.
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-zinc-400">
            每一道題都往同一個方向前進：想清楚、寫乾淨、講明白。
          </p>
        </div>
      </div>
    </section>
  );
}
