'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LeetcodeRecord } from '@/lib/types';
import { useMemo } from 'react';

interface Props {
  records: LeetcodeRecord[];
}

const COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#a78bfa', '#34d399', '#fbbf24', '#f87171',
];

const BAR_HEIGHT = 32;
const MAX_VISIBLE = 7;

export default function TagChart({ records }: Props) {
  const data = useMemo(() => {
    const tagCount: Record<string, number> = {};
    records.forEach((r) =>
      r.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] ?? 0) + 1;
      })
    );
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [records]);

  const maxVal = data[0]?.value ?? 1;
  const chartHeight = data.length * BAR_HEIGHT;
  const containerMaxH = MAX_VISIBLE * BAR_HEIGHT;

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">Tags</h2>

      <div
        className="overflow-y-auto pr-1 custom-scrollbar"
        style={{ maxHeight: containerMaxH }}
      >
        <div style={{ height: chartHeight, minHeight: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 2, right: 36, left: 0, bottom: 2 }}
              barSize={14}
            >
              <XAxis type="number" domain={[0, maxVal + 1]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11, fill: '#888', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#eee',
                }}
                formatter={(value) => [`${value} 題`, '出現次數']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.length > MAX_VISIBLE && (
        <p className="text-[10px] text-muted-foreground/50 text-right shrink-0">
          共 {data.length} 個 Tag，向下滾動查看更多
        </p>
      )}
    </div>
  );
}
