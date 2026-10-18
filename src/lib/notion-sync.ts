import 'server-only';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from './supabase-admin';
import type { LeetcodeRecord } from './types';
import {
  changedHubProperties, firstVerifiedAcceptedDate, hubOwnedProperties,
  problemIdFromPage, proficiencyFromNotionProgress, readNotionFields,
  shouldRecoverNotionPush, uniquePageForProblem, type NotionPage,
} from './notion-sync-core';
import {
  createNotionPage, getNotionSchema, notionConfigured, queryNotionPages,
  retrieveNotionMarkdown, retrieveNotionPage, updateNotionPage,
} from './notion-api';

type CachedRow = {
  notion_page_id: string | null;
  notion_last_edited_at: string | null;
  notes_markdown: string | null;
};

function assertSource(page: NotionPage): boolean {
  return page.parent?.data_source_id === process.env.NOTION_DATA_SOURCE_ID;
}

async function unlinkDeletedNotionPage(problemId: number, deletedPageId: string): Promise<void> {
  const { data, error } = await getSupabaseAdmin().from('notion_problem_sync').update({
    notion_page_id: null,
    notion_url: null,
    notion_last_edited_at: null,
    date_solved: null,
    difficulty: null,
    time_complexity: null,
    space_complexity: null,
    notes_markdown: null,
    last_synced_at: null,
  }).eq('problem_id', problemId).eq('notion_page_id', deletedPageId)
    .select('problem_id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Notion page mapping changed for #${problemId}`);
}

async function findNotionPage(problemId: number, cachedPageId: string | null): Promise<NotionPage | null> {
  let deletedPageId: string | null = null;
  if (cachedPageId) {
    const page = await retrieveNotionPage(cachedPageId);
    if (!assertSource(page) || problemIdFromPage(page) !== problemId) {
      throw new Error(`Notion page mapping mismatch for #${problemId}`);
    }
    if (!page.in_trash) return page;
    deletedPageId = cachedPageId;
  }
  const byId = await queryNotionPages({ property: 'LeetCode ID', number: { equals: problemId } });
  const idMatch = uniquePageForProblem(problemId, byId);
  let activePage = idMatch;
  if (!activePage) {
    const byTitle = await queryNotionPages({ property: 'Name', title: { contains: `${problemId}.` } });
    activePage = uniquePageForProblem(problemId, byTitle.filter(assertSource));
  }
  if (deletedPageId) {
    await unlinkDeletedNotionPage(problemId, deletedPageId);
  }
  return activePage;
}

export async function cacheNotionPage(
  page: NotionPage,
  knownProblemId?: number,
  updatedPropertyIds: string[] = [],
): Promise<'updated' | 'skipped'> {
  if (!assertSource(page) || page.in_trash) return 'skipped';
  const problemId = problemIdFromPage(page);
  if (!problemId || (knownProblemId && problemId !== knownProblemId)) return 'skipped';
  const supabase = getSupabaseAdmin();
  const { data: record, error: recordError } = await supabase
    .from('leetcode_records').select('problem_id, proficiency').eq('problem_id', problemId).maybeSingle();
  if (recordError) throw recordError;
  if (!record) return 'skipped';
  const { data: cached, error: cacheError } = await supabase
    .from('notion_problem_sync').select('notion_page_id, notion_last_edited_at, notes_markdown')
    .eq('problem_id', problemId).maybeSingle();
  if (cacheError) throw cacheError;
  let state = cached as CachedRow | null;
  if (state?.notion_page_id && state.notion_page_id !== page.id) {
    const oldPage = await retrieveNotionPage(state.notion_page_id);
    if (!oldPage.in_trash || !assertSource(oldPage) || problemIdFromPage(oldPage) !== problemId) {
      throw new Error(`Notion page mapping conflict for #${problemId}`);
    }
    const matches = await queryNotionPages({ property: 'LeetCode ID', number: { equals: problemId } });
    if (uniquePageForProblem(problemId, matches)?.id !== page.id) {
      throw new Error(`Ambiguous Notion replacement for #${problemId}`);
    }
    await unlinkDeletedNotionPage(problemId, oldPage.id);
    state = null;
  }
  const nextProficiency = proficiencyFromNotionProgress(page, updatedPropertyIds);
  if (state?.notion_last_edited_at && state.notes_markdown !== null &&
      (nextProficiency
        ? new Date(state.notion_last_edited_at).getTime() > new Date(page.last_edited_time).getTime()
        : new Date(state.notion_last_edited_at).getTime() >= new Date(page.last_edited_time).getTime())) {
    return 'skipped';
  }
  if (nextProficiency && record.proficiency !== nextProficiency) {
    const { error: proficiencyError } = await supabase.from('leetcode_records')
      .update({ proficiency: nextProficiency })
      .eq('problem_id', problemId)
      .eq('proficiency', record.proficiency);
    if (proficiencyError) throw proficiencyError;
  }
  const markdown = await retrieveNotionMarkdown(page.id);
  if (markdown === null) throw new Error(`Notion notes incomplete for #${problemId}`);
  const fields = readNotionFields(page, markdown);
  const { error } = await supabase.rpc('store_notion_snapshot', {
    p_problem_id: problemId,
    p_page_id: page.id,
    p_url: page.url,
    p_edited_at: page.last_edited_time,
    p_fields: {
      ...('date_solved' in fields ? { date_solved: fields.date_solved } : {}),
      ...('difficulty' in fields ? { difficulty: fields.difficulty } : {}),
      ...('time_complexity' in fields ? { time_complexity: fields.time_complexity } : {}),
      ...('space_complexity' in fields ? { space_complexity: fields.space_complexity } : {}),
      ...('notes_markdown' in fields ? { notes_markdown: fields.notes_markdown } : {}),
    },
  });
  if (error) throw error;
  return 'updated';
}

async function pushClaimed(problemId: number, generation: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: recordData, error: recordError } = await supabase
    .from('leetcode_records').select('*').eq('problem_id', problemId).single();
  if (recordError) throw recordError;
  const record = recordData as LeetcodeRecord;
  const { data: cached, error: cacheError } = await supabase
    .from('notion_problem_sync').select('notion_page_id').eq('problem_id', problemId).single();
  if (cacheError) throw cacheError;
  const schema = await getNotionSchema();
  if (schema.properties['LeetCode ID']?.type !== 'number') {
    throw new Error('Notion data source requires a numeric LeetCode ID property');
  }
  const page = await findNotionPage(problemId, cached.notion_page_id);
  const topics = schema.properties.Topic?.multi_select?.options.map((option) => option.name) ?? [];
  const languages = schema.properties.Language?.multi_select?.options.map((option) => option.name) ?? [];
  const desired = hubOwnedProperties(record, page, topics, languages);
  const changed = page ? changedHubProperties(page, desired) : desired;
  const saved = page
    ? Object.keys(changed).length ? await updateNotionPage(page.id, changed) : page
    : await createNotionPage(desired);
  if (!assertSource(saved)) throw new Error(`Unexpected Notion parent for #${problemId}`);
  await cacheNotionPage(saved, problemId);
  const fingerprint = createHash('sha256').update(JSON.stringify(desired)).digest('hex');
  const { error } = await supabase.rpc('complete_notion_push', {
    p_problem_id: problemId,
    p_generation: generation,
    p_fingerprint: fingerprint,
    p_date_solved: saved.properties['Date Solved']?.date?.start ?? firstVerifiedAcceptedDate(record.solutions),
    p_record_updated_at: record.updated_at,
  });
  if (error) throw error;
}

export async function drainNotionQueue(limit = 3): Promise<{ processed: number; failed: number }> {
  if (!notionConfigured()) return { processed: 0, failed: 0 };
  const supabase = getSupabaseAdmin();
  let processed = 0;
  let failed = 0;
  for (let i = 0; i < limit; i++) {
    const { data, error } = await supabase.rpc('claim_notion_problem');
    if (error) throw error;
    const claim = (data as { problem_id: number; generation: number }[] | null)?.[0];
    if (!claim) break;
    try {
      await pushClaimed(claim.problem_id, claim.generation);
      processed++;
    } catch (cause) {
      failed++;
      const message = cause instanceof Error ? cause.message : 'Unknown Notion sync error';
      console.error(`Notion push failed for #${claim.problem_id}: ${message}`);
      await supabase.rpc('fail_notion_push', {
        p_problem_id: claim.problem_id, p_generation: claim.generation, p_error: message,
      });
    }
  }
  return { processed, failed };
}

export async function enqueueMissedAccepted(): Promise<number> {
  if (!notionConfigured()) return 0;
  const supabase = getSupabaseAdmin();
  const byProblem = new Map<number, { last_pushed_record_at: string | null; needs_push: boolean }>();
  for (let offset = 0; ; offset += 1000) {
    const { data: states, error } = await supabase.from('notion_problem_sync')
      .select('problem_id, last_pushed_record_at, needs_push')
      .order('problem_id').range(offset, offset + 999);
    if (error) throw error;
    for (const state of states ?? []) byProblem.set(state.problem_id, state);
    if (!states || states.length < 1000) break;
  }
  let queued = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('leetcode_records')
      .select('problem_id, solutions, updated_at').order('problem_id').range(offset, offset + 999);
    if (error) throw error;
    for (const record of (data ?? []) as LeetcodeRecord[]) {
      if (!shouldRecoverNotionPush(record, byProblem.get(record.problem_id))) continue;
      const { error: enqueueError } = await supabase.rpc('enqueue_notion_problem', {
        p_problem_id: record.problem_id,
      });
      if (enqueueError) throw enqueueError;
      queued++;
    }
    if (!data || data.length < 1000) break;
  }
  return queued;
}

export async function reconcileNotion(limit = 50): Promise<{ examined: number; updated: number; requeued: number }> {
  if (!notionConfigured()) return { examined: 0, updated: 0, requeued: 0 };
  const pages = await queryNotionPages();
  let examined = 0;
  let updated = 0;
  for (const page of pages) {
    if (!problemIdFromPage(page)) continue;
    examined++;
    try {
      if (updated < limit && await cacheNotionPage(page) === 'updated') updated++;
    } catch (error) {
      console.error(`Notion reconcile failed for page ${page.id}:`, error);
    }
  }
  const activePageIds = new Set(pages.filter((page) => !page.in_trash).map((page) => page.id));
  const supabase = getSupabaseAdmin();
  let requeued = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data: states, error } = await supabase.from('notion_problem_sync')
      .select('problem_id, notion_page_id, needs_push').not('notion_page_id', 'is', null)
      .order('problem_id').range(offset, offset + 999);
    if (error) throw error;
    for (const state of states ?? []) {
      if (state.needs_push || activePageIds.has(state.notion_page_id)) continue;
      try {
        const page = await retrieveNotionPage(state.notion_page_id);
        if (!page.in_trash || !assertSource(page) || problemIdFromPage(page) !== state.problem_id) continue;
        const { error: enqueueError } = await supabase.rpc('enqueue_notion_problem', {
          p_problem_id: state.problem_id,
        });
        if (enqueueError) throw enqueueError;
        requeued++;
      } catch (cause) {
        console.error(`Notion deleted-page check failed for #${state.problem_id}:`, cause);
      }
    }
    if (!states || states.length < 1000) break;
  }
  return { examined, updated, requeued };
}

export async function pullNotionPage(pageId: string, updatedPropertyIds: string[] = []): Promise<'updated' | 'skipped'> {
  const page = await retrieveNotionPage(pageId);
  return cacheNotionPage(page, undefined, updatedPropertyIds);
}
