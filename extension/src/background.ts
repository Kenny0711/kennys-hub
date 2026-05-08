interface ProblemData {
  problem_id: number;
  title: string;
  difficulty: string;
  tags: string[];
  code: string;
  language: string;
  lc_slug: string;
}

interface TrackerSettings {
  webhookUrl?: string;
  webhookSecret?: string;
}

interface WebhookSyncMessage {
  type: 'WEBHOOK_SYNC';
  data: ProblemData;
}

interface BatchImportMessage {
  type: 'BATCH_IMPORT';
  problems: ProblemData[];
}

interface WebhookSyncResponse {
  ok: boolean;
  status: number;
  body: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  done: boolean;
}

const DEFAULT_WEBHOOK_URL = 'http://localhost:3000/api/webhook';
const DEFAULT_WEBHOOK_SECRET = 'dev-secret';

function readSettings(): Promise<TrackerSettings> {
  return chrome.storage.local.get(['webhookUrl', 'webhookSecret']);
}

async function postToWebhook(data: ProblemData): Promise<WebhookSyncResponse> {
  const { webhookUrl, webhookSecret } = await readSettings();
  const targetUrl = webhookUrl || DEFAULT_WEBHOOK_URL;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret || DEFAULT_WEBHOOK_SECRET,
      },
      body: JSON.stringify(data),
    });
    const body = await res.text().catch(() => '');

    return {
      ok: res.ok,
      status: res.status,
      body,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runBatchImport(problems: ProblemData[]): Promise<void> {
  const { webhookUrl, webhookSecret } = await readSettings();
  const targetUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
  const total = problems.length;

  await chrome.storage.local.set({
    importProgress: { current: 0, total, done: false } satisfies ImportProgress,
  });

  for (let i = 0; i < problems.length; i++) {
    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret || DEFAULT_WEBHOOK_SECRET,
        },
        body: JSON.stringify({ ...problems[i], skip_if_exists: true }),
      });
    } catch {
      // 單題失敗繼續
    }

    await chrome.storage.local.set({
      importProgress: {
        current: i + 1,
        total,
        done: i + 1 === total,
      } satisfies ImportProgress,
    });

    // 限速：每題間隔 80ms，避免打爆 webhook
    await new Promise((r) => setTimeout(r, 80));
  }
}

chrome.runtime.onMessage.addListener(
  (message: WebhookSyncMessage | BatchImportMessage, _sender, sendResponse) => {
    if (message.type === 'WEBHOOK_SYNC') {
      postToWebhook(message.data).then(sendResponse);
      return true;
    }
    if (message.type === 'BATCH_IMPORT') {
      runBatchImport(message.problems).then(() => sendResponse({ ok: true }));
      return true;
    }
    return false;
  }
);

export {};
