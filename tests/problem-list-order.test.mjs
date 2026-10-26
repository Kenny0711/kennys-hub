import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudyRouteStep, orderProblemLists } from '../src/data/problem-lists/study-route.ts';

test('problem lists follow the core learning route before the remaining source topics', () => {
  const source = [
    'strings', 'monotonic-stack', 'dynamic-programming', 'grid-graph',
    'linked-list-tree', 'data-structures', 'binary-search', 'sliding-window',
    'bit-manipulation', 'graph-theory', 'math', 'greedy',
  ].map((id) => ({ id }));
  const ordered = orderProblemLists(source);

  assert.deepEqual(ordered.map(({ id }) => id), [
    'sliding-window', 'binary-search', 'data-structures', 'linked-list-tree',
    'grid-graph', 'dynamic-programming', 'monotonic-stack', 'bit-manipulation',
    'graph-theory', 'math', 'greedy', 'strings',
  ]);
  assert.equal(source[0].id, 'strings');
  assert.equal(getStudyRouteStep('linked-list-tree'), '04 / 06');
  assert.equal(getStudyRouteStep('monotonic-stack'), undefined);
});
