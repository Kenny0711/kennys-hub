'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Braces, Plus, Search, createLucideIcon } from 'lucide-react';

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

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/problems', label: '題庫' },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center gap-6 px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2 text-lg font-bold">
          <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-300/20 bg-blue-400/10 shadow-[0_0_22px_rgba(59,130,246,0.18)] transition group-hover:border-blue-300/40">
            <Braces className="h-4 w-4 text-blue-200" />
          </span>
          <span className="hidden truncate bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent sm:inline">
            Kenny&apos;s Dev Hub
          </span>
          <span className="truncate bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent sm:hidden">
            Dev Hub
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative text-sm transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-2 left-0 right-0 h-px rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.75)]" />
                ) : null}
              </Link>
            );
          })}
        </div>

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
              aria-label="新增紀錄"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
            <Link
              href="https://github.com/Kenny0711"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Kenny's GitHub profile"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
