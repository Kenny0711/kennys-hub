'use client';

import { LeetcodeRecord } from '@/lib/types';
import { isAcceptedSolution } from '@/lib/solution-status';
import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarDays, CalendarRange, Target } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

const WEEKS = 26;
const DAYS = 7;
const WEEKLY_GOAL = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const TAIPEI_TIME_ZONE = 'Asia/Taipei';
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getColorClass(count: number): string {
  if (count === 0) return 'bg-white/[0.07] hover:bg-white/[0.14]';
  if (count === 1) return 'bg-brand/30 hover:bg-brand/45';
  if (count === 2) return 'bg-brand/60 hover:bg-brand/75';
  return 'bg-brand hover:bg-brand/85';
}

function getTaipeiDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TAIPEI_TIME_ZONE });
}

function getTaipeiWallTimeMs(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TAIPEI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
}

function getTaipeiWeeklyGoalResetMs(date: Date): number {
  const wallTimeMs = getTaipeiWallTimeMs(date);
  const wallDate = new Date(wallTimeMs);
  const daysSinceSunday = wallDate.getUTCDay();
  let resetMs = Date.UTC(
    wallDate.getUTCFullYear(),
    wallDate.getUTCMonth(),
    wallDate.getUTCDate() - daysSinceSunday,
    23,
    59,
    0
  );

  if (wallTimeMs < resetMs) resetMs -= 7 * DAY_MS;
  return resetMs;
}

function hasAcceptedSubmission(record: LeetcodeRecord): boolean {
  return record.solutions.some((solution) => solution.code.trim().length > 0 && isAcceptedSolution(solution));
}

function getAcceptedProblemDates(records: LeetcodeRecord[]): Array<{ problemId: number; date: Date }> {
  return records.flatMap((record) => {
    const acceptedDates = record.solutions
      .filter((solution) => solution.code.trim().length > 0 && isAcceptedSolution(solution))
      .map((solution) => new Date(solution.submitted_at ?? record.created_at));

    if (acceptedDates.length === 0) return [];
    acceptedDates.sort((a, b) => a.getTime() - b.getTime());
    return [{ problemId: record.problem_id, date: acceptedDates[0] }];
  });
}

export default function ActivityHeatmap({ records }: Props) {
  const [now, setNow] = useState(() => new Date());
  const acceptedRecords = useMemo(() => records.filter(hasAcceptedSubmission), [records]);
  const acceptedProblemDates = useMemo(() => getAcceptedProblemDates(records), [records]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const activityMap = useMemo(() => {
    const map: Record<string, Set<number>> = {};
    acceptedProblemDates.forEach(({ problemId, date }) => {
      const day = getTaipeiDateKey(date);
      map[day] ??= new Set<number>();
      map[day].add(problemId);
    });
    return Object.fromEntries(
      Object.entries(map).map(([day, problemIds]) => [day, problemIds.size])
    ) as Record<string, number>;
  }, [acceptedProblemDates]);

  const today = now;
  const todayKey = getTaipeiDateKey(today);
  const weeklyGoalResetMs = getTaipeiWeeklyGoalResetMs(today);
  const monthKey = todayKey.slice(0, 7);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - WEEKS * DAYS + 1);

  const cells: { date: string; count: number }[] = [];
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const key = getTaipeiDateKey(date);
    cells.push({ date: key, count: activityMap[key] ?? 0 });
  }

  const totalSolved = acceptedRecords.length;
  const activeDays = Object.values(activityMap).filter((count) => count > 0).length;
  const todayCount = activityMap[todayKey] ?? 0;
  const weekCount = new Set(acceptedProblemDates.filter(({ date }) => {
    const submittedAt = getTaipeiWallTimeMs(date);
    return submittedAt >= weeklyGoalResetMs && submittedAt <= getTaipeiWallTimeMs(today);
  }).map(({ problemId }) => problemId)).size;
  const monthCount = new Set(acceptedProblemDates.filter(({ date }) =>
    getTaipeiDateKey(date).startsWith(monthKey)
  ).map(({ problemId }) => problemId)).size;

  const streak = useMemo(() => {
    let current = 0;
    const date = new Date();
    while (true) {
      const key = getTaipeiDateKey(date);
      if (!activityMap[key]) break;
      current++;
      date.setDate(date.getDate() - 1);
    }
    return current;
  }, [activityMap]);

  const habitInsights = [
    {
      label: '今日新增',
      value: `${todayCount} 題`,
      icon: CalendarCheck,
    },
    {
      label: '本週目標',
      value: `${weekCount}/${WEEKLY_GOAL}`,
      suffix: '題',
      icon: Target,
    },
    {
      label: '本月累積',
      value: `${monthCount} 題`,
      icon: CalendarRange,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-[11px] uppercase">
        <div className="flex items-center gap-2 text-zinc-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <h3>Accepted / 26 weeks</h3>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          {streak > 0 && (
            <span className="font-semibold text-brand">連續 {streak} 天</span>
          )}
          <span>
            {totalSolved} 題 · {activeDays} 個活躍日
          </span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar-x">
        <div className="flex flex-col gap-1 pt-0.5">
          {DAY_LABELS.map((day, index) => (
            <div key={`${day}-${index}`} className="flex h-3.5 items-center">
              <span className="w-8 pr-1 text-right font-mono text-[10px] uppercase text-zinc-500">
                {day}
              </span>
            </div>
          ))}
        </div>
        <div
          className="grid flex-1 gap-1"
          style={{
            gridTemplateRows: `repeat(${DAYS}, 14px)`,
            gridAutoFlow: 'column',
            gridAutoColumns: '14px',
          }}
        >
          {cells.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date}: ${cell.count} 題`}
              className={`h-3.5 w-3.5 cursor-default transition-colors ${getColorClass(cell.count)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase text-zinc-500">
        <span>Less</span>
        {[0, 1, 2, 3].map((count) => (
          <div key={count} className={`h-3.5 w-3.5 ${getColorClass(count)}`} />
        ))}
        <span>More</span>
      </div>

      <div className="grid min-w-0 gap-px border border-white/15 bg-white/15 md:grid-cols-3">
        {habitInsights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex min-w-0 items-start gap-3 bg-surface p-4">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] uppercase text-zinc-400">{item.label}</p>
                <p className="mt-1.5 flex min-w-0 items-baseline gap-1 text-lg font-semibold text-paper">
                  <span className="truncate">{item.value}</span>
                  {'suffix' in item && item.suffix ? (
                    <span className="shrink-0 text-sm text-zinc-400">{item.suffix}</span>
                  ) : null}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
