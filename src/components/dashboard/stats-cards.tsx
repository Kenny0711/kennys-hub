import { LeetcodeRecord } from '@/lib/types';
import { BookOpen, Trophy, Zap, Flame, TrendingUp } from 'lucide-react';

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
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  border: string;
  bg: string;
}) {
  return (
    <div className={`relative rounded-xl border ${border} ${bg} p-4 overflow-hidden`}>
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${color} opacity-5 blur-xl`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground tracking-wide">{label}</span>
        <Icon className={`w-4 h-4 ${color} opacity-60`} />
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function StatsCards({ records }: Props) {
  const total = records.length;
  const mastered = records.filter((r) => r.proficiency === '熟練').length;
  const easy = records.filter((r) => r.difficulty === 'Easy').length;
  const medium = records.filter((r) => r.difficulty === 'Medium').length;
  const hard = records.filter((r) => r.difficulty === 'Hard').length;

  return (
    <div className="flex gap-3">
      {/* Block A：整體進度 */}
      <div className="flex flex-col gap-3 w-[200px] shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-0.5">整體進度</p>
        <Card label="總題數" value={total} icon={BookOpen} color="text-sky-400" border="border-sky-500/25" bg="bg-sky-500/8" />
        <Card label="熟練" value={mastered} icon={Trophy} color="text-violet-400" border="border-violet-500/25" bg="bg-violet-500/8" />
      </div>

      {/* divider */}
      <div className="w-px bg-white/6 self-stretch mx-1" />

      {/* Block B：難度分佈 */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-0.5">難度分佈</p>
        <div className="grid grid-cols-3 gap-3">
          <Card label="Easy" value={easy} icon={Zap} color="text-emerald-400" border="border-emerald-500/25" bg="bg-emerald-500/8" />
          <Card label="Medium" value={medium} icon={Flame} color="text-amber-400" border="border-amber-500/25" bg="bg-amber-500/8" />
          <Card label="Hard" value={hard} icon={TrendingUp} color="text-rose-400" border="border-rose-500/25" bg="bg-rose-500/8" />
        </div>
        {/* mini progress bar */}
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500/70 rounded-full transition-all" style={{ flex: easy }} />
          <div className="bg-amber-500/70 rounded-full transition-all" style={{ flex: medium }} />
          <div className="bg-rose-500/70 rounded-full transition-all" style={{ flex: hard }} />
        </div>
        <p className="text-[10px] text-muted-foreground/50 -mt-1">
          Easy {Math.round(easy / (total || 1) * 100)}% · Medium {Math.round(medium / (total || 1) * 100)}% · Hard {Math.round(hard / (total || 1) * 100)}%
        </p>
      </div>
    </div>
  );
}
