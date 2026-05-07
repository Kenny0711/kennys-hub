'use client';
import { LeetcodeRecord } from '@/lib/types';
import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

const WEEKS = 26;
const DAYS = 7;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getColorClass(count: number): string {
  if (count === 0) return 'bg-[#2e2e2e] hover:bg-[#3a3a3a]';
  if (count === 1) return 'bg-emerald-800 hover:bg-emerald-700';
  if (count === 2) return 'bg-emerald-600 hover:bg-emerald-500';
  return 'bg-emerald-400 hover:bg-emerald-300';
}

export default function ActivityHeatmap({ records }: Props) {
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      map[day] = (map[day] ?? 0) + 1;
    });
    return map;
  }, [records]);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - WEEKS * DAYS + 1);

  const cells: { date: string; count: number }[] = [];
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: activityMap[key] ?? 0 });
  }

  const totalSolved = records.length;
  const activeDays = Object.values(activityMap).filter((v) => v > 0).length;
  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (!activityMap[key]) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [activityMap]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Activity</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {streak > 0 && (
            <span className="text-emerald-400 font-semibold">🔥 {streak} 天連續</span>
          )}
          <span>{totalSolved} 題 · {activeDays} 天</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px] pt-0.5">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-3 flex items-center">
              <span className="text-[9px] text-muted-foreground w-6 text-right pr-1">{d}</span>
            </div>
          ))}
        </div>
        <div
          className="grid gap-[3px] flex-1"
          style={{
            gridTemplateRows: `repeat(${DAYS}, 12px)`,
            gridAutoFlow: 'column',
            gridAutoColumns: '12px',
          }}
        >
          {cells.map((cell) => (
            <div
              key={cell.date}
              title={`${cell.date}：${cell.count} 題`}
              className={`w-3 h-3 rounded-sm transition-colors cursor-default ${getColorClass(cell.count)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-muted-foreground">少</span>
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className={`w-3 h-3 rounded-sm ${getColorClass(n)}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">多</span>
      </div>
    </div>
  );
}
