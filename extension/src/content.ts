interface ProblemData {
  problem_id: number;
  title: string;
  difficulty: string;
  tags: string[];
  code: string;
  language: string;
  lc_slug: string;  // 直接從 URL 擷取，最準確
}

function extractProblemData(): ProblemData {
  // ── lc_slug：從 URL 直接取，最可靠 ──────────────────────────
  // URL 格式：https://leetcode.com/problems/two-sum/description/
  const slugMatch = window.location.pathname.match(/\/problems\/([^/]+)/);
  const lc_slug = slugMatch ? slugMatch[1] : '';

  // ── Title ────────────────────────────────────────────────────
  const titleEl = document.querySelector<HTMLElement>(
    '.text-title-large a, .text-title-large, [data-cy="question-title"], h4[data-cy]'
  );
  const rawTitle = titleEl?.innerText?.trim() ?? document.title.split(' - ')[0].trim();

  // "1. Two Sum" → problem_id=1, title="Two Sum"
  const titleMatch = rawTitle.match(/^(\d+)\.\s+(.+)$/);
  const problem_id = titleMatch ? parseInt(titleMatch[1], 10) : parseIdFromSlug(lc_slug);
  const title = titleMatch ? titleMatch[2] : rawTitle.replace(/^\d+\.\s*/, '');

  // ── Difficulty ───────────────────────────────────────────────
  const diffEl = document.querySelector<HTMLElement>(
    '[class*="text-difficulty-easy"], [class*="text-difficulty-medium"], [class*="text-difficulty-hard"]'
  );
  let difficulty = diffEl?.innerText?.trim() ?? '';
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    difficulty = detectDifficultyByClass(diffEl) ?? 'Medium';
  }

  // ── Tags ─────────────────────────────────────────────────────
  const tagEls = document.querySelectorAll<HTMLElement>(
    'a[href*="/tag/"] div, a[href*="/tag/"] span'
  );
  const tags = Array.from(new Set(
    Array.from(tagEls)
      .map((el) => el.innerText?.trim())
      .filter((t): t is string => Boolean(t) && t.length > 0 && t.length < 50)
  ));

  // ── Code from Monaco ─────────────────────────────────────────
  const codeLines = document.querySelectorAll<HTMLElement>('.view-line');
  const code =
    codeLines.length > 0
      ? Array.from(codeLines).map((el) => el.innerText).join('\n').trim()
      : getCodeFallback();

  // ── Language ─────────────────────────────────────────────────
  // LeetCode 新版 UI：語言顯示在 Editor 右上角的按鈕
  const langBtn = document.querySelector<HTMLElement>(
    // 新版 React dropwdown
    '[id*="headlessui-listbox-button"] span,' +
    // Monaco 右上角 select
    '.ant-select-selection-item,' +
    // 另一個常見 selector
    'button[data-e2e-locator="console-lang-select"] span,' +
    // tab bar 上的語言標籤
    '.tab-text'
  );
  const language = normalizeLanguage(langBtn?.innerText?.trim() ?? 'python3');

  return { problem_id, title, difficulty, tags, code, language, lc_slug };
}

// 從 slug 推斷 problem_id（例如 "two-sum" → 無法直接推，回傳 0）
function parseIdFromSlug(_slug: string): number {
  return 0;
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

function normalizeLanguage(raw: string): string {
  const map: Record<string, string> = {
    python3: 'python',
    python: 'python',
    javascript: 'javascript',
    js: 'javascript',
    typescript: 'typescript',
    ts: 'typescript',
    java: 'java',
    'c++': 'cpp',
    cpp: 'cpp',
    'c#': 'csharp',
    csharp: 'csharp',
    go: 'go',
    golang: 'go',
    rust: 'rust',
    kotlin: 'kotlin',
    swift: 'swift',
    ruby: 'ruby',
    scala: 'scala',
    php: 'php',
    'r': 'r',
    mysql: 'sql',
    postgresql: 'sql',
  };
  return map[raw.toLowerCase()] ?? raw.toLowerCase();
}

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (data: ProblemData) => void) => {
    if (message.type === 'EXTRACT') {
      sendResponse(extractProblemData());
    }
    return true;
  }
);
