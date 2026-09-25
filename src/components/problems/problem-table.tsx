import Link from 'next/link';
import { LeetcodeRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DifficultyTag from './difficulty-tag';
import ProficiencyBadge from './proficiency-badge';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

const HEAD_CLASS = 'h-11 font-mono text-[11px] font-medium uppercase text-zinc-400';

export default function ProblemTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="border border-white/15 bg-surface py-20 text-center">
        <p className="font-mono text-xs uppercase text-zinc-500">No match</p>
        <p className="mt-2 text-sm text-zinc-400">沒有符合篩選條件的題目</p>
      </div>
    );
  }

  return (
    <div className="border border-white/15">
      <Table>
        <TableHeader>
          <TableRow className="border-white/15 bg-surface hover:bg-surface">
            <TableHead className={`w-20 pl-4 ${HEAD_CLASS}`}>#</TableHead>
            <TableHead className={HEAD_CLASS}>題目</TableHead>
            <TableHead className={`w-28 ${HEAD_CLASS}`}>難度</TableHead>
            <TableHead className={HEAD_CLASS}>Tags</TableHead>
            <TableHead className={`w-24 ${HEAD_CLASS}`}>熟練度</TableHead>
            <TableHead className={`w-20 pr-4 text-right ${HEAD_CLASS}`}>解法</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} className="group border-white/10 transition-colors hover:bg-surface">
              <TableCell className="pl-4 font-mono text-xs text-zinc-500">{r.problem_id}</TableCell>
              <TableCell className="py-4">
                <Link
                  href={`/problems/${r.id}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-paper transition-colors hover:text-brand"
                >
                  {r.title}
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </TableCell>
              <TableCell>
                <DifficultyTag difficulty={r.difficulty} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <ProficiencyBadge proficiency={r.proficiency} />
              </TableCell>
              <TableCell className="pr-4 text-right font-mono text-sm">
                {r.solutions.length > 0 ? (
                  <span className="font-semibold text-brand">{String(r.solutions.length).padStart(2, '0')}</span>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
