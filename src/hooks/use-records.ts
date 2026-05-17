'use client';
import { useEffect, useState } from 'react';
import { LeetcodeRecord } from '@/lib/types';
import { MOCK_RECORDS } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

function sortByCreatedAt(records: LeetcodeRecord[]): LeetcodeRecord[] {
  return [...records].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function useRecords() {
  const [records, setRecords] = useState<LeetcodeRecord[]>(USE_MOCK ? MOCK_RECORDS : []);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK) return;
    const supabase = createClient();

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

    const channel = supabase
      .channel('leetcode-records')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leetcode_records' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nextRecord = payload.new as LeetcodeRecord;
            setRecords((current) => sortByCreatedAt([nextRecord, ...current]));
            return;
          }

          if (payload.eventType === 'UPDATE') {
            const nextRecord = payload.new as LeetcodeRecord;
            setRecords((current) =>
              sortByCreatedAt(current.map((record) => (record.id === nextRecord.id ? nextRecord : record)))
            );
            return;
          }

          if (payload.eventType === 'DELETE') {
            const deletedRecord = payload.old as Pick<LeetcodeRecord, 'id'>;
            setRecords((current) => current.filter((record) => record.id !== deletedRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return { records, loading, error };
}
