import type { LeetcodeRecord } from '@/lib/types';

// Public /api/records snapshot, 2026-10-12: Accepted, statusless saved code, and legacy AC imports.
// Import-only records have no code/status; the import flow sourced them from LeetCode's status=ac list.
export const recordedCompletionSnapshot = new Set([
  '1', '3', '4', '9', '11', '13', '20', '21', '22', '27', '33', '34',
  '36', '42', '48', '49', '58', '61', '66', '67', '69', '74', '82', '83',
  '84', '94', '100', '121', '125', '128', '144', '145', '153', '154',
  '155', '167', '201', '203', '206', '209', '217', '225', '238', '239',
  '242', '344', '347', '396', '429', '567', '589', '590', '605', '643',
  '704', '739', '763', '788', '796', '836', '868', '904', '930', '961',
  '977', '981', '992', '1004', '1009', '1123', '1208', '1248', '1290',
  '1302', '1306', '1343', '1345', '1356', '1358', '1391', '1415', '1423',
  '1456', '1493', '1541', '1545', '1559', '1582', '1614', '1665', '1695',
  '1722', '1727', '1758', '1784', '1848', '1855', '1861', '1863', '1871',
  '1888', '1914', '1980', '2024', '2033', '2058', '2062', '2078', '2090',
  '2126', '2140', '2144', '2181', '2302', '2452', '2515', '2523', '2537',
  '2540', '2551', '2553', '2574', '2615', '2657', '2762', '2770', '2778',
  '2780', '2784', '2799', '2833', '2841', '2873', '2874', '2958', '2962',
  '2965', '3043', '3070', '3090', '3120', '3129', '3130', '3217', '3258',
  '3298', '3300', '3306', '3325', '3439', '3464', '3488', '3498', '3550',
  '3634', '3660', '3679', '3740', '3741', '3742', '3761', '3783', '3794',
  '3795', '3859', '3903', '3904',
]);

export function getRecordedCompletionIds(records: LeetcodeRecord[]): Set<string> {
  const ids = new Set(recordedCompletionSnapshot);
  for (const record of records) {
    if (record.solutions?.some((solution) => {
      const status = solution.status?.trim().toLowerCase();
      const submissionStatus = solution.submission_status?.trim().toLowerCase();
      if (status === 'accepted' || submissionStatus === 'accepted') return true;
      return !status && !submissionStatus && Boolean(solution.code?.trim());
    })) {
      ids.add(String(record.problem_id));
    }
  }
  return ids;
}
