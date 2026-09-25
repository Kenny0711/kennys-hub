import { Proficiency } from '@/lib/types';

interface Props {
  proficiency: Proficiency;
}

const STYLES: Record<Proficiency, string> = {
  生疏: 'border-rose-400/40 text-rose-400',
  理解: 'border-amber-400/40 text-amber-400',
  熟練: 'border-emerald-400/40 text-emerald-400',
};

export default function ProficiencyBadge({ proficiency }: Props) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-xs font-semibold ${STYLES[proficiency]}`}
    >
      {proficiency}
    </span>
  );
}
