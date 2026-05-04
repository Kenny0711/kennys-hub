interface ProblemData {
  problem_id: number;
  title: string;
  difficulty: string;
  tags: string[];
  code: string;
  language: string;
}

function extractProblemData(): ProblemData {
  // Title element — try multiple selectors across LeetCode UI versions
  const titleEl = document.querySelector<HTMLElement>(
    '.text-title-large a, .text-title-large, [data-cy="question-title"], h4[data-cy]'
  );
  const rawTitle = titleEl?.innerText?.trim() ?? document.title.split(' - ')[0].trim();

  // Parse "1. Two Sum" format → id + clean title
  const titleMatch = rawTitle.match(/^(\d+)\.\s+(.+)$/);
  const problem_id = titleMatch ? parseInt(titleMatch[1], 10) : parseIdFromUrl();
  const title = titleMatch ? titleMatch[2] : rawTitle.replace(/^\d+\.\s*/, '');

  // Difficulty
  const diffEl = document.querySelector<HTMLElement>(
    '[class*="text-difficulty-easy"], [class*="text-difficulty-medium"], [class*="text-difficulty-hard"]'
  );
  let difficulty = diffEl?.innerText?.trim() ?? '';
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    difficulty = detectDifficultyByClass(diffEl) ?? 'Medium';
  }

  // Tags (only visible ones — user may need to expand the Topics section)
  const tagEls = document.querySelectorAll<HTMLElement>(
    'a[href*="/tag/"] div, a[href*="/tag/"] span'
  );
  const tags = Array.from(new Set(
    Array.from(tagEls)
      .map((el) => el.innerText?.trim())
      .filter((t): t is string => Boolean(t) && t.length > 0 && t.length < 50)
  ));

  // Code from Monaco editor
  const codeLines = document.querySelectorAll<HTMLElement>('.view-line');
  const code =
    codeLines.length > 0
      ? Array.from(codeLines).map((el) => el.innerText).join('\n').trim()
      : getCodeFallback();

  // Language from the dropdown button label
  const langBtn = document.querySelector<HTMLElement>(
    'button[id*="headlessui-listbox-button"] span, .ant-select-selection-item'
  );
  const language = normalizeLanguage(langBtn?.innerText?.trim() ?? 'python3');

  return { problem_id, title, difficulty, tags, code, language };
}

function parseIdFromUrl(): number {
  const m = window.location.pathname.match(/\/problems\/[^/]+-(\d+)\//);
  return m ? parseInt(m[1], 10) : 0;
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
    typescript: 'typescript',
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
