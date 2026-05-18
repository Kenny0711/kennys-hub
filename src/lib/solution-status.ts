import type { Solution } from '@/lib/types';

export function isAcceptedSolution(solution: Solution): boolean {
  const raw = `${solution.status ?? ''} ${solution.submission_status ?? ''}`.toLowerCase();
  if (raw.includes('accepted')) return true;
  if (raw.trim().length > 0) return false;
  return solution.code.trim().length > 0;
}
