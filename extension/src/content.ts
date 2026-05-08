interface ProblemData {
  problem_id: number;
  title: string;
  difficulty: string;
  tags: string[];
  code: string;
  language: string;
  lc_slug: string;
}

interface LeetCodeQuestionMeta {
  questionFrontendId?: string;
  title?: string;
  difficulty?: string;
  topicTags?: { name: string }[];
}

interface SubmissionResult {
  state?: string;
  status?: string;
  status_msg?: string;
  submission_id?: string | number;
}

interface WebhookSyncResponse {
  ok: boolean;
  status: number;
  body: string;
}

const SUBMISSION_TIMEOUT_MS = 90_000;
const FAILURE_STATUSES = [
  'Wrong Answer',
  'Time Limit Exceeded',
  'Memory Limit Exceeded',
  'Runtime Error',
  'Compile Error',
  'Compilation Error',
  'Output Limit Exceeded',
];
const JUDGING_STATUSES = ['Pending', 'Judging', 'Running', 'Submitting'];

console.info('[LC Tracker] content script loaded', window.location.href);

let waitingForAccepted = false;
let syncing = false;
let lastSyncedKey = '';
let acceptedSyncCooldownUntil = 0;

function getMonacoCode(): Promise<string> {
  return new Promise((resolve) => {
    const handleResult = (event: Event) => {
      window.clearTimeout(timeoutId);
      resolve((event as CustomEvent<string>).detail || '');
    };
    const timeoutId = window.setTimeout(() => {
      document.removeEventListener('__lc_code_result__', handleResult);
      resolve('');
    }, 2000);

    document.addEventListener('__lc_code_result__', handleResult, { once: true });
    document.dispatchEvent(new CustomEvent('__lc_get_code__'));
  });
}

function parseIdFromUrl(): number {
  const m = window.location.pathname.match(/\/problems\/[^/]+-(\d+)\//);
  return m ? parseInt(m[1], 10) : 0;
}

function parseSlugFromUrl(): string {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match?.[1] ?? '';
}

function detectDifficultyByClass(el: HTMLElement | null): string | null {
  if (!el) return null;
  const cls = el.className;
  if (/easy/i.test(cls)) return 'Easy';
  if (/medium/i.test(cls)) return 'Medium';
  if (/hard/i.test(cls)) return 'Hard';
  return null;
}

function getCodeFallback(): string {
  const ta = document.querySelector<HTMLTextAreaElement>('.monaco-editor textarea');
  return ta?.value ?? '';
}

function normalizeCode(code: string): string {
  return code
    .replace(/^\s*```[\w+-]*\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function normalizeLanguage(raw: string): string {
  const map: Record<string, string> = {
    python3: 'python', python: 'python',
    javascript: 'javascript', typescript: 'typescript',
    java: 'java', 'c++': 'cpp', cpp: 'cpp',
    'c#': 'csharp', csharp: 'csharp',
    go: 'go', golang: 'go', rust: 'rust',
    kotlin: 'kotlin', swift: 'swift',
    ruby: 'ruby', scala: 'scala',
  };
  return map[raw.toLowerCase()] ?? raw.toLowerCase();
}

function inferLanguageFromCode(code: string, fallback: string): string {
  if (
    /\bclass\s+Solution\b/.test(code) &&
    /#include|vector<|std::|public:|private:|long long|unordered_map|unordered_set/.test(code)
  ) {
    return 'cpp';
  }
  if (/^\s*def\s+\w+\(|:\s*$|from typing import|List\[/.test(code)) {
    return 'python';
  }
  return fallback;
}

async function fetchQuestionMeta(titleSlug: string): Promise<LeetCodeQuestionMeta | null> {
  if (!titleSlug) return null;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionFrontendId
              title
              difficulty
              topicTags { name }
            }
          }
        `,
        variables: { titleSlug },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.question ?? null;
  } catch {
    return null;
  }
}

async function extractProblemData(): Promise<ProblemData> {
  const titleSlug = parseSlugFromUrl();
  const meta = await fetchQuestionMeta(titleSlug);

  const titleEl = document.querySelector<HTMLElement>(
    '.text-title-large a, .text-title-large, [data-cy="question-title"], h4[data-cy]'
  );
  const rawTitle = titleEl?.innerText?.trim() ?? document.title.split(' - ')[0].trim();
  const titleMatch = rawTitle.match(/^(\d+)\.\s+(.+)$/);
  const problem_id = titleMatch
    ? parseInt(titleMatch[1], 10)
    : meta?.questionFrontendId
      ? parseInt(meta.questionFrontendId, 10)
      : parseIdFromUrl();
  const title = meta?.title ?? (titleMatch ? titleMatch[2] : rawTitle.replace(/^\d+\.\s*/, ''));

  const diffEl = document.querySelector<HTMLElement>(
    '[class*="text-difficulty-easy"], [class*="text-difficulty-medium"], [class*="text-difficulty-hard"]'
  );
  let difficulty = meta?.difficulty ?? diffEl?.innerText?.trim() ?? '';
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    difficulty = detectDifficultyByClass(diffEl) ?? 'Medium';
  }

  const tagEls = document.querySelectorAll<HTMLElement>('a[href*="/tag/"] div, a[href*="/tag/"] span');
  const tags = meta?.topicTags?.map((tag) => tag.name) ?? Array.from(new Set(
    Array.from(tagEls)
      .map((el) => el.innerText?.trim())
      .filter((t): t is string => Boolean(t) && t.length > 0 && t.length < 50)
  ));

  // Try Monaco API via injected script first, then DOM fallback
  let code = await getMonacoCode();
  if (!code) {
    const codeLines = document.querySelectorAll<HTMLElement>('.view-line');
    code = codeLines.length > 0
      ? Array.from(codeLines).map((el) => el.innerText).join('\n').trim()
      : getCodeFallback();
  }
  code = normalizeCode(code);

  const langSelectors = [
    '[id*="headlessui-listbox-button"] span',
    'button[data-e2e-locator="console-lang-select"] span',
    '.ant-select-selection-item',
    '[class*="SelectContainer"] button',
    '.tab-text',
  ];
  let rawLang = '';
  for (const selector of langSelectors) {
    const el = document.querySelector<HTMLElement>(selector);
    const text = el?.innerText?.trim() ?? '';
    if (text.length > 0 && text.length < 30) {
      rawLang = text;
      break;
    }
  }
  const language = inferLanguageFromCode(code, normalizeLanguage(rawLang || 'python3'));

  return { problem_id, title, difficulty, tags, code, language, lc_slug: titleSlug };
}

function sendWebhookSync(data: ProblemData): Promise<WebhookSyncResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'WEBHOOK_SYNC', data }, (response: WebhookSyncResponse | undefined) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }
      if (!response) {
        reject(new Error('No webhook response from extension background.'));
        return;
      }
      resolve(response);
    });
  });
}

async function syncToWebhook(source: 'manual' | 'auto'): Promise<void> {
  if (syncing) return;

  syncing = true;
  try {
    const data = await extractProblemData();
    const syncKey = `${data.problem_id}:${data.language}:${data.code}`;
    if (source === 'auto' && syncKey === lastSyncedKey) return;

    console.info(`[LC Tracker] ${source} sync sending:`, data.problem_id, data.title);
    const res = await sendWebhookSync(data);

    if (!res.ok) {
      throw new Error(`Webhook failed (${res.status})${res.body ? `: ${res.body}` : ''}`);
    }

    lastSyncedKey = syncKey;
    console.info(`[LC Tracker] ${source} sync completed:`, data.problem_id, data.title);
  } catch (error) {
    console.error('[LC Tracker] Sync failed:', error);
  } finally {
    syncing = false;
  }
}

function getVisiblePageText(): string {
  return document.body?.innerText ?? '';
}

function hasAcceptedResult(): boolean {
  return /\bAccepted\b/.test(getVisiblePageText());
}

function hasTerminalFailureResult(): boolean {
  const pageText = getVisiblePageText();
  return FAILURE_STATUSES.some((status) => pageText.includes(status));
}

function hasJudgingState(): boolean {
  const pageText = getVisiblePageText();
  return JUDGING_STATUSES.some((status) => pageText.includes(status));
}

function normalizeSubmissionStatus(detail: SubmissionResult): string {
  return (detail.status_msg || detail.status || detail.state || '').trim();
}

function parseSubmissionDetail(event: Event): SubmissionResult | null {
  const detail = (event as CustomEvent<string | SubmissionResult>).detail;
  if (!detail) return null;
  if (typeof detail === 'string') {
    try {
      return JSON.parse(detail) as SubmissionResult;
    } catch {
      return {};
    }
  }
  return detail;
}

function startSubmissionWindow(): void {
  waitingForAccepted = true;
  console.info('[LC Tracker] Submission detected; waiting for Accepted result.');
}

function stopWaitingForAccepted(reason?: string): void {
  if (reason) console.info(`[LC Tracker] Stop waiting for submission: ${reason}`);
  waitingForAccepted = false;
}

function handleSubmissionResult(event: Event): void {
  const detail = parseSubmissionDetail(event);
  if (!detail) return;

  const status = normalizeSubmissionStatus(detail);
  if (!status) return;
  console.info(`[LC Tracker] Submission status: ${status}`);

  if (status === 'Accepted') {
    if (Date.now() < acceptedSyncCooldownUntil) return;
    acceptedSyncCooldownUntil = Date.now() + 5000;
    stopWaitingForAccepted('accepted');
    void syncToWebhook('auto');
    return;
  }

  if (FAILURE_STATUSES.includes(status)) {
    stopWaitingForAccepted(status);
  }
}

function isSubmitButton(element: HTMLElement): boolean {
  const button =
    element.closest<HTMLElement>(
    'button, [role="button"], [data-e2e-locator*="submit" i], [data-testid*="submit" i], [aria-label*="submit" i]'
    ) ?? findClickableSubmitAncestor(element);
  if (!button) return false;

  const text = (button.textContent ?? element.textContent ?? '').trim().toLowerCase();
  const locator = button.getAttribute('data-e2e-locator') ?? '';
  const testId = button.getAttribute('data-testid') ?? '';
  const ariaLabel = button.getAttribute('aria-label') ?? '';

  return (
    text === 'submit' ||
    text.includes('submit') ||
    text.includes('提交') ||
    locator.toLowerCase().includes('submit') ||
    testId.toLowerCase().includes('submit') ||
    ariaLabel.toLowerCase().includes('submit')
  );
}

function findClickableSubmitAncestor(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element;
  for (let depth = 0; current && depth < 6; depth++) {
    const text = (current.textContent ?? '').trim().toLowerCase();
    const className = typeof current.className === 'string' ? current.className.toLowerCase() : '';
    if (
      text === 'submit' ||
      text.includes('submit') ||
      text.includes('提交') ||
      className.includes('submit')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function waitForAcceptedSubmission(): void {
  if (waitingForAccepted) return;
  startSubmissionWindow();

  const startedAt = Date.now();
  let sawSubmissionActivity = false;

  const isFreshAcceptedResult = () => {
    if (hasJudgingState()) sawSubmissionActivity = true;
    return hasAcceptedResult() && (sawSubmissionActivity || Date.now() - startedAt > 2500);
  };

  const observer = new MutationObserver(() => {
    if (isFreshAcceptedResult()) {
      cleanup();
      void syncToWebhook('auto');
      return;
    }

    if (hasTerminalFailureResult()) {
      cleanup();
    }
  });

  const intervalId = window.setInterval(() => {
    if (Date.now() - startedAt > SUBMISSION_TIMEOUT_MS) {
      cleanup();
      return;
    }

    if (isFreshAcceptedResult()) {
      cleanup();
      void syncToWebhook('auto');
    } else if (hasTerminalFailureResult()) {
      cleanup();
    }
  }, 1000);

  const cleanup = () => {
    stopWaitingForAccepted();
    observer.disconnect();
    window.clearInterval(intervalId);
  };

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

document.addEventListener(
  'click',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && isSubmitButton(target)) {
      waitForAcceptedSubmission();
    }
  },
  true
);

document.addEventListener(
  'pointerdown',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && isSubmitButton(target)) {
      waitForAcceptedSubmission();
    }
  },
  true
);

document.addEventListener('__lc_submission_started__', () => {
  startSubmissionWindow();
});

document.addEventListener('__lc_submission_result__', handleSubmissionResult);

// ── 歷史匯入：從 /api/problems/all/ 取得所有 AC 題目 ──────────────────────────

interface RawStatPair {
  stat: {
    frontend_question_id: number;
    question__title: string;
    question__title_slug: string;
  };
  difficulty: { level: number };
  status: string;
}

interface FetchSolvedResult {
  problems: ProblemData[];
  error?: string;
}

async function fetchSolvedProblems(): Promise<FetchSolvedResult> {
  try {
    const res = await fetch('https://leetcode.com/api/problems/all/', {
      credentials: 'include',
    });
    if (!res.ok) return { problems: [], error: `HTTP ${res.status}` };

    const json = await res.json();
    const pairs: RawStatPair[] = json.stat_status_pairs ?? [];

    const DIFF = ['', 'Easy', 'Medium', 'Hard'] as const;
    const problems: ProblemData[] = pairs
      .filter((p) => p.status === 'ac')
      .map((p) => ({
        problem_id: p.stat.frontend_question_id,
        title: p.stat.question__title,
        lc_slug: p.stat.question__title_slug,
        difficulty: (DIFF[p.difficulty.level] ?? 'Medium') as ProblemData['difficulty'],
        tags: [],
        code: '',
        language: 'python',
      }));

    return { problems };
  } catch (e) {
    return { problems: [], error: (e as Error).message };
  }
}

// ── Tags 補全：逐題呼叫 GraphQL 取得 topicTags ────────────────────────────────

async function enrichWithTags(): Promise<void> {
  // 立即標記「取得題單中」，讓 popup 顯示正確狀態
  await chrome.storage.local.set({ tagsProgress: { current: 0, total: -1, done: false } });

  // 用已驗證可用的 /api/problems/all/ 取得 AC 題目清單
  const { problems, error } = await fetchSolvedProblems();
  if (error || !problems.length) {
    await chrome.storage.local.set({ tagsProgress: { current: 0, total: 0, done: true } });
    return;
  }

  const total = problems.length;
  await chrome.storage.local.set({ tagsProgress: { current: 0, total, done: false } });

  const enriched: ProblemData[] = [];
  for (let i = 0; i < total; i++) {
    const p = problems[i];
    const meta = await fetchQuestionMeta(p.lc_slug);
    enriched.push({
      ...p,
      tags: meta?.topicTags?.map((t) => t.name) ?? [],
      title: meta?.title ?? p.title,
      difficulty: ((meta?.difficulty ?? p.difficulty) as ProblemData['difficulty']),
    });
    // 進度更新：逐題取 tags 的進度
    await chrome.storage.local.set({ tagsProgress: { current: i + 1, total, done: false } });
    await new Promise((r) => setTimeout(r, 180));
  }

  // 傳給 background 批量 POST
  chrome.runtime.sendMessage({ type: 'BATCH_TAGS', problems: enriched });
}

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (data: ProblemData | FetchSolvedResult | { status: string }) => void) => {
    if (message.type === 'EXTRACT') {
      extractProblemData().then(sendResponse);
    }
    if (message.type === 'FETCH_SOLVED_PROBLEMS') {
      fetchSolvedProblems().then(sendResponse);
    }
    if (message.type === 'FETCH_TAGS') {
      sendResponse({ status: 'started' });
      void enrichWithTags();
    }
    return true;
  }
);
