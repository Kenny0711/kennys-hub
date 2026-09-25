import { Difficulty } from '@/lib/types';

export const DIFFICULTY_TONE: Record<Difficulty, { swatch: string; text: string }> = {
  Easy: { swatch: 'bg-emerald-400', text: 'text-emerald-400' },
  Medium: { swatch: 'bg-amber-400', text: 'text-amber-400' },
  Hard: { swatch: 'bg-rose-400', text: 'text-rose-400' },
};

export default function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  const tone = DIFFICULTY_TONE[difficulty];

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase ${tone.text}`}>
      <span className={`h-2 w-2 shrink-0 ${tone.swatch}`} aria-hidden="true" />
      {difficulty}
    </span>
  );
}
