import Link from 'next/link';

export function ProblemsNavigation({ active }: { active: 'archive' | 'lists' }) {
  return (
    <nav aria-label="Problems 分類" className="flex border-t border-white/15 font-mono text-xs uppercase sm:text-sm">
      {[
        { href: '/problems', label: '題庫', sublabel: 'Archive', id: 'archive' },
        { href: '/problems/lists', label: '題單', sublabel: 'Lists', id: 'lists' },
      ].map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={active === item.id ? 'page' : undefined}
          className={`flex min-w-0 flex-1 items-center justify-between gap-3 border-b-2 px-4 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-brand sm:flex-none sm:min-w-48 ${active === item.id
            ? 'border-brand bg-surface text-brand'
            : 'border-transparent text-zinc-400 hover:bg-surface hover:text-paper'}`}
        >
          <span>{item.label}</span>
          <span className="hidden text-[10px] text-zinc-500 sm:inline">{item.sublabel}</span>
        </Link>
      ))}
    </nav>
  );
}
