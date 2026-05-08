const webhookInput = document.getElementById('webhook-url') as HTMLInputElement;
const secretInput = document.getElementById('webhook-secret') as HTMLInputElement;
const captureBtn = document.getElementById('capture-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const resultEl = document.getElementById('result') as HTMLDivElement;

// ── 歷史匯入 UI ───────────────────────────────────────────────────────────────
const importBtn = document.getElementById('import-btn') as HTMLButtonElement;
const importProgress = document.getElementById('import-progress') as HTMLDivElement;
const importMsg = document.getElementById('import-msg') as HTMLSpanElement;
const progressBar = document.getElementById('progress-bar') as HTMLDivElement;

interface ImportProgress {
  current: number;
  total: number;
  done: boolean;
}

function setImportUI(msg: string, pct: number, color: string) {
  importProgress.style.display = 'block';
  importMsg.textContent = msg;
  importMsg.style.color = color;
  progressBar.style.width = `${pct}%`;
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

function startProgressPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    chrome.storage.local.get('importProgress', (store) => {
      const prog = store.importProgress as ImportProgress | undefined;
      if (!prog) return;
      const pct = prog.total > 0 ? Math.round((prog.current / prog.total) * 100) : 0;
      if (prog.done) {
        setImportUI(`✓ 匯入完成！共 ${prog.total} 題`, 100, '#22c55e');
        importBtn.disabled = false;
        importBtn.textContent = '📥 匯入 LeetCode 歷史解題';
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      } else {
        setImportUI(`匯入中 ${prog.current}/${prog.total}（${pct}%）`, pct, '#94a3b8');
      }
    });
  }, 400);
}

// 啟動時檢查是否有未完成的匯入
chrome.storage.local.get('importProgress', (store) => {
  const prog = store.importProgress as ImportProgress | undefined;
  if (!prog) return;
  const pct = prog.total > 0 ? Math.round((prog.current / prog.total) * 100) : 0;
  if (prog.done) {
    setImportUI(`✓ 上次匯入完成，共 ${prog.total} 題`, 100, '#22c55e');
  } else {
    setImportUI(`匯入中 ${prog.current}/${prog.total}（${pct}%）`, pct, '#94a3b8');
    importBtn.disabled = true;
    importBtn.textContent = '匯入中...';
    startProgressPolling();
  }
});

importBtn.addEventListener('click', async () => {
  const webhookUrl = webhookInput.value.trim();
  if (!webhookUrl) {
    setImportUI('請先填入 Webhook URL', 0, '#ef4444');
    return;
  }

  // 檢查是否已有進行中的匯入
  const store = await chrome.storage.local.get('importProgress');
  const existing = store.importProgress as ImportProgress | undefined;
  if (existing && !existing.done) {
    startProgressPolling();
    return;
  }

  // 必須在 LeetCode 頁面才能取得已登入的 cookie
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.includes('leetcode.com')) {
    setImportUI('請先在瀏覽器開啟任意 LeetCode 頁面，再點擊此按鈕', 0, '#f59e0b');
    return;
  }

  importBtn.disabled = true;
  importBtn.textContent = '取得題單中...';
  setImportUI('正在從 LeetCode 取得已解題單...', 0, '#94a3b8');

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'FETCH_SOLVED_PROBLEMS' }) as
      { problems: unknown[]; error?: string };

    if (response.error) throw new Error(response.error);
    const problems = response.problems;
    if (!problems?.length) throw new Error('沒有找到 AC 題目，請確認已登入 LeetCode');

    setImportUI(`找到 ${problems.length} 題 AC，開始匯入（可關閉此視窗）...`, 0, '#94a3b8');
    importBtn.textContent = '匯入中...';

    // 委託 background service worker 執行批量匯入（popup 關閉也不中斷）
    chrome.runtime.sendMessage({ type: 'BATCH_IMPORT', problems });
    startProgressPolling();
  } catch (e) {
    setImportUI(`✗ 錯誤：${(e as Error).message}`, 0, '#ef4444');
    importBtn.disabled = false;
    importBtn.textContent = '📥 匯入 LeetCode 歷史解題';
  }
});

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
