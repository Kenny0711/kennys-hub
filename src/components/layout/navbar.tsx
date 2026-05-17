'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Braces, Search } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/problems', label: '題目' },
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
            Kenny&apos;s Hub
          </span>
          <span className="truncate bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent sm:hidden">
            Hub
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
              Ctrl K
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
