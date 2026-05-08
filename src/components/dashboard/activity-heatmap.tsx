'use client';

import { LeetcodeRecord } from '@/lib/types';
import { useMemo } from 'react';
import { CalendarCheck, CalendarDays, CalendarRange, Target } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

const WEEKS = 26;
const DAYS = 7;
const WEEKLY_GOAL = 14;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getColorClass(count: number): string {
  if (count === 0) return 'bg-[#2e2e2e] hover:bg-[#3a3a3a]';
  if (count === 1) return 'bg-emerald-800 hover:bg-emerald-700';
  if (count === 2) return 'bg-emerald-600 hover:bg-emerald-500';
  return 'bg-emerald-400 hover:bg-emerald-300';
}

function getTaipeiDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

function getTaipeiWeekStartKey(date: Date): string {
  const taipeiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const daysSinceMonday = (taipeiDate.getDay() + 6) % 7;
  taipeiDate.setHours(0, 0, 0, 0);
  taipeiDate.setDate(taipeiDate.getDate() - daysSinceMonday);
  return getTaipeiDateKey(taipeiDate);
}

function hasSubmittedCode(record: LeetcodeRecord): boolean {
  return record.solutions.some((solution) => solution.code.trim().length > 0);
}

function getSubmissionDates(records: LeetcodeRecord[]): Date[] {
  return records.flatMap((record) =>
    record.solutions
      .filter((solution) => solution.code.trim().length > 0)
      .map((solution) => new Date(solution.submitted_at ?? record.created_at))
  );
}

export default function ActivityHeatmap({ records }: Props) {
  const submittedRecords = useMemo(() => records.filter(hasSubmittedCode), [records]);
  const submissionDates = useMemo(() => getSubmissionDates(records), [records]);

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    submissionDates.forEach((date) => {
      const day = getTaipeiDateKey(date);
      map[day] = (map[day] ?? 0) + 1;
    });
    return map;
  }, [submissionDates]);

  const today = new Date();
  const todayKey = getTaipeiDateKey(today);
  const weekStartKey = getTaipeiWeekStartKey(today);
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

  const totalSolved = submittedRecords.length;
  const activeDays = Object.values(activityMap).filter((count) => count > 0).length;
  const todayCount = activityMap[todayKey] ?? 0;
  const weekCount = submissionDates.filter((date) => {
    const key = getTaipeiDateKey(date);
    return key >= weekStartKey && key <= todayKey;
  }).length;
  const monthCount = submissionDates.filter((date) =>
    getTaipeiDateKey(date).startsWith(monthKey)
  ).length;

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
      color: 'text-sky-300',
    },
    {
      label: '本週目標',
      value: `${weekCount}/${WEEKLY_GOAL}`,
      suffix: '題',
      icon: Target,
      color: 'text-emerald-300',
    },
    {
      label: '本月累積',
      value: `${monthCount} 題`,
      icon: CalendarRange,
      color: 'text-violet-300',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-[18px] w-[18px] text-muted-foreground" />
          <h2 className="text-base font-semibold uppercase tracking-widest text-muted-foreground">
            Activity
          </h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {streak > 0 && (
            <span className="font-semibold text-emerald-400">連續 {streak} 天</span>
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
              <span className="w-8 pr-1 text-right text-[11px] text-muted-foreground">
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
              className={`h-3.5 w-3.5 cursor-default rounded-sm transition-colors ${getColorClass(cell.count)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5">
        <span className="text-xs text-muted-foreground">少</span>
        {[0, 1, 2, 3].map((count) => (
          <div key={count} className={`h-3.5 w-3.5 rounded-sm ${getColorClass(count)}`} />
        ))}
        <span className="text-xs text-muted-foreground">多</span>
      </div>

      <div className="border-t border-zinc-800/50 pt-5">
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          {habitInsights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex min-w-0 items-start gap-3 rounded-lg bg-white/[0.015] p-3.5"
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1 flex min-w-0 items-baseline gap-1 text-base font-semibold text-zinc-100">
                    <span className="truncate">{item.value}</span>
                    {'suffix' in item && item.suffix ? (
                      <span className="shrink-0 text-sm text-muted-foreground">{item.suffix}</span>
                    ) : null}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
