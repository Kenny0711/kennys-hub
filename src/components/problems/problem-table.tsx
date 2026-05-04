import Link from 'next/link';
import { LeetcodeRecord } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ProficiencyBadge from './proficiency-badge';
import { ChevronRight } from 'lucide-react';

interface Props {
  records: LeetcodeRecord[];
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-rose-400',
};

const DIFFICULTY_BG: Record<string, string> = {
  Easy: 'bg-emerald-500/10 border-emerald-500/20',
  Medium: 'bg-amber-500/10 border-amber-500/20',
  Hard: 'bg-rose-500/10 border-rose-500/20',
};

export default function ProblemTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.02] py-20 text-center text-muted-foreground">
        <p className="text-sm">沒有符合篩選條件的題目</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 bg-white/[0.03] hover:bg-white/[0.03]">
            <TableHead className="w-16 text-muted-foreground text-xs font-semibold tracking-wider uppercase">#</TableHead>
            <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">題目</TableHead>
            <TableHead className="w-24 text-muted-foreground text-xs font-semibold tracking-wider uppercase">難度</TableHead>
            <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Tags</TableHead>
            <TableHead className="w-24 text-muted-foreground text-xs font-semibold tracking-wider uppercase">熟練度</TableHead>
            <TableHead className="w-20 text-muted-foreground text-xs font-semibold tracking-wider uppercase text-center">解法</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} className="border-white/5 hover:bg-white/[0.04] transition-colors group">
              <TableCell className="text-muted-foreground text-sm font-mono">
                {r.problem_id}
              </TableCell>
              <TableCell>
                <Link
                  href={`/problems/${r.id}`}
                  className="flex items-center gap-1 font-medium text-foreground/90 hover:text-foreground transition-colors group-hover:underline underline-offset-4"
                >
                  {r.title}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${DIFFICULTY_STYLE[r.difficulty]} ${DIFFICULTY_BG[r.difficulty]}`}
                >
                  {r.difficulty}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {r.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 bg-white/6 text-muted-foreground border-white/10 hover:bg-white/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <ProficiencyBadge proficiency={r.proficiency} />
              </TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">
                {r.solutions.length > 0 ? (
                  <span className="text-sky-400 font-medium">{r.solutions.length}</span>
                ) : (
                  <span className="opacity-30">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
