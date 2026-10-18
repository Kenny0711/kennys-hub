import 'server-only';
import type { NotionPage } from './notion-sync-core';

const API_ROOT = 'https://api.notion.com/v1';
const API_VERSION = '2026-03-11';

export function notionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATA_SOURCE_ID);
}

export async function notionRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN is not configured');
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${API_ROOT}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': API_VERSION,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(12_000),
      });
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      continue;
    }
    if (response.ok) return await response.json() as T;
    if (![429, 500, 502, 503, 504, 529].includes(response.status) || attempt === 2) {
      throw new Error(`Notion API ${method} ${path.split('?')[0]} failed (${response.status})`);
    }
    const retryAfter = Number(response.headers.get('retry-after'));
    await new Promise((resolve) => setTimeout(resolve,
      Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 10_000) : 500 * 2 ** attempt));
  }
  throw new Error('Notion API retry limit reached');
}

export interface NotionDataSource {
  properties: Record<string, { type: string; multi_select?: { options: { name: string }[] } }>;
}

export async function getNotionSchema(): Promise<NotionDataSource> {
  return notionRequest<NotionDataSource>(`/data_sources/${process.env.NOTION_DATA_SOURCE_ID}`);
}

export async function queryNotionPages(filter?: unknown): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const response = await notionRequest<{
      results: NotionPage[]; has_more: boolean; next_cursor: string | null;
    }>(`/data_sources/${process.env.NOTION_DATA_SOURCE_ID}/query`, 'POST', {
      ...(filter ? { filter } : {}), page_size: 100, ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);
  return pages;
}

export async function retrieveNotionPage(pageId: string): Promise<NotionPage> {
  return notionRequest<NotionPage>(`/pages/${pageId}`);
}

export async function retrieveNotionMarkdown(pageId: string): Promise<string | null> {
  const result = await notionRequest<{
    markdown: string; truncated: boolean; unknown_block_ids: string[];
  }>(`/pages/${pageId}/markdown?markdown_version=v1`);
  if (result.truncated || result.unknown_block_ids.length) return null;
  return result.markdown;
}

export async function createNotionPage(properties: Record<string, unknown>): Promise<NotionPage> {
  return notionRequest<NotionPage>('/pages', 'POST', {
    parent: { type: 'data_source_id', data_source_id: process.env.NOTION_DATA_SOURCE_ID },
    properties,
    children: [
      { object: 'block', type: 'heading_3', heading_3: {
        rich_text: [{ type: 'text', text: { content: '解題心得' } }],
      } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [] } },
    ],
  });
}

export async function updateNotionPage(pageId: string, properties: Record<string, unknown>): Promise<NotionPage> {
  return notionRequest<NotionPage>(`/pages/${pageId}`, 'PATCH', { properties });
}
