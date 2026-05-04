import { MOCK_RECORDS } from '@/lib/mock-data';
import StatsCards from '@/components/dashboard/stats-cards';
import ActivityHeatmap from '@/components/dashboard/activity-heatmap';
import TagChart from '@/components/dashboard/tag-pie-chart';
import NeedsReview from '@/components/dashboard/needs-review';
import GoalBanner from '@/components/dashboard/goal-banner';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const records = MOCK_RECORDS;
  const today = new Date().toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="container mx-auto px-6 py-10">
          <p className="text-xs text-muted-foreground mb-1 font-mono">{today}</p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            追蹤刷題進度，把每一道題變成你的資產
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-5">
        {/* Stats — two groups */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
          <StatsCards records={records} />
        </div>

        {/* Heatmap + Bar chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-white/8 bg-white/[0.02] p-6">
            <ActivityHeatmap records={records} />
          </div>
          <div className="lg:col-span-2 rounded-xl border border-white/8 bg-white/[0.02] p-6">
            <TagChart records={records} />
          </div>
        </div>

        {/* Needs Review */}
        <NeedsReview records={records} />

        {/* Quick link to all problems */}
        <Link
          href="/problems"
          className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-6 py-4 hover:bg-white/[0.05] transition-colors group"
        >
          <div>
            <p className="text-sm font-medium">查看所有題目</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {records.length} 題已記錄 · 篩選、搜尋、管理筆記
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Goal banner */}
        <GoalBanner records={records} />
      </div>
    </div>
  );
}
