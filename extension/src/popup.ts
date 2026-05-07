const webhookInput = document.getElementById('webhook-url') as HTMLInputElement;
const secretInput = document.getElementById('webhook-secret') as HTMLInputElement;
const captureBtn = document.getElementById('capture-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const resultEl = document.getElementById('result') as HTMLDivElement;

// Restore saved settings
chrome.storage.local.get(['webhookUrl', 'webhookSecret'], ({ webhookUrl, webhookSecret }) => {
  if (webhookUrl) webhookInput.value = webhookUrl as string;
  if (webhookSecret) secretInput.value = webhookSecret as string;
});

webhookInput.addEventListener('change', () => {
  chrome.storage.local.set({ webhookUrl: webhookInput.value.trim() });
});
secretInput.addEventListener('change', () => {
  chrome.storage.local.set({ webhookSecret: secretInput.value.trim() });
});
webhookInput.addEventListener('input', () => {
  chrome.storage.local.set({ webhookUrl: webhookInput.value.trim() });
});
secretInput.addEventListener('input', () => {
  chrome.storage.local.set({ webhookSecret: secretInput.value.trim() });
});

// Detect if we're on a LeetCode problem page
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab?.url?.includes('leetcode.com/problems/')) {
    statusEl.textContent = '✓ 已偵測到 LeetCode 題目頁面';
    statusEl.style.color = '#22c55e';
    captureBtn.disabled = false;
  } else {
    statusEl.textContent = '請前往 LeetCode 題目頁面';
    statusEl.style.color = '#f59e0b';
  }
});

captureBtn.addEventListener('click', () => {
  const webhookUrl = webhookInput.value.trim();
  const secret = secretInput.value.trim();

  if (!webhookUrl) {
    resultEl.textContent = '請先填入 Webhook URL';
    resultEl.style.color = '#ef4444';
    return;
  }

  captureBtn.disabled = true;
  captureBtn.textContent = '擷取中...';
  resultEl.textContent = '正在傳送...';
  resultEl.style.color = '#94a3b8';

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab.id) return;

    try {
      const data = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT' });

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (secret) headers['x-webhook-secret'] = secret;

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        resultEl.textContent = `✓ 已送出：#${data.problem_id} ${data.title}`;
        resultEl.style.color = '#22c55e';
      } else {
        const text = await res.text().catch(() => '');
        resultEl.textContent = `✗ 失敗 (${res.status})${text ? '：' + text : ''}`;
        resultEl.style.color = '#ef4444';
      }
    } catch (e) {
      resultEl.textContent = `✗ 錯誤：${(e as Error).message}`;
      resultEl.style.color = '#ef4444';
    } finally {
      captureBtn.disabled = false;
      captureBtn.textContent = '擷取並送出';
    }
  });
});
