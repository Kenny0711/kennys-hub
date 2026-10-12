import { slidingWindowList } from './sliding-window';
import { starterLists } from './starter-lists';
import { verifiedAcceptedSnapshot } from './verified-accepted';
import type { ListProblem, ProblemList, ProblemListSection } from './types';

export const problemLists: ProblemList[] = [slidingWindowList, ...starterLists].map((list) => ({
  ...list,
  initialCompleted: getListProblems(list)
    .filter((problem) => verifiedAcceptedSnapshot.has(problem.id))
    .map((problem) => problem.id),
}));

export function getProblemList(id: string): ProblemList | undefined {
  return problemLists.find((list) => list.id === id);
}

export function getSectionProblems(section: ProblemListSection): ListProblem[] {
  return uniqueProblems([
    ...(section.problems ?? []),
    ...(section.sections ?? []).flatMap(getSectionProblems),
  ]);
}

export function getListProblems(list: ProblemList): ListProblem[] {
  return uniqueProblems(list.sections.flatMap(getSectionProblems));
}

function uniqueProblems(problems: ListProblem[]): ListProblem[] {
  const seen = new Set<string>();
  return problems.filter((problem) => {
    if (seen.has(problem.id)) return false;
    seen.add(problem.id);
    return true;
  });
}

export function getProblemSectionPath(
  sections: ProblemListSection[],
  problemId: string,
  parents: string[] = []
): string[] {
  for (const section of sections) {
    const path = [...parents, section.id];
    if (section.problems?.some((problem) => problem.id === problemId)) return path;
    const childPath = getProblemSectionPath(section.sections ?? [], problemId, path);
    if (childPath.length) return childPath;
  }
  return [];
}

export type { ListProblem, ProblemList, ProblemListSection } from './types';
