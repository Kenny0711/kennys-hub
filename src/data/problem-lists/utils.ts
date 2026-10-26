import type { ListProblem, ProblemList, ProblemListSection } from './types';

export function getSectionProblems(section: ProblemListSection): ListProblem[] {
  return uniqueProblems([
    ...(section.problems ?? []),
    ...(section.sections ?? []).flatMap(getSectionProblems),
  ]);
}

export function getListProblems(list: ProblemList): ListProblem[] {
  return uniqueProblems(list.sections.flatMap(getSectionProblems));
}

export function getStudyTargetProgress<T extends Pick<ListProblem, 'id' | 'difficultyScore'>>(
  problems: readonly T[],
  completed: ReadonlySet<string>
) {
  const targetProblems = problems.filter((problem) =>
    typeof problem.difficultyScore === 'number' && problem.difficultyScore <= 1800
  );
  return {
    completed: targetProblems.filter((problem) => completed.has(problem.id)).length,
    total: targetProblems.length,
    next: targetProblems.find((problem) => !completed.has(problem.id)),
  };
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
