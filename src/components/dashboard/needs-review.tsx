import Link from 'next/link';
import { LeetcodeRecord } from '@/lib/types';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '@/components/layout/page-header';
import DifficultyTag from '@/components/problems/difficulty-tag';
import ProficiencyBadge from '@/components/problems/proficiency-badge';

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

export default function NeedsReview({ records }: Props) {
  const unfamiliar = records.filter((r) => r.proficiency === '生疏');
  const toReview = [...unfamiliar]
    .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
    .slice(0, 3);

  if (toReview.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Review / 03"
        title="Needs review."
        description="標記為「生疏」且最久沒碰的題目，優先回來複習。"
        action={<span className="text-coral">{unfamiliar.length} 題待加強</span>}
      />

      <div className="divide-y divide-white/15 border-y border-white/15">
        {toReview.map((r) => (
          <Link
            key={r.id}
            href={`/problems/${r.id}`}
            className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-5 transition-colors hover:bg-surface sm:grid-cols-[5rem_1fr_7rem_6rem_auto] lg:px-3"
          >
            <span className="font-mono text-xs text-zinc-500">#{r.problem_id}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-paper">{r.title}</p>
              <p className="mt-1 font-mono text-[11px] uppercase text-zinc-500 sm:hidden">
                {r.difficulty} · {timeAgo(r.updated_at)}
              </p>
            </div>
            <span className="hidden sm:block">
              <DifficultyTag difficulty={r.difficulty} />
            </span>
            <span className="hidden font-mono text-[11px] uppercase text-zinc-400 sm:block">
              {timeAgo(r.updated_at)}
            </span>
            <span className="flex items-center gap-3">
              <span className="hidden sm:inline-flex">
                <ProficiencyBadge proficiency={r.proficiency} />
              </span>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
