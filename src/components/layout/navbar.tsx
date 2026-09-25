'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Braces } from 'lucide-react';
import { PAGE_SHELL } from '@/components/layout/page-header';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/problems', label: 'Problem' },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className={`${PAGE_SHELL} flex h-14 items-center gap-6`}>
        <Link href="/" className="group flex min-w-0 items-center gap-2 text-lg font-bold">
          <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center border border-brand bg-brand text-brand-foreground transition group-hover:border-coral group-hover:bg-coral">
            <Braces className="h-4 w-4" />
          </span>
          <span className="hidden truncate text-paper sm:inline">Kenny&apos;s Hub</span>
          <span className="truncate text-paper sm:hidden">Hub</span>
        </Link>

        <div className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`border-b px-1 py-2 font-mono text-xs uppercase transition-colors ${
                  active
                    ? 'border-brand text-brand'
                    : 'border-transparent text-zinc-400 hover:border-white/50 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
