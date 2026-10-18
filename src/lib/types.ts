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
  status?: 'accepted' | 'runtime_error' | 'manual_sync' | 'unknown' | string;
  submission_status?: string;
  sync_source?: 'auto' | 'manual' | string;
  submission_id?: string;
  accepted_at_verified?: boolean;
}

export interface NotionProblemSync {
  problem_id: number;
  notion_page_id: string | null;
  notion_url: string | null;
  date_solved: string | null;
  difficulty: string | null;
  time_complexity: string[] | null;
  space_complexity: string[] | null;
  notes_markdown: string | null;
  notion_last_edited_at: string | null;
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

export interface Project {
  id: string;
  title: string;
  description: string;
  project_url: string;
  image_url: string;
  tags: string[];
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WebhookPayload {
  problem_id: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  code: string;
  language: string;
  submission_status?: string;
  submission_id?: string;
  accepted_at?: string;
  sync_source?: 'auto' | 'manual' | string;
  lc_slug?: string;
  description?: string;
  /** 匯入模式：若 problem_id 已存在則跳過，不新增 solution */
  skip_if_exists?: boolean;
  /** 只更新 tags 欄位，不新增 solution */
  tags_only?: boolean;
}
