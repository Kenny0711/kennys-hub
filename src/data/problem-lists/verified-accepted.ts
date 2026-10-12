import type { LeetcodeRecord } from '@/lib/types';

// Snapshot from the public /api/records endpoint on 2026-10-12. Only explicit Accepted statuses count.
export const verifiedAcceptedSnapshot = new Set([
  '3794', '344', '2778', '3859', '992', '3306', '1248', '930', '1541',
  '3298', '2537', '2799', '2062', '3325', '2962', '1358', '2762', '3795',
  '2302', '3258', '1004', '2024', '2958', '1695', '904', '1208', '3634',
  '22', '3439', '1614', '3550', '3498', '836', '2574', '2144', '2126',
  '961', '3300', '145', '94', '3120', '1871', '82', '83', '3217', '3043',
  '203', '2181', '2657', '2058', '2540', '1290', '3679', '1345', '1423',
  '1306', '154', '2841', '2090', '1456', '1493', '3090', '20', '33',
  '153', '209',
]);

export function getVerifiedAcceptedIds(records: LeetcodeRecord[]): Set<string> {
  const ids = new Set(verifiedAcceptedSnapshot);
  for (const record of records) {
    if (record.solutions?.some((solution) =>
      solution.status?.toLowerCase() === 'accepted' ||
      solution.submission_status?.toLowerCase() === 'accepted'
    )) {
      ids.add(String(record.problem_id));
    }
  }
  return ids;
}
