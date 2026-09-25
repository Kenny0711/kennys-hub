import type { ReactNode } from 'react';
import { DIFFICULTY_TONE } from '@/components/problems/difficulty-tag';
import { Difficulty, LeetcodeRecord } from '@/lib/types';

interface Props {
  records: LeetcodeRecord[];
}

const TARGET_TOTAL = 250;

const DIFFICULTY_TRENDS: Record<Difficulty, string> = {
  Easy: '+1 本週',
  Medium: '+2 本週',
  Hard: '+0 本週',
};

function StatCell({
  index,
  label,
  value,
  detail,
  swatch,
  aside,
  className = '',
}: {
  index: string;
  label: string;
  value: number;
  detail: ReactNode;
  swatch?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-48 flex-col bg-surface p-5 transition-colors hover:bg-surface-hover ${className}`}>
      <div className="flex items-center justify-between font-mono text-[11px] uppercase text-zinc-400">
        <span className="flex items-center gap-2">
          {swatch ? <span className={`h-2 w-2 ${swatch}`} aria-hidden="true" /> : null}
          {label}
        </span>
        <span>{index}</span>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-8">
        <p className="font-display text-7xl leading-[0.85] text-paper">{value}</p>
        {aside}
      </div>
      <p className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] uppercase text-zinc-400">
        {detail}
      </p>
    </div>
  );
}

function MasteryRing({ percentage }: { percentage: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand transition-all"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-paper">
        {percentage}%
      </span>
    </div>
  );
}

export default function StatsCards({ records }: Props) {
  const total = records.length;
  const mastered = records.filter((record) => String(record.proficiency).includes('熟')).length;
  const masteredPercent = Math.round((mastered / (total || 1)) * 100);
  const counts: Record<Difficulty, number> = {
    Easy: records.filter((record) => record.difficulty === 'Easy').length,
    Medium: records.filter((record) => record.difficulty === 'Medium').length,
    Hard: records.filter((record) => record.difficulty === 'Hard').length,
  };
  const difficulties = Object.keys(counts) as Difficulty[];
  const remainingToTarget = Math.max(TARGET_TOTAL - total, 0);
  const targetProgress = Math.min(Math.round((total / TARGET_TOTAL) * 100), 100);

  return (
    <div>
      <div className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-5">
        <StatCell
          index="01"
          label="總題數"
          value={total}
          detail={<span className="text-brand">+3 本週</span>}
          className="sm:col-span-2 lg:col-span-1"
        />
        <StatCell
          index="02"
          label="熟練"
          value={mastered}
          detail={`${mastered}/${total} 題`}
          aside={<MasteryRing percentage={masteredPercent} />}
        />
        {difficulties.map((difficulty, i) => (
          <StatCell
            key={difficulty}
            index={String(i + 3).padStart(2, '0')}
            label={difficulty}
            value={counts[difficulty]}
            swatch={DIFFICULTY_TONE[difficulty].swatch}
            detail={`${Math.round((counts[difficulty] / (total || 1)) * 100)}% · ${DIFFICULTY_TRENDS[difficulty]}`}
          />
        ))}
      </div>

      <div className="grid gap-px border border-t-0 border-white/15 bg-white/15 lg:grid-cols-5">
        <div className="bg-surface p-5 lg:col-span-3">
          <p className="font-mono text-[11px] uppercase text-zinc-400">Difficulty mix</p>
          <div className="mt-5 flex h-3 w-full gap-px bg-white/10">
            {difficulties.map((difficulty) => (
              <div
                key={difficulty}
                className={`${DIFFICULTY_TONE[difficulty].swatch} transition-all`}
                style={{ flex: `${counts[difficulty]} 1 0%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase text-zinc-400">
            {difficulties.map((difficulty) => (
              <span key={difficulty} className="flex items-center gap-2">
                <span className={`h-2 w-2 ${DIFFICULTY_TONE[difficulty].swatch}`} aria-hidden="true" />
                {difficulty} {counts[difficulty]}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface p-5 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase text-zinc-400">Next milestone</p>
              <p className="mt-2 text-lg font-semibold text-paper">{TARGET_TOTAL} 題</p>
            </div>
            <div className="text-right">
              <p className="font-display text-5xl leading-none text-brand">{targetProgress}%</p>
              <p className="mt-1 font-mono text-[11px] uppercase text-zinc-400">還差 {remainingToTarget} 題</p>
            </div>
          </div>
          <div className="mt-4 h-3 bg-white/10">
            <div className="h-full bg-brand transition-all" style={{ width: `${targetProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
