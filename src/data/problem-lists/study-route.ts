const STUDY_ROUTE: ReadonlyArray<{ id: string; step?: string }> = [
  { id: 'sliding-window', step: '01' },
  { id: 'binary-search', step: '02' },
  { id: 'data-structures', step: '03' },
  { id: 'linked-list-tree', step: '04 / 06' },
  { id: 'grid-graph', step: '05' },
  { id: 'dynamic-programming', step: '07' },
  { id: 'monotonic-stack' },
  { id: 'bit-manipulation' },
  { id: 'graph-theory' },
  { id: 'math' },
  { id: 'greedy' },
  { id: 'strings' },
];

const routeIndex = new Map<string, number>(STUDY_ROUTE.map((entry, index) => [entry.id, index]));

export function orderProblemLists<T extends { id: string }>(lists: readonly T[]): T[] {
  return [...lists].sort((left, right) =>
    (routeIndex.get(left.id) ?? Infinity) - (routeIndex.get(right.id) ?? Infinity)
  );
}

export function getStudyRouteStep(id: string): string | undefined {
  return STUDY_ROUTE.find((entry) => entry.id === id)?.step;
}
