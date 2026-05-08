import { LeetcodeRecord } from '@/lib/types';
import { ArrowUpRight, BookOpen, Flame, TrendingUp, Trophy, Zap } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

function Card({
  label,
  value,
  icon: Icon,
  color,
  border,
  bg,
  trend,
  trendClassName,
  percentage,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  border: string;
  bg: string;
  trend?: string;
  trendClassName?: string;
  percentage?: number;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border ${border} ${bg} p-[18px]`}>
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${color} opacity-5 blur-xl`} />
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium tracking-wide text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {typeof percentage === 'number' && (
            <span className="text-sm font-medium text-muted-foreground">
              {percentage}%
            </span>
          )}
          <Icon className={`h-[18px] w-[18px] ${color} opacity-70`} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className={`text-3xl font-bold leading-none ${color}`}>{value}</p>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${trendClassName}`}
          >
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function MasteryCard({
  mastered,
  total,
}: {
  mastered: number;
  total: number;
}) {
  const percentage = Math.round((mastered / (total || 1)) * 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/25 bg-violet-500/8 p-[18px]">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-violet-400 opacity-5 blur-xl" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium tracking-wide text-muted-foreground">熟練</span>
        <Trophy className="h-[18px] w-[18px] text-violet-400 opacity-70" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-bold leading-none text-violet-400">{mastered}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {mastered}/{total || 0} 題
          </p>
        </div>

        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-white/8"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.35)] transition-all"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-violet-100">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ records }: Props) {
  const targetTotal = 250;
  const total = records.length;
  const mastered = records.filter((record) => String(record.proficiency).includes('熟')).length;
  const easy = records.filter((record) => record.difficulty === 'Easy').length;
  const medium = records.filter((record) => record.difficulty === 'Medium').length;
  const hard = records.filter((record) => record.difficulty === 'Hard').length;
  const easyPercent = Math.round((easy / (total || 1)) * 100);
  const mediumPercent = Math.round((medium / (total || 1)) * 100);
  const hardPercent = Math.round((hard / (total || 1)) * 100);
  const remainingToTarget = Math.max(targetTotal - total, 0);
  const targetProgress = Math.min(Math.round((total / targetTotal) * 100), 100);

  return (
    <div className="flex gap-4">
      <div className="flex w-[220px] shrink-0 flex-col gap-3.5">
        <p className="px-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          總覽
        </p>
        <Card
          label="總題數"
          value={total}
          icon={BookOpen}
          color="text-sky-400"
          border="border-sky-500/25"
          bg="bg-sky-500/8"
          trend="+3 本週"
          trendClassName="border-sky-400/15 bg-sky-400/8 text-sky-400"
        />
        <MasteryCard mastered={mastered} total={total} />
      </div>

      <div className="mx-1 w-px self-stretch bg-white/6" />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5">
        <p className="px-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          難度分布
        </p>
        <div className="grid grid-cols-3 gap-3.5">
          <Card
            label="Easy"
            value={easy}
            icon={Zap}
            color="text-emerald-400"
            border="border-emerald-500/25"
            bg="bg-emerald-500/8"
            trend="+1 本週"
            trendClassName="border-emerald-400/15 bg-emerald-400/8 text-emerald-400"
            percentage={easyPercent}
          />
          <Card
            label="Medium"
            value={medium}
            icon={Flame}
            color="text-amber-400"
            border="border-amber-500/25"
            bg="bg-amber-500/8"
            trend="+2 本週"
            trendClassName="border-amber-400/15 bg-amber-400/8 text-amber-400"
            percentage={mediumPercent}
          />
          <Card
            label="Hard"
            value={hard}
            icon={TrendingUp}
            color="text-rose-400"
            border="border-rose-500/25"
            bg="bg-rose-500/8"
            trend="+0 本週"
            trendClassName="border-rose-400/15 bg-rose-400/8 text-rose-400"
            percentage={hardPercent}
          />
        </div>
        <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-white/[0.04] p-0.5">
          <div
            className="rounded-full bg-emerald-500/75 shadow-[0_0_10px_rgba(16,185,129,0.18)] transition-all"
            style={{ flex: `${easy || 0} 1 0%` }}
          />
          <div
            className="rounded-full bg-amber-500/75 shadow-[0_0_10px_rgba(245,158,11,0.18)] transition-all"
            style={{ flex: `${medium || 0} 1 0%` }}
          />
          <div
            className="rounded-full bg-rose-500/75 shadow-[0_0_10px_rgba(244,63,94,0.18)] transition-all"
            style={{ flex: `${hard || 0} 1 0%` }}
          />
        </div>
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-5">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <span aria-hidden="true">🎯</span>
                Next Milestone
              </p>
              <p className="mt-1 text-2xl font-bold text-white">{targetTotal} 題</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-bold leading-none text-cyan-400">
                {targetProgress}%
              </p>
              <p className="mt-1 text-sm text-zinc-500">還差 {remainingToTarget} 題</p>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
