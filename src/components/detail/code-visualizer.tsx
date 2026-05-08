'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clapperboard, Loader2, RotateCcw } from 'lucide-react';
import {
  VizArray,
  VizHashMap,
  VizResponse,
  VizStep,
  VizStructure,
  VizVariable,
} from '@/lib/visualize-types';

// ── Sub-renderers ──────────────────────────────────────────────────────────────

function ArrayViz({ data }: { data: VizArray }) {
  const highlightMap = new Map(data.highlights.map((h) => [h.index, h]));

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {data.label}
      </p>
      <div className="flex flex-wrap gap-1 items-end">
        {data.values.map((val, i) => {
          const hl = highlightMap.get(i);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className="w-9 h-9 flex items-center justify-center rounded-md text-xs font-mono font-semibold border transition-colors"
                style={
                  hl
                    ? {
                        backgroundColor: `${hl.color}20`,
                        borderColor: `${hl.color}60`,
                        color: hl.color,
                      }
                    : {
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#94a3b8',
                      }
                }
              >
                {val ?? 'ø'}
              </div>
              {/* index */}
              <span className="text-[9px] text-muted-foreground/40 font-mono">{i}</span>
              {/* pointer label */}
              {hl?.label && (
                <span
                  className="text-[10px] font-semibold font-mono"
                  style={{ color: hl.color }}
                >
                  ↑{hl.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HashMapViz({ data }: { data: VizHashMap }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {data.label}
      </p>
      {data.entries.length === 0 ? (
        <p className="text-xs text-muted-foreground/40 italic">（空）</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {data.entries.map((entry, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border transition-colors"
              style={
                entry.highlight
                  ? {
                      backgroundColor: 'rgba(34,197,94,0.1)',
                      borderColor: 'rgba(34,197,94,0.3)',
                      color: '#22c55e',
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: '#94a3b8',
                    }
              }
            >
              {entry.key}
              <span className="text-muted-foreground/40">→</span>
              {entry.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function VariableViz({ data }: { data: VizVariable }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-sky-500/10 border border-sky-500/20 text-sky-300">
      <span className="text-sky-400/70">{data.name}</span>
      <span className="text-muted-foreground/40">=</span>
      {String(data.value)}
    </span>
  );
}

function StepPanel({ step }: { step: VizStep }) {
  const arrays = step.structures.filter((s): s is VizArray => s.type === 'array');
  const hashmaps = step.structures.filter((s): s is VizHashMap => s.type === 'hashmap');
  const variables = step.structures.filter((s): s is VizVariable => s.type === 'variable');

  return (
    <div className="space-y-5">
      {/* Description */}
      <p className="text-sm text-foreground/80 leading-relaxed">{step.description}</p>

      {/* Arrays */}
      {arrays.length > 0 && (
        <div className="space-y-4">
          {arrays.map((a, i) => (
            <ArrayViz key={i} data={a} />
          ))}
        </div>
      )}

      {/* Variables row */}
      {variables.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {variables.map((v, i) => (
            <VariableViz key={i} data={v} />
          ))}
        </div>
      )}

      {/* HashMaps */}
      {hashmaps.length > 0 && (
        <div className="space-y-4">
          {hashmaps.map((h, i) => (
            <HashMapViz key={i} data={h} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  recordId: string;
  solutionIndex: number;
  code: string;
  language: string;
  problemTitle: string;
}

export default function CodeVisualizer({
  recordId,
  solutionIndex,
  code,
  language,
  problemTitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vizData, setVizData] = useState<VizResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const cacheKey = `viz-${recordId}-${solutionIndex}`;

  async function loadViz() {
    // Try localStorage cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setVizData(JSON.parse(cached));
        setCurrentStep(0);
        return;
      }
    } catch {
      // ignore
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, title: problemTitle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      // Cache it
      try {
        localStorage.setItem(cacheKey, JSON.stringify(json));
      } catch {
        // ignore storage errors
      }

      setVizData(json as VizResponse);
      setCurrentStep(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    if (!open && !vizData) {
      loadViz();
    }
    setOpen((v) => !v);
  }

  function handleReset() {
    try { localStorage.removeItem(cacheKey); } catch { /* ignore */ }
    setVizData(null);
    setCurrentStep(0);
    setError(null);
    loadViz();
  }

  const steps = vizData?.steps ?? [];
  const total = steps.length;
  const step = steps[currentStep];

  return (
    <div className="mt-2">
      {/* Toggle button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors bg-violet-500/10 border-violet-500/25 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40"
        >
          <Clapperboard className="w-3.5 h-3.5" />
          {open ? '隱藏視覺化' : '🎬 視覺化'}
        </button>

        {/* Reset cache button (shown when data loaded and panel open) */}
        {open && vizData && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground/50 hover:text-muted-foreground border border-white/6 hover:border-white/15 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            重新產生
          </button>
        )}
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.03] p-4 space-y-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span>AI 正在分析演算法...</span>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  ✗ {error}
                </div>
              )}

              {vizData && step && (
                <>
                  {/* Header: title + step nav */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs font-semibold text-violet-300 uppercase tracking-widest">
                      {vizData.title}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                        disabled={currentStep === 0}
                        className="p-1 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-muted-foreground/70 px-2 font-mono tabular-nums">
                        {currentStep + 1} / {total}
                      </span>
                      <button
                        onClick={() => setCurrentStep((s) => Math.min(total - 1, s + 1))}
                        disabled={currentStep === total - 1}
                        className="p-1 rounded-md border border-white/10 hover:border-white/20 hover:bg-white/5 disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Step content with fade animation */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <StepPanel step={step} />
                    </motion.div>
                  </AnimatePresence>

                  {/* Step dots */}
                  <div className="flex gap-1 justify-center pt-1">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === currentStep ? 16 : 6,
                          height: 6,
                          background:
                            i === currentStep
                              ? '#a78bfa'
                              : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
