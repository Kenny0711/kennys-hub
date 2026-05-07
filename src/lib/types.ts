export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Proficiency = '生疏' | '理解' | '熟練';

export interface Solution {
  method: string;
  code: string;
  language: string;
  time_complexity: string;
  space_complexity: string;
  notes: string;
}

export interface LeetcodeRecord {
  id: string;
  problem_id: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  proficiency: Proficiency;
  solutions: Solution[];
  lc_slug?: string;          // LeetCode 題目 slug，如 "two-sum"
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  problem_id: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  code: string;
  language: string;
  lc_slug?: string;          // 由 Extension 從 URL 擷取
}
