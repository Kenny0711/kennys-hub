import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudyTargetProgress } from '../src/data/problem-lists/utils.ts';

test('study progress counts completed problems scored at or below 1800', () => {
  const problems = [
    { id: '1', difficultyScore: 1200 },
    { id: '2', difficultyScore: 1800 },
    { id: '3', difficultyScore: 1801 },
    { id: '4' },
  ];
  assert.deepEqual(getStudyTargetProgress(problems, new Set(['1', '3', '4'])), {
    completed: 1,
    total: 2,
    next: problems[1],
  });
});

test('study progress has no next problem when the target is complete or unrated', () => {
  const problems = [{ id: '1', difficultyScore: 1800 }, { id: '2' }];
  assert.deepEqual(getStudyTargetProgress(problems, new Set(['1'])), {
    completed: 1,
    total: 1,
    next: undefined,
  });
  assert.deepEqual(getStudyTargetProgress([problems[1]], new Set()), {
    completed: 0,
    total: 0,
    next: undefined,
  });
});
