import { ArrowUpRight, Target } from 'lucide-react';

const GOOGLE_LETTERS = [
  { letter: 'G', color: 'text-blue-400', line: 'bg-blue-400' },
  { letter: 'o', color: 'text-red-400', line: 'bg-red-400' },
  { letter: 'o', color: 'text-yellow-300', line: 'bg-yellow-300' },
  { letter: 'g', color: 'text-blue-400', line: 'bg-blue-400' },
  { letter: 'l', color: 'text-green-400', line: 'bg-green-400' },
  { letter: 'e', color: 'text-red-400', line: 'bg-red-400' },
];

export default function GoalBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-400 via-yellow-300 to-red-400" />
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
      </div>

      <div className="relative p-6 md:p-7">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-sky-300" />
              North Star
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
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
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
                SWE Interview Ready
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                每一道題都往同一個方向前進：想清楚、寫乾淨、講明白。
              </p>
            </div>
          </div>

          <a
            href="https://careers.google.com/students/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            Google Careers
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
