import { MOCK_RECORDS } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { LeetcodeRecord } from '@/lib/types';
import StatsCards from '@/components/dashboard/stats-cards';
import ActivityHeatmap from '@/components/dashboard/activity-heatmap';
import TagChart from '@/components/dashboard/tag-pie-chart';
import NeedsReview from '@/components/dashboard/needs-review';
import GoalBanner from '@/components/dashboard/goal-banner';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

async function getDashboardRecords(): Promise<LeetcodeRecord[]> {
  if (USE_MOCK) return MOCK_RECORDS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leetcode_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load dashboard records:', error.message);
    return [];
  }

  return (data as LeetcodeRecord[]) ?? [];
}

function getGreeting(now: Date): string {
  const hour = Number(
    now.toLocaleString('zh-TW', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Taipei',
    })
  );

  if (hour < 12) return '早安，Kenny';
  if (hour < 18) return '午安，Kenny';
  return '晚安，Kenny';
}

export default async function HomePage() {
  const records = await getDashboardRecords();
  const now = new Date();
  const today = now.toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Taipei',
  });
  const greeting = getGreeting(now);

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="container mx-auto flex items-center justify-between gap-8 px-6 py-10">
          <div>
            <p className="mb-2 font-mono text-lg text-zinc-300 md:text-xl">{today}</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{greeting}</h1>
            <p className="mt-2 text-base text-muted-foreground">
              追蹤刷題進度，把每一道題變成你的資產
            </p>
          </div>

          <div className="shrink-0">
            <Image
              src="https://github.com/Kenny0711.png"
              alt="Kenny 的 GitHub 頭貼"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-white/10 bg-zinc-900 object-cover shadow-lg shadow-black/30"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-6 py-8">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6">
          <StatsCards records={records} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-7 lg:col-span-3">
            <ActivityHeatmap records={records} />
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-7 lg:col-span-2">
            <TagChart records={records} />
          </div>
        </div>

        <NeedsReview records={records} />

        <GoalBanner />

        <Link
          href="/problems"
          className="group flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-6 py-5 transition-colors hover:bg-white/[0.05]"
        >
          <div>
            <p className="text-base font-medium">查看完整題庫</p>
            <p className="mt-1 text-sm text-muted-foreground">
              目前共有 {records.length} 題解題記錄，繼續整理你的練習軌跡。
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>
      </div>
    </div>
  );
}
