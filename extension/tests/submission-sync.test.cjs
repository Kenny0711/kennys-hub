/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');

const submittedCode = 'class Solution { public: vector<int> solveQueries(vector<int>& nums) { for (int n : nums) { if (n) return nums; } return nums; } };';
const editorCode = 'class Solution { public: vector<int> solveQueries(vector<int>& nums) { return {}; } };';
const source = fs.readFileSync(path.join(__dirname, '../src/content.ts'), 'utf8');
const testHooks = `globalThis.__testHooks = {
  setPendingSubmission(id, code = '') {
    waitingForAccepted = true;
    activeSubmissionId = id;
    pendingSubmittedCode = code;
    pendingSubmittedAt = Date.now();
  },
  processSubmissionResult,
};`;
const compiled = esbuild.transformSync(`${source}\n${testHooks}`, { loader: 'ts', format: 'iife', target: 'chrome110' }).code;

function createHarness(statusDisplay, code = submittedCode) {
  const listeners = new Map();
  const sent = [];
  const addListener = (type, callback) => {
    listeners.set(type, [...(listeners.get(type) ?? []), callback]);
  };
  const document = {
    cookie: 'csrftoken=test-token',
    title: '3488. Closest Equal Element Queries - LeetCode',
    addEventListener: addListener,
    removeEventListener(type, callback) {
      listeners.set(type, (listeners.get(type) ?? []).filter((listener) => listener !== callback));
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event.type) ?? []) listener(event);
    },
    querySelector(selector) {
      return selector.includes('text-title-large') ? { innerText: '3488. Closest Equal Element Queries' } : null;
    },
    querySelectorAll() { return []; },
  };
  class CustomEvent {
    constructor(type, options) {
      this.type = type;
      this.detail = options?.detail;
    }
  }
  addListener('__lc_get_code__', () => document.dispatchEvent(new CustomEvent('__lc_code_result__', { detail: editorCode })));

  let messageListener;
  const fetch = async (_url, options) => {
    const { query, variables } = JSON.parse(options.body);
    let data;
    if (query.includes('questionData')) {
      data = { question: { questionFrontendId: '3488', title: 'Closest Equal Element Queries', difficulty: 'Medium', topicTags: [] } };
    } else if (query.includes('questionSubmissionList')) {
      assert.equal(variables.questionSlug, 'closest-equal-element-queries');
      data = { questionSubmissionList: { submissions: [{ id: '123456', statusDisplay, lang: 'cpp', timestamp: '1792221720' }] } };
    } else if (query.includes('submissionDetails')) {
      assert.equal(variables.submissionId, 123456);
      data = { submissionDetails: code ? { code } : null };
    } else {
      throw new Error('Unexpected GraphQL query');
    }
    return { ok: true, json: async () => ({ data }) };
  };

  const context = vm.createContext({
    document,
    window: {
      location: { href: 'https://leetcode.com/problems/closest-equal-element-queries/', pathname: '/problems/closest-equal-element-queries/' },
      setTimeout, clearTimeout, setInterval, clearInterval,
    },
    chrome: { runtime: {
      onMessage: { addListener(listener) { messageListener = listener; } },
      sendMessage(message, respond) {
        sent.push(message);
        respond({ ok: true, status: 201, body: '' });
      },
    } },
    fetch,
    CustomEvent,
    console: { info() {}, error() {} },
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(compiled, context);
  const extract = () => new Promise((resolve) => messageListener({ type: 'EXTRACT' }, {}, resolve));
  extract.testHooks = context.__testHooks;
  extract.sent = sent;
  return extract;
}

test('manual capture uses the latest Accepted submission code, not the editor', async () => {
  const extract = createHarness('Accepted');
  const result = await extract();
  assert.equal(result.problem_id, 3488);
  assert.equal(result.submission_status, 'Accepted');
  assert.equal(result.code, submittedCode);
  assert.equal(result.language, 'cpp');
  assert.equal(result.submission_id, '123456');
  assert.equal(result.accepted_at, new Date(1792221720 * 1000).toISOString());
});

test('manual capture rejects a latest submission that failed', async () => {
  const extract = createHarness('Runtime Error');
  const result = await extract();
  assert.equal(result.submission_status, 'Runtime Error');
});

test('manual capture fails closed if Accepted code cannot be verified', async () => {
  const extract = createHarness('Accepted', '');
  const result = await extract();
  assert.equal(result.submission_status, 'Verification failed');
});

test('an Accepted result from another submission cannot trigger auto sync', () => {
  const extract = createHarness('Accepted');
  extract.testHooks.setPendingSubmission('123456');
  assert.equal(extract.testHooks.processSubmissionResult({ submission_id: 'other', status_msg: 'Accepted' }), false);
  assert.equal(extract.testHooks.processSubmissionResult({ status_msg: 'Accepted' }), false);
});

test('auto sync sends the verified submitted code after a matching Accepted result', async () => {
  const extract = createHarness('Accepted');
  extract.testHooks.setPendingSubmission('123456', submittedCode);
  assert.equal(extract.testHooks.processSubmissionResult({ submission_id: '123456', status_msg: 'Accepted' }), true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(extract.sent.length, 1);
  assert.equal(extract.sent[0].data.code, submittedCode);
  assert.equal(extract.sent[0].data.submission_status, 'Accepted');
  assert.equal(extract.sent[0].data.submission_id, '123456');
  assert.equal(extract.sent[0].data.accepted_at, new Date(1792221720 * 1000).toISOString());
});

test('auto sync trusts the verified submission ID and code when the editor snapshot differs', async () => {
  const extract = createHarness('Accepted');
  extract.testHooks.setPendingSubmission('123456', editorCode);
  assert.equal(extract.testHooks.processSubmissionResult({ submission_id: '123456', status_msg: 'Accepted' }), true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(extract.sent.length, 1);
  assert.equal(extract.sent[0].data.code, submittedCode);
});
