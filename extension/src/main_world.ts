type MonacoModelLike = {
  getValue?: () => string;
};

type MonacoEditorLike = MonacoModelLike & {
  hasTextFocus?: () => boolean;
  getDomNode?: () => HTMLElement | null;
  getModel?: () => MonacoModelLike | null;
};

type MonacoLike = {
  editor?: {
    getEditors?: () => MonacoEditorLike[];
    getModels?: () => MonacoModelLike[];
  };
};

type SubmissionResult = {
  state?: string;
  status?: string;
  status_msg?: string;
  submission_id?: string | number;
};

type TrackedRequestKind = 'submit' | 'check';

declare global {
  interface Window {
    monaco?: MonacoLike;
  }
}

console.info('[Kenny 的研發日誌] main world loaded', window.location.href);

function scoreCodeSnapshot(code: string): number {
  const normalized = code.replace(/\r\n/g, '\n').trim();
  if (!normalized) return -1;

  let score = normalized.length;
  if (/\bclass\s+Solution\b|^\s*def\s+\w+\s*\(|\bfunction\s+\w+\s*\(/m.test(normalized)) score += 10_000;
  if (/\b(return|for|while|if|else|switch|new|nullptr|null|None|push|pop|append)\b|->/.test(normalized)) {
    score += 2_000;
  }
  if (/^\w{1,3}$/.test(normalized)) score -= 20_000;

  return score;
}

function isVisibleEditor(editor: MonacoEditorLike): boolean {
  const domNode = editor.getDomNode?.();
  if (!domNode) return false;

  const rect = domNode.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function pickBestCode(editors: MonacoEditorLike[], models: MonacoModelLike[]): string {
  const candidates: Array<{ code: string; score: number }> = [];

  for (const editor of editors) {
    const code = editor.getValue?.() ?? editor.getModel?.()?.getValue?.() ?? '';
    const focusBonus = editor.hasTextFocus?.() ? 5_000 : 0;
    const visibleBonus = isVisibleEditor(editor) ? 1_000 : 0;
    candidates.push({ code, score: scoreCodeSnapshot(code) + focusBonus + visibleBonus });
  }

  for (const model of models) {
    const code = model.getValue?.() ?? '';
    candidates.push({ code, score: scoreCodeSnapshot(code) });
  }

  return candidates.sort((a, b) => b.score - a.score)[0]?.code ?? '';
}

// Runs in MAIN world, where LeetCode exposes window.monaco.
document.addEventListener('__lc_get_code__', () => {
  try {
    const m = window.monaco;
    const editors = m?.editor?.getEditors?.() ?? [];
    const models = m?.editor?.getModels?.() ?? [];
    const code = pickBestCode(editors, models);
    document.dispatchEvent(new CustomEvent('__lc_code_result__', { detail: code }));
  } catch {
    document.dispatchEvent(new CustomEvent('__lc_code_result__', { detail: '' }));
  }
});

function urlFromRequest(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof Request) return input.url;
  return input.toString();
}

function isSubmissionCheckUrl(input: RequestInfo | URL): boolean {
  return /\/submissions\/detail\/\d+\/check\/?/.test(urlFromRequest(input));
}

function isSubmissionSubmitUrl(input: RequestInfo | URL): boolean {
  return /\/problems\/[^/]+\/submit\/?/.test(urlFromRequest(input));
}

function asSubmissionResult(value: unknown): SubmissionResult | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  return {
    state: typeof record.state === 'string' ? record.state : undefined,
    status: typeof record.status === 'string' ? record.status : undefined,
    status_msg: typeof record.status_msg === 'string' ? record.status_msg : undefined,
    submission_id:
      typeof record.submission_id === 'string' || typeof record.submission_id === 'number'
        ? record.submission_id
        : undefined,
  };
}

function dispatchSubmissionResult(value: unknown) {
  const result = asSubmissionResult(value);
  if (!result) return;
  console.info('[Kenny 的研發日誌] submission check intercepted', result);
  document.dispatchEvent(new CustomEvent('__lc_submission_result__', { detail: JSON.stringify(result) }));
}

function dispatchSubmissionStarted(value?: unknown) {
  console.info('[Kenny 的研發日誌] submit request intercepted', value ?? '');
  document.dispatchEvent(
    new CustomEvent('__lc_submission_started__', {
      detail: typeof value === 'undefined' ? '' : JSON.stringify(value),
    })
  );
}

const originalFetch = window.fetch.bind(window);
window.fetch = async (...args: Parameters<typeof fetch>) => {
  const response = await originalFetch(...args);
  if (isSubmissionSubmitUrl(args[0])) {
    response
      .clone()
      .json()
      .then(dispatchSubmissionStarted)
      .catch(() => dispatchSubmissionStarted());
  } else if (isSubmissionCheckUrl(args[0])) {
    response
      .clone()
      .json()
      .then(dispatchSubmissionResult)
      .catch(() => {});
  }
  return response;
};

const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;
const trackedXhr = new WeakMap<XMLHttpRequest, TrackedRequestKind>();

const patchedOpen = function (
  this: XMLHttpRequest,
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null
) {
  if (isSubmissionSubmitUrl(url)) trackedXhr.set(this, 'submit');
  else if (isSubmissionCheckUrl(url)) trackedXhr.set(this, 'check');
  return originalOpen.call(this, method, url, async ?? true, username ?? null, password ?? null);
};

XMLHttpRequest.prototype.open = patchedOpen as typeof XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.send = function (
  this: XMLHttpRequest,
  ...args: Parameters<typeof XMLHttpRequest.prototype.send>
) {
  const requestKind = trackedXhr.get(this);
  if (requestKind) {
    this.addEventListener('load', () => {
      try {
        const json = JSON.parse(this.responseText);
        if (requestKind === 'submit') dispatchSubmissionStarted(json);
        else dispatchSubmissionResult(json);
      } catch {}
    });
  }
  return originalSend.apply(this, args);
};

export {};
