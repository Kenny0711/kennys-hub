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

interface WebhookSyncResponse {
  ok: boolean;
  status: number;
  body: string;
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

chrome.runtime.onMessage.addListener((message: WebhookSyncMessage, _sender, sendResponse) => {
  if (message.type !== 'WEBHOOK_SYNC') return false;

  postToWebhook(message.data).then(sendResponse);
  return true;
});

export {};
