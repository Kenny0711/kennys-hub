import test from 'node:test';
import assert from 'node:assert/strict';
import {
  changedHubProperties, dateInTaipei, firstVerifiedAcceptedDate,
  hubOwnedProperties, languageForNotion, normalizedTopics, problemIdFromPage,
  readNotionFields, uniquePageForProblem, isAcceptedStatus, hasNewVerifiedSubmission,
  notionWebhookPageId, shouldRecoverNotionPush,
} from '../src/lib/notion-sync-core.ts';

const record = {
  id: 'record-1146', problem_id: 1146, title: 'Snapshot Array',
  difficulty: 'Medium', tags: ['Array', 'Hash Table'], lc_slug: 'snapshot-array',
  proficiency: '理解', created_at: '2026-10-18T00:00:00Z', updated_at: '2026-10-18T00:00:00Z',
  solutions: [{ status: 'accepted', accepted_at_verified: true,
    submitted_at: '2026-10-17T16:10:00Z', language: 'cpp', code: 'class Solution {}' }],
};

function page(id = 1146, extras = {}) {
  return {
    id: `page-${id}`, url: `https://notion.so/page-${id}`,
    last_edited_time: '2026-10-18T10:00:00Z',
    parent: { type: 'data_source_id', data_source_id: 'source' },
    properties: {
      Name: { title: [{ plain_text: `${id}. Snapshot Array` }] },
      'LeetCode ID': { number: id },
      'Date Solved': { date: { start: '2026-10-18' } },
      Topic: { multi_select: [{ name: 'Arrays' }, { name: 'Hash Table' }] },
      Language: { multi_select: [{ name: 'C++' }] },
      'LeetCode URL': { url: 'https://leetcode.com/problems/snapshot-array/' },
      'Problem Progress': { select: { name: 'Completed' } },
      'Difficulty Level': { select: { name: 'Hard' } },
      'Time Complexity': { multi_select: [{ name: 'O(log n)' }] },
      'Space Complexity': { multi_select: [{ name: 'O(n + S)' }] },
      Notes: { rich_text: [{ plain_text: 'Remember boundary cases.' }] },
      ...extras,
    },
  };
}

test('numeric ID remains authoritative after title changes', () => {
  const renamed = page(1146, { Name: { title: [{ plain_text: 'My renamed note' }] } });
  assert.equal(problemIdFromPage(renamed), 1146);
});

test('only the exact Accepted verdict is eligible for sync', () => {
  assert.equal(isAcceptedStatus('Accepted'), true);
  assert.equal(isAcceptedStatus(' Not Accepted '), false);
  assert.equal(isAcceptedStatus('Runtime Error'), false);
});

test('fallback requeues only new Accepted records with a submission ID', () => {
  assert.equal(hasNewVerifiedSubmission(record), false);
  assert.equal(hasNewVerifiedSubmission({ ...record, solutions: [
    { ...record.solutions[0], submission_id: '123456' },
  ] }), true);
  assert.equal(hasNewVerifiedSubmission({ ...record, solutions: [
    { ...record.solutions[0], submission_id: '123456', status: 'runtime_error' },
  ] }), false);
});

test('fallback also recovers a newer Accepted on an already-linked problem', () => {
  const verified = { ...record, solutions: [
    { ...record.solutions[0], submission_id: '123456' },
  ] };
  assert.equal(shouldRecoverNotionPush(verified, undefined), true);
  assert.equal(shouldRecoverNotionPush(verified, {
    last_pushed_record_at: '2026-10-17T00:00:00Z', needs_push: false,
  }), true);
  assert.equal(shouldRecoverNotionPush(verified, {
    last_pushed_record_at: record.updated_at, needs_push: false,
  }), false);
  assert.equal(shouldRecoverNotionPush(verified, {
    last_pushed_record_at: '2026-10-17T00:00:00Z', needs_push: true,
  }), false);
});

test('Notion webhook accepts documented page events without a data_source_id in the payload', () => {
  const event = {
    type: 'page.properties_updated',
    entity: { type: 'page', id: '153104cd-477e-809d-8dc4-ff2d96ae3090' },
    data: { parent: { id: '13950b26-c203-4f3b-b97d-93ec06319565', type: 'space' } },
  };
  assert.equal(notionWebhookPageId(event), event.entity.id);
  assert.equal(notionWebhookPageId({ ...event, type: 'page.content_updated' }), event.entity.id);
  assert.equal(notionWebhookPageId({ ...event, type: 'page.created' }), event.entity.id);
  assert.equal(notionWebhookPageId({ ...event, type: 'page.deleted' }), null);
  assert.equal(notionWebhookPageId({ ...event, entity: { type: 'block', id: event.entity.id } }), null);
});

test('historical page matches by exact numeric prefix when ID property is empty', () => {
  assert.equal(problemIdFromPage(page(1146, { 'LeetCode ID': { number: null } })), 1146);
  assert.equal(problemIdFromPage(page(11146, { 'LeetCode ID': { number: null } })), 11146);
});

test('conflicting numeric ID never matches a similar title', () => {
  assert.equal(problemIdFromPage(page(1146, { 'LeetCode ID': { number: 3488 } })), 3488);
});

test('duplicate historical pages are rejected instead of creating another', () => {
  assert.throws(() => uniquePageForProblem(1146, [page(), page()]), /Ambiguous/);
  assert.equal(uniquePageForProblem(1146, [page()])?.id, 'page-1146');
});

test('Accepted timestamps use Asia/Taipei date boundary', () => {
  assert.equal(dateInTaipei('2026-10-17T16:10:00Z'), '2026-10-18');
});

test('first verified Accepted date wins over later submissions and legacy timestamps', () => {
  const solutions = [
    { status: 'accepted', accepted_at_verified: false, submitted_at: '2026-01-01T00:00:00Z' },
    { status: 'accepted', accepted_at_verified: true, submitted_at: '2026-10-19T01:00:00Z' },
    record.solutions[0],
  ];
  assert.equal(firstVerifiedAcceptedDate(solutions), '2026-10-18');
});

test('topics use existing Notion options and omit unknown tags', () => {
  assert.deepEqual(normalizedTopics(['Array', 'Hash Table', 'Unknown', 'array'], ['Arrays', 'Hash Table']),
    ['Arrays', 'Hash Table']);
});

test('language mapping does not invent unsupported values', () => {
  assert.equal(languageForNotion('cpp'), 'C++');
  assert.equal(languageForNotion('go'), null);
});

test('outbound payload contains only Hub-owned fields', () => {
  const props = hubOwnedProperties(record, null, ['Arrays', 'Hash Table'], ['C++']);
  assert.deepEqual(Object.keys(props).sort(),
    ['LeetCode ID', 'Name', 'Problem Progress', 'Date Solved', 'Topic', 'LeetCode URL', 'Language'].sort());
  assert.equal(props['Date Solved'].date.start, '2026-10-18');
});

test('existing historical Date Solved is not overwritten by a later Accepted', () => {
  const props = hubOwnedProperties(record, page(), ['Arrays', 'Hash Table'], ['C++']);
  assert.equal('Date Solved' in props, false);
});

test('unchanged Hub properties produce no Notion update', () => {
  const desired = hubOwnedProperties(record, page(), ['Arrays', 'Hash Table'], ['C++']);
  assert.deepEqual(changedHubProperties(page(), desired), {});
});

test('Hub updates never include manual difficulty, complexity or notes', () => {
  const changed = changedHubProperties(page(1146, { Name: { title: [{ plain_text: 'old' }] } }),
    hubOwnedProperties(record, page(), ['Arrays', 'Hash Table'], ['C++']));
  assert.deepEqual(Object.keys(changed), ['Name']);
});

test('Notion values retain exact complexity and formatted markdown', () => {
  const markdown = '## Idea\n\n- use `lower_bound()`\n\n```cpp\nint i = 0;\n```';
  const fields = readNotionFields(page(), markdown);
  assert.equal(fields.difficulty, 'Hard');
  assert.deepEqual(fields.space_complexity, ['O(n + S)']);
  assert.match(fields.notes_markdown, /```cpp/);
});

test('manual clears are explicit, while missing fields do not erase cache', () => {
  const cleared = readNotionFields(page(1146, {
    'Difficulty Level': { select: null },
    'Time Complexity': { multi_select: [] },
    Notes: { rich_text: [] },
  }), '');
  assert.equal(cleared.difficulty, null);
  assert.deepEqual(cleared.time_complexity, []);
  assert.equal(cleared.notes_markdown, '');
  const partial = readNotionFields(page(1146, { 'Time Complexity': undefined }), null);
  assert.equal('time_complexity' in partial, false);
  assert.equal('notes_markdown' in partial, false);
});
