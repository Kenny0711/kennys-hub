'use client';
import { useEffect, useState } from 'react';
import { LeetcodeRecord } from '@/lib/types';
import { MOCK_RECORDS } from '@/lib/mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export function useRecords() {
  const [records, setRecords] = useState<LeetcodeRecord[]>(USE_MOCK ? MOCK_RECORDS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK) return;
    fetch('/api/records')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRecords(data as LeetcodeRecord[]);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { records, loading, error };
}
