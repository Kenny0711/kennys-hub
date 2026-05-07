'use client';
import 'highlight.js/styles/github-dark.css';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Solution } from '@/lib/types';
import { Clock, Database } from 'lucide-react';

interface Props {
  solutions: Solution[];
}

export default function SolutionTabs({ solutions }: Props) {
  if (solutions.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.02] flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground text-sm">尚無解法記錄</p>
        <p className="text-muted-foreground/40 text-xs mt-1">
          透過 Chrome Extension 擷取解題後會自動顯示
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="0">
      <TabsList className="bg-white/5 border border-white/8 mb-5">
        {solutions.map((s, i) => (
          <TabsTrigger
            key={i}
            value={String(i)}
            className="text-xs data-[state=active]:bg-white/10"
          >
            {s.method || `解法 ${i + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>

      {solutions.map((s, i) => (
        <TabsContent key={i} value={String(i)} className="space-y-5 mt-0">
          {/* Complexity badges — language 已移入 code block header，這裡只顯示複雜度 */}
          {(s.time_complexity || s.space_complexity) && (
            <div className="flex flex-wrap gap-2">
              {s.time_complexity && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-white/5 text-muted-foreground border border-white/10">
                  <Clock className="w-3 h-3 shrink-0" />
                  Time: {s.time_complexity}
                </span>
              )}
              {s.space_complexity && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-white/5 text-muted-foreground border border-white/10">
                  <Database className="w-3 h-3 shrink-0" />
                  Space: {s.space_complexity}
                </span>
              )}
            </div>
          )}

          {/* Code block — header 顯示語言 badge */}
          {s.code && (
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                {s.language && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {s.language}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto custom-scrollbar-x [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:p-4 [&_pre]:text-sm [&_code]:!bg-transparent">
                <Markdown rehypePlugins={[rehypeHighlight]}>
                  {`\`\`\`${s.language ?? ''}\n${s.code}\n\`\`\``}
                </Markdown>
              </div>
            </div>
          )}

          {/* Notes */}
          {s.notes && (
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">
                筆記
              </p>
              <div className="text-sm text-foreground/80 leading-relaxed space-y-2 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
                <Markdown rehypePlugins={[rehypeHighlight]}>{s.notes}</Markdown>
              </div>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
