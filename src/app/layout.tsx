import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Code2, Plus, Search, createLucideIcon } from 'lucide-react';

const Github = createLucideIcon('github', [
  [
    'path',
    {
      d: 'M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.78c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z',
      fill: 'currentColor',
      stroke: 'none',
      key: 'github',
    },
  ],
]);

export const metadata: Metadata = {
  title: 'LeetCode Tracker',
  description: '個人 LeetCode 學習追蹤器',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center gap-6 px-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Code2 className="h-5 w-5 text-green-500" />
              LC Tracker
            </Link>

            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/problems"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              題庫
            </Link>

            <div className="ml-auto flex items-center gap-4">
              <div className="relative hidden w-64 items-center md:flex">
                <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="search"
                  placeholder="Search..."
                  aria-label="Search"
                  className="h-9 w-full rounded-md border border-white/10 bg-zinc-950/50 py-1.5 pl-9 pr-12 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 hover:border-white/15 focus:border-white/20 focus:bg-zinc-950/70"
                />
                <span className="pointer-events-none absolute right-2.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="新增"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <Link
                  href="https://github.com/Kenny0711/vibe-leetcode"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="原始碼"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Github className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
