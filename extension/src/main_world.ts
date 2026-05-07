type MonacoEditorModel = {
  getValue?: () => string;
};

type MonacoLike = {
  editor?: {
    getEditors?: () => MonacoEditorModel[];
    getModels?: () => MonacoEditorModel[];
  };
};

declare global {
  interface Window {
    monaco?: MonacoLike;
  }
}

// Runs in MAIN world, where LeetCode exposes window.monaco.
document.addEventListener('__lc_get_code__', () => {
  try {
    const m = window.monaco;
    const editors = m?.editor?.getEditors?.() ?? [];
    const models = m?.editor?.getModels?.() ?? [];
    const code = editors[0]?.getValue?.() ?? models[0]?.getValue?.() ?? '';
    document.dispatchEvent(new CustomEvent('__lc_code_result__', { detail: code }));
  } catch {
    document.dispatchEvent(new CustomEvent('__lc_code_result__', { detail: '' }));
  }
});

export {};
