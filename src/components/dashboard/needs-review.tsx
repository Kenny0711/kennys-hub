import Link from 'next/link';
import { LeetcodeRecord } from '@/lib/types';
import { AlertCircle, ChevronRight, Clock } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 週前`;
  return `${Math.floor(days / 30)} 個月前`;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-rose-400',
};

export default function NeedsReview({ records }: Props) {
  const toReview = records
    .filter((r) => r.proficiency === '生疏')
    .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
    .slice(0, 3);

  if (toReview.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-500/15">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <h2 className="text-sm font-semibold text-amber-300">近期建議複習</h2>
        <span className="ml-auto text-xs text-amber-500/70 bg-amber-500/15 px-2 py-0.5 rounded-full font-medium">
          {records.filter((r) => r.proficiency === '生疏').length} 題待加強
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-amber-500/10">
        {toReview.map((r) => (
          <Link
            key={r.id}
            href={`/problems/${r.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-amber-500/8 transition-colors group"
          >
            <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">
              {r.problem_id}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90 truncate group-hover:text-foreground transition-colors">
                {r.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-medium ${DIFFICULTY_COLOR[r.difficulty]}`}>
                  {r.difficulty}
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <Clock className="w-3 h-3" />
                  {timeAgo(r.updated_at)}
                </span>
              </div>
            </div>
            <span className="text-xs text-rose-400/70 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md font-medium shrink-0">
              生疏
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
