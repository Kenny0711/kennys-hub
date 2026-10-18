import 'highlight.js/styles/github-dark.css';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { ArrowUpRight, NotebookPen } from 'lucide-react';
import { PAGE_SHELL, SectionHeader } from '@/components/layout/page-header';
import type { NotionProblemSync } from '@/lib/types';

export default function NotionNotes({ notion }: { notion: NotionProblemSync }) {
  const notes = notion.notes_markdown?.trim() ?? '';
  const hasNotes = notes.replace(/^#{1,6}\s*解題心得\s*$/gm, '').trim().length > 0;
  return (
    <section className={`${PAGE_SHELL} pb-16 lg:pb-24`}>
      <div className="flex flex-wrap items-end justify-between gap-5 border-t border-white/15 pt-10">
        <SectionHeader eyebrow="Notes / 03" title="解題心得." />
        {notion.notion_url && (
          <a href={notion.notion_url} target="_blank" rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 text-sm text-zinc-200 transition-colors hover:border-brand hover:text-brand">
            <NotebookPen className="h-4 w-4" />
            Edit notes in Notion
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
      {hasNotes ? (
        <div className="prose prose-invert mt-8 max-w-none break-words border-l-2 border-brand/60 pl-5 text-sm leading-7 text-zinc-300 sm:pl-8
          [&_h1]:font-display [&_h1]:text-3xl [&_h2]:font-display [&_h2]:text-2xl [&_h3]:font-semibold [&_h3]:text-lg
          [&_h1]:text-paper [&_h2]:text-paper [&_h3]:text-paper
          [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5
          [&_li]:mb-1 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/10 [&_pre]:bg-surface [&_pre]:p-4
          [&_code]:font-mono [&_code]:text-xs [&_a]:text-brand [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4">
          <Markdown rehypePlugins={[rehypeHighlight]}>{notes}</Markdown>
        </div>
      ) : (
        <p className="mt-8 border-l-2 border-white/15 pl-5 text-sm text-zinc-500 sm:pl-8">
          尚未撰寫解題心得。
        </p>
      )}
    </section>
  );
}
