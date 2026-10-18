import type { LeetcodeRecord, Proficiency, Solution } from './types';

export interface NotionProperty {
  id?: string;
  type?: string;
  number?: number | null;
  title?: { plain_text?: string }[];
  rich_text?: { plain_text?: string }[];
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  date?: { start: string } | null;
  url?: string | null;
}

export interface NotionPage {
  id: string;
  url: string;
  last_edited_time: string;
  in_trash?: boolean;
  parent?: { type?: string; data_source_id?: string };
  properties: Record<string, NotionProperty>;
}

const TOPIC_ALIASES: Record<string, string> = {
  array: 'Arrays',
  arrays: 'Arrays',
  'hash map': 'Hash Table',
  'hashmap': 'Hash Table',
  'depth-first search': 'DFS',
  'binary tree': 'Binary Tree',
  'two pointers': 'Two Pointers',
  'linked list': 'Linked List',
  'bit manipulation': 'Bit Manipulation',
  'priority queue': 'Heap',
};

export function isAcceptedStatus(status: string | undefined): boolean {
  return status?.trim().toLowerCase() === 'accepted';
}

export function hasNewVerifiedSubmission(record: LeetcodeRecord): boolean {
  return record.solutions.some((solution) =>
    /^\d+$/.test(solution.submission_id ?? '') &&
    (solution.status === 'accepted' || isAcceptedStatus(solution.submission_status)));
}

export function shouldRecoverNotionPush(
  record: LeetcodeRecord,
  state: { last_pushed_record_at: string | null; needs_push: boolean } | undefined,
): boolean {
  return hasNewVerifiedSubmission(record) && !state?.needs_push &&
    (!state?.last_pushed_record_at ||
      new Date(record.updated_at).getTime() > new Date(state.last_pushed_record_at).getTime());
}

export function notionWebhookPageId(event: {
  type?: unknown;
  entity?: { type?: unknown; id?: unknown };
}): string | null {
  if (!['page.properties_updated', 'page.content_updated', 'page.created'].includes(String(event.type))) {
    return null;
  }
  return event.entity?.type === 'page' && typeof event.entity.id === 'string'
    ? event.entity.id : null;
}

export function notionWebhookUpdatedPropertyIds(event: { type?: unknown; data?: unknown }): string[] {
  if (event.type !== 'page.properties_updated' || !event.data || typeof event.data !== 'object') {
    return [];
  }
  const properties = (event.data as Record<string, unknown>).updated_properties;
  return Array.isArray(properties) ? properties.filter((id): id is string => typeof id === 'string') : [];
}

export function proficiencyFromNotionProgress(
  page: NotionPage,
  updatedPropertyIds: string[],
): Proficiency | null {
  const progress = page.properties['Problem Progress'];
  if (!progress?.id || !updatedPropertyIds.includes(progress.id)) return null;
  const byStatus: Record<string, Proficiency> = {
    Completed: '熟練',
    'In Progress': '理解',
    'Need Review': '生疏',
    'To Do': '理解',
  };
  return byStatus[progress.select?.name ?? ''] ?? null;
}

export function problemIdFromPage(page: NotionPage): number | null {
  const numeric = page.properties['LeetCode ID']?.number;
  if (Number.isSafeInteger(numeric) && Number(numeric) > 0) return Number(numeric);
  const name = page.properties.Name?.title?.map((part) => part.plain_text ?? '').join('') ?? '';
  const match = name.match(/^\s*(\d+)\s*[.．]\s*/);
  return match ? Number(match[1]) : null;
}

export function uniquePageForProblem(problemId: number, pages: NotionPage[]): NotionPage | null {
  const matches = pages.filter((page) => !page.in_trash && problemIdFromPage(page) === problemId);
  if (matches.length > 1) throw new Error(`Ambiguous Notion pages for #${problemId}`);
  return matches[0] ?? null;
}

export function dateInTaipei(iso: string): string | null {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function firstVerifiedAcceptedDate(solutions: Solution[]): string | null {
  const timestamps = solutions
    .filter((item) => item.accepted_at_verified && item.status === 'accepted' && item.submitted_at)
    .map((item) => item.submitted_at as string)
    .filter((value) => Number.isFinite(new Date(value).getTime()))
    .sort();
  return timestamps[0] ? dateInTaipei(timestamps[0]) : null;
}

export function normalizedTopics(tags: string[], allowed: string[]): string[] {
  const options = new Map(allowed.map((name) => [name.toLowerCase(), name]));
  return [...new Set(tags.map((tag) => {
    const key = tag.trim().toLowerCase();
    return options.get(key) ?? options.get((TOPIC_ALIASES[key] ?? '').toLowerCase());
  }).filter((tag): tag is string => Boolean(tag)))];
}

function isClearlyCppCode(code: string): boolean {
  return /#include\s*[<"]|\bstd::/.test(code) ||
    (/\bclass\s+\w+\s*\{/.test(code) &&
      /\b(?:public|private|protected)\s*:|\b(?:vector|unordered_map|unordered_set)\s*</.test(code));
}

export function normalizeSolutionLanguage(language: string | undefined, code: string): string {
  const raw = (language ?? '').toLowerCase();
  if ((raw === 'python' || raw === 'python3' || !raw) && isClearlyCppCode(code)) return 'cpp';
  if (raw === 'python3') return 'python';
  if (raw === 'c++') return 'cpp';
  return raw || 'code';
}

export function languageForNotion(language: string | undefined, code = ''): string | null {
  const names: Record<string, string> = {
    cpp: 'C++', 'c++': 'C++', csharp: 'C#', java: 'JAVA',
    javascript: 'JavaScript', python: 'Python', python3: 'Python', php: 'PHP',
  };
  return names[normalizeSolutionLanguage(language, code)] ?? null;
}

export function hubOwnedProperties(
  record: LeetcodeRecord,
  page: NotionPage | null,
  allowedTopics: string[],
  allowedLanguages: string[],
): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    'LeetCode ID': { number: record.problem_id },
    Name: { title: [{ text: { content: `${record.problem_id}. ${record.title.replace(/^\d+\s*[.．]\s*/, '')}` } }] },
    'Difficulty Level': { select: { name: record.difficulty } },
  };
  if (!page) {
    const progress: Record<Proficiency, string> = {
      生疏: 'Need Review', 理解: 'To Do', 熟練: 'Completed',
    };
    properties['Problem Progress'] = { select: { name: progress[record.proficiency] } };
  }
  const date = firstVerifiedAcceptedDate(record.solutions);
  if (!page?.properties['Date Solved']?.date?.start && date) {
    properties['Date Solved'] = { date: { start: date } };
  }
  if (record.tags.length) {
    const topics = normalizedTopics(record.tags, allowedTopics);
    if (topics.length) properties.Topic = { multi_select: topics.map((name) => ({ name })) };
  }
  if (record.lc_slug) {
    properties['LeetCode URL'] = { url: `https://leetcode.com/problems/${record.lc_slug}/` };
  }
  const languages = [...new Set(record.solutions
    .filter((item) => item.code?.trim() &&
      (item.status === 'accepted' || isAcceptedStatus(item.submission_status)))
    .map((item) => languageForNotion(item.language, item.code))
    .filter((item): item is string => item !== null && allowedLanguages.includes(item)))];
  if (languages.length) properties.Language = { multi_select: languages.map((name) => ({ name })) };
  return properties;
}

export function changedHubProperties(page: NotionPage, desired: Record<string, unknown>): Record<string, unknown> {
  const current = page.properties;
  const changed: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(desired)) {
    const target = value as Record<string, unknown>;
    let matches = false;
    if (name === 'LeetCode ID') matches = current[name]?.number === target.number;
    if (name === 'Name') {
      const title = (target.title as { text: { content: string } }[])[0].text.content;
      matches = current.Name?.title?.map((part) => part.plain_text ?? '').join('') === title;
    }
    if (name === 'Difficulty Level') {
      matches = current[name]?.select?.name === (target.select as { name: string }).name;
    }
    if (name === 'Date Solved') {
      matches = current[name]?.date?.start === (target.date as { start: string }).start;
    }
    if (name === 'LeetCode URL') matches = current[name]?.url === target.url;
    if (name === 'Topic' || name === 'Language') {
      const actual = (current[name]?.multi_select ?? []).map((part) => part.name).sort();
      const expected = (target.multi_select as { name: string }[]).map((part) => part.name).sort();
      matches = JSON.stringify(actual) === JSON.stringify(expected);
    }
    if (!matches) changed[name] = value;
  }
  return changed;
}

export function readNotionFields(page: NotionPage, markdown: string | null) {
  const difficulty = page.properties['Difficulty Level'];
  const time = page.properties['Time Complexity'];
  const space = page.properties['Space Complexity'];
  const notes = page.properties.Notes;
  const noteText = notes?.rich_text?.map((part) => part.plain_text ?? '').join('') ?? '';
  return {
    ...(page.properties['Date Solved']?.date?.start
      ? { date_solved: page.properties['Date Solved'].date.start.slice(0, 10) } : {}),
    ...(difficulty ? { difficulty: difficulty.select?.name ?? null } : {}),
    ...(time ? { time_complexity: time.multi_select?.map((option) => option.name) ?? [] } : {}),
    ...(space ? { space_complexity: space.multi_select?.map((option) => option.name) ?? [] } : {}),
    ...(markdown !== null ? { notes_markdown: [noteText, markdown].filter(Boolean).join('\n\n') } : {}),
    notion_page_id: page.id,
    notion_url: page.url,
    notion_last_edited_at: page.last_edited_time,
    last_synced_at: new Date().toISOString(),
  };
}
