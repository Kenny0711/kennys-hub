import type { ReactNode } from 'react';

export const PAGE_SHELL = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12';

interface PageHeaderProps {
  meta: ReactNode;
  status?: ReactNode;
  title: string;
  accent: string;
  description: string;
  children?: ReactNode;
}

export function PageHeader({ meta, status, title, accent, description, children }: PageHeaderProps) {
  return (
    <section className="border-b border-white/15">
      <div className={`${PAGE_SHELL} py-7 lg:py-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-5 font-mono text-[11px] uppercase text-zinc-400 sm:text-xs">
          <div>{meta}</div>
          {status ? (
            <div className="flex items-center gap-2 text-brand">
              <span className="h-2 w-2 bg-brand" aria-hidden="true" />
              {status}
            </div>
          ) : null}
        </div>

        <div className="rise grid gap-6 py-10 lg:grid-cols-12 lg:items-end lg:gap-12 lg:py-14">
          <h1 className="font-display text-6xl leading-[0.9] text-paper sm:text-8xl lg:col-span-7 xl:text-[8rem]">
            {title}
            <span className="text-brand">{accent}</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-300 md:text-lg md:leading-8 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            {description}
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-8 grid gap-5 border-b border-white/15 pb-6 lg:grid-cols-12 lg:items-end lg:gap-8">
      <div className="lg:col-span-6">
        <p className="font-mono text-xs font-semibold uppercase text-coral">{eyebrow}</p>
        <h2 className="font-display mt-3 text-5xl leading-none text-paper sm:text-6xl">{title}</h2>
      </div>
      {description ? (
        <p className="max-w-xl text-sm leading-6 text-zinc-400 lg:col-span-4 lg:col-start-7">
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="font-mono text-xs uppercase lg:col-span-2 lg:col-start-11 lg:justify-self-end">
          {action}
        </div>
      ) : null}
    </div>
  );
}
