import ActivityHeatmap from '@/components/dashboard/activity-heatmap';
import GoalBanner from '@/components/dashboard/goal-banner';
import NeedsReview from '@/components/dashboard/needs-review';
import StatsCards from '@/components/dashboard/stats-cards';
import TagChart from '@/components/dashboard/tag-pie-chart';
import { PAGE_SHELL, PageHeader, SectionHeader } from '@/components/layout/page-header';
import { getDashboardRecords } from '@/lib/leetcode-records';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const records = await getDashboardRecords();

  return (
    <div className="min-h-screen">
      <PageHeader
        meta="Kenny's Dev Hub / Algorithm Training"
        status={`${records.length} problems logged`}
        title="Training "
        accent="Log."
        description="集中查看解題總覽、難度分布、練習熱力圖、待複習題目與能力目標進度。"
      />

      <div className={`${PAGE_SHELL} space-y-20 py-16 lg:space-y-24 lg:py-20`}>
        <section>
          <SectionHeader
            eyebrow="Overview / 01"
            title="By the numbers."
            description="總量、熟練度與難度配比，一眼看出目前的練習重心。"
          />
          <StatsCards records={records} />
        </section>

        <section>
          <SectionHeader
            eyebrow="Activity / 02"
            title="Consistency."
            description="每天 Accepted 的新題目，以及最常練到的題型。"
          />
          <div className="grid gap-px border border-white/15 bg-white/15 lg:grid-cols-5">
            <div className="min-w-0 bg-surface p-5 md:p-7 lg:col-span-3">
              <ActivityHeatmap records={records} />
            </div>
            <div className="min-w-0 bg-surface p-5 md:p-7 lg:col-span-2">
              <TagChart records={records} />
            </div>
          </div>
        </section>

        <NeedsReview records={records} />

        <Link
          href="/problems"
          className="group grid gap-4 border-y border-white/15 py-8 transition-colors hover:bg-brand hover:text-brand-foreground sm:grid-cols-[1fr_auto] sm:items-center lg:px-3"
        >
          <div>
            <p className="font-mono text-xs uppercase text-zinc-400 group-hover:text-brand-foreground/70">
              Problem Archive / {records.length} 題
            </p>
            <p className="font-display mt-2 text-4xl leading-none sm:text-5xl">Open the archive.</p>
            <p className="mt-3 text-sm text-zinc-400 group-hover:text-brand-foreground/70">
              繼續整理解法、熟練度與複習節奏。
            </p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center border border-white/20 transition-colors group-hover:border-brand-foreground">
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>

        <GoalBanner />
      </div>
    </div>
  );
}
