import fullLists from './full-lists.json';
import { recordedCompletionSnapshot } from './recorded-completions';
import { getListProblems } from './utils';
import type { ProblemList } from './types';

export const problemLists: ProblemList[] = (fullLists as ProblemList[]).map((list) => ({
  ...list,
  initialCompleted: getListProblems(list)
    .filter((problem) => recordedCompletionSnapshot.has(problem.id))
    .map((problem) => problem.id),
}));

export function getProblemList(id: string): ProblemList | undefined {
  return problemLists.find((list) => list.id === id);
}

export type { ListProblem, ProblemList, ProblemListSection } from './types';
export { getListProblems, getSectionProblems, getProblemSectionPath } from './utils';
