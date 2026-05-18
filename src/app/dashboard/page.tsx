import ActivityHeatmap from '@/components/dashboard/activity-heatmap';
import GoalBanner from '@/components/dashboard/goal-banner';
import NeedsReview from '@/components/dashboard/needs-review';
import StatsCards from '@/components/dashboard/stats-cards';
import TagChart from '@/components/dashboard/tag-pie-chart';
import { getDashboardRecords } from '@/lib/leetcode-records';
import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const records = await getDashboardRecords();

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.035] to-transparent">
        <div className="container mx-auto px-6 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            <BarChart3 className="h-3.5 w-3.5" />
            Algorithm Training
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            LeetCode 數據追蹤
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            集中查看解題總覽、難度分布、練習熱力圖、待複習題目與能力目標進度。
          </p>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-6 py-8">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 md:p-6">
          <StatsCards records={records} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 md:p-7 lg:col-span-3">
            <ActivityHeatmap records={records} />
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 md:p-7 lg:col-span-2">
            <TagChart records={records} />
          </div>
        </div>

        <NeedsReview records={records} />

        <Link
          href="/problems"
          className="group flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-6 py-5 transition-colors hover:bg-white/[0.05]"
        >
          <div>
            <p className="text-base font-medium">打開題庫與解題紀錄</p>
            <p className="mt-1 text-sm text-muted-foreground">
              目前累積 {records.length} 題，繼續整理解法、熟練度與複習節奏。
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>

        <GoalBanner />
      </div>
    </div>
  );
}
