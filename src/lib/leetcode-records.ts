import { MOCK_RECORDS } from '@/lib/mock-data';
import { getLeetcodeReadClient } from '@/lib/leetcode-read-client';
import { LeetcodeRecord } from '@/lib/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export async function getDashboardRecords(): Promise<LeetcodeRecord[]> {
  if (USE_MOCK) return MOCK_RECORDS;

  const supabase = await getLeetcodeReadClient();
  const { data, error } = await supabase
    .from('leetcode_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load dashboard records:', error.message);
    return [];
  }

  return (data as LeetcodeRecord[]) ?? [];
}
