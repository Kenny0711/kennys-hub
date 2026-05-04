import { LeetcodeRecord } from '@/lib/types';
import { Target, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

const TARGET_TOTAL = 150;
const TARGET_HARD = 20;

const FOCUS_TOPICS = [
  { name: 'Graph / BFS / DFS', done: false },
  { name: 'Dynamic Programming', done: false },
  { name: 'Binary Search', done: false },
  { name: 'Sliding Window', done: true },
  { name: 'Two Pointers', done: true },
  { name: 'Heap / Priority Queue', done: false },
];

export default function GoalBanner({ records }: Props) {
  const solved = records.length;
  const hard = records.filter((r) => r.difficulty === 'Hard').length;
  const mastered = records.filter((r) => r.proficiency === '熟練').length;

  const totalPct = Math.min(Math.round((solved / TARGET_TOTAL) * 100), 100);
  const hardPct = Math.min(Math.round((hard / TARGET_HARD) * 100), 100);

  return (
    <div className="rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.03] to-sky-500/[0.04] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground tracking-tight">目標：Google SWE</h2>
          <p className="text-xs text-muted-foreground">Stay hungry. Stay foolish.</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-sky-400">{totalPct}%</p>
          <p className="text-[10px] text-muted-foreground">整體進度</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress bars */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">刷題進度</p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground/80">總題數</span>
              <span className="text-sky-400 font-semibold font-mono">{solved} / {TARGET_TOTAL}</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all"
                style={{ width: `${totalPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground/80">Hard 題</span>
              <span className="text-rose-400 font-semibold font-mono">{hard} / {TARGET_HARD}</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-700 to-rose-400 transition-all"
                style={{ width: `${hardPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-foreground/80">熟練題目</span>
              <span className="text-violet-400 font-semibold font-mono">{mastered} / {solved}</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-700 to-violet-400 transition-all"
                style={{ width: solved > 0 ? `${Math.round(mastered / solved * 100)}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Focus topics checklist */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Google 高頻考點</p>
          <div className="space-y-2">
            {FOCUS_TOPICS.map(({ name, done }) => (
              <div
                key={name}
                className={`flex items-center gap-2.5 text-sm ${done ? 'text-muted-foreground/50 line-through' : 'text-foreground/80'}`}
              >
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500/60 shrink-0" />
                  : <Circle className="w-4 h-4 text-white/20 shrink-0" />
                }
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
