'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LeetcodeRecord } from '@/lib/types';
import { MOCK_RECORDS } from '@/lib/mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export function useRecords() {
  const [records, setRecords] = useState<LeetcodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK) {
      setRecords(MOCK_RECORDS);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from('leetcode_records')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRecords((data as LeetcodeRecord[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { records, loading, error };
}
