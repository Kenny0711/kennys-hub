export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Proficiency = '生疏' | '理解' | '熟練';

export interface Solution {
  method: string;
  code: string;
  language: string;
  time_complexity: string;
  space_complexity: string;
  notes: string;
  submitted_at?: string;
}

export interface LeetcodeRecord {
  id: string;
  problem_id: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  proficiency: Proficiency;
  solutions: Solution[];
  lc_slug?: string;
  description?: string;
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
  lc_slug?: string;
  description?: string;
  /** 匯入模式：若 problem_id 已存在則跳過，不新增 solution */
  skip_if_exists?: boolean;
  /** 只更新 tags 欄位，不新增 solution */
  tags_only?: boolean;
}
