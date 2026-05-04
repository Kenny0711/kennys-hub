'use client';
import { useMemo, useState } from 'react';
import { LeetcodeRecord, Difficulty, Proficiency } from '@/lib/types';

export interface Filters {
  tag: string;
  difficulty: Difficulty | 'All';
  proficiency: Proficiency | 'All';
  search: string;
}

export function useFilter(records: LeetcodeRecord[]) {
  const [filters, setFiltersState] = useState<Filters>({
    tag: 'All',
    difficulty: 'All',
    proficiency: 'All',
    search: '',
  });

  const setFilter = (key: keyof Filters, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.tags.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set).sort()];
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filters.difficulty !== 'All' && r.difficulty !== filters.difficulty) return false;
      if (filters.proficiency !== 'All' && r.proficiency !== filters.proficiency) return false;
      if (filters.tag !== 'All' && !r.tags.includes(filters.tag)) return false;
      if (filters.search && !r.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [records, filters]);

  return { filtered, filters, setFilter, allTags };
}
