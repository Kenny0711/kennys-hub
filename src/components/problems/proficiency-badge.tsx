import { Proficiency } from '@/lib/types';

interface Props {
  proficiency: Proficiency;
}

const STYLES: Record<Proficiency, string> = {
  生疏: 'bg-rose-500/12 text-rose-400 border-rose-500/25',
  理解: 'bg-amber-500/12 text-amber-400 border-amber-500/25',
  熟練: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
};

export default function ProficiencyBadge({ proficiency }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${STYLES[proficiency]}`}
    >
      {proficiency}
    </span>
  );
}
