'use client';

import { useSyncExternalStore } from 'react';
interface ProgressList {
  id: string;
  initialCompleted: string[];
  problemIds: string[];
}

const STORAGE_KEY = 'leetcode-problem-list-progress';
const CHANGE_EVENT = 'problem-list-progress-changed';

interface ListProgress {
  completed: string[];
  review: string[];
  excludedAccepted?: string[];
  updatedAt: string;
}

interface ProgressStore {
  version: 1;
  lists: Record<string, ListProgress>;
}

function readStore(raw: string | null): ProgressStore {
  if (raw) {
    try {
      const data: unknown = JSON.parse(raw);
      if (data && typeof data === 'object' && 'version' in data && data.version === 1 &&
          'lists' in data && data.lists && typeof data.lists === 'object') {
        return data as ProgressStore;
      }
    } catch {
      // A malformed value should not prevent the checklist from loading.
    }
  }
  return { version: 1, lists: {} };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function saveListProgress(list: ProgressList, update: (current: ListProgress) => ListProgress) {
  const store = readStore(window.localStorage.getItem(STORAGE_KEY));
  const current = store.lists[list.id] ?? {
    completed: list.initialCompleted,
    review: [],
    excludedAccepted: [],
    updatedAt: new Date().toISOString(),
  };
  store.lists[list.id] = update(current);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useProblemListProgress(list: ProgressList, completedRecordIds: ReadonlySet<string>) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = readStore(raw).lists[list.id];
  const progress: ListProgress = saved && Array.isArray(saved.completed) && Array.isArray(saved.review)
    ? saved
    : { completed: list.initialCompleted, review: [], updatedAt: '' };
  const listIds = new Set(list.problemIds);
  const automatic = new Set([...list.initialCompleted, ...completedRecordIds].filter((id) => listIds.has(id)));
  const excluded = new Set(Array.isArray(progress.excludedAccepted) ? progress.excludedAccepted : []);
  const completed = new Set([...automatic, ...progress.completed]);
  for (const id of excluded) completed.delete(id);

  function toggle(field: 'completed' | 'review', problemId: string) {
    saveListProgress(list, (current) => {
      if (field === 'completed') {
        const stored = new Set(current.completed);
        const blocked = new Set(Array.isArray(current.excludedAccepted) ? current.excludedAccepted : []);
        if (completed.has(problemId)) {
          stored.delete(problemId);
          if (automatic.has(problemId)) blocked.add(problemId);
        } else {
          stored.add(problemId);
          blocked.delete(problemId);
        }
        return { ...current, completed: [...stored], excludedAccepted: [...blocked], updatedAt: new Date().toISOString() };
      }
      const values = new Set(current[field]);
      if (values.has(problemId)) values.delete(problemId);
      else values.add(problemId);
      return { ...current, [field]: [...values], updatedAt: new Date().toISOString() };
    });
  }

  function reset() {
    saveListProgress(list, () => ({
      completed: [],
      review: [],
      excludedAccepted: [...automatic],
      updatedAt: new Date().toISOString(),
    }));
  }

  return {
    completed,
    review: new Set(progress.review),
    updatedAt: progress.updatedAt,
    toggleCompleted: (id: string) => toggle('completed', id),
    toggleReview: (id: string) => toggle('review', id),
    reset,
  };
}
