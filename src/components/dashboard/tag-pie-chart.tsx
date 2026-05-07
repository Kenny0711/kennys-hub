'use client';
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, LabelList } from 'recharts';
import { LeetcodeRecord } from '@/lib/types';
import { useMemo } from 'react';

interface Props {
  records: LeetcodeRecord[];
}

const COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#a78bfa', '#34d399', '#fbbf24', '#f87171',
  '#38bdf8', '#86efac', '#fcd34d', '#fb923c',
];

const CHART_H = 200; // bar 區高度（不含 X 軸 chip）
const CHIP_H = 22;   // chip 框高度
const AXIS_MARGIN = CHIP_H + 8; // X 軸留給 chip 的空間

function chipWidth(text: string) {
  return Math.max(text.length * 6.4 + 18, 44);
}

interface TickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string; index?: number };
  index?: number;
}

function ChipTick({ x = 0, y = 0, payload, index = 0 }: TickProps) {
  if (!payload) return null;
  const tickX = Number(x);
  const tickY = Number(y);
  const colorIndex = payload.index ?? index;
  const color = COLORS[colorIndex % COLORS.length];
  const text = String(payload.value ?? '');
  const chipW = Math.max(text.length * 6.4 + 18, 44);

  return (
    <g>
      <rect
        x={tickX - chipW / 2}
        y={tickY + 6}
        width={chipW}
        height={CHIP_H}
        rx={5}
        fill={color}
        fillOpacity={0.13}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.45}
      />
      <text
        x={tickX}
        y={tickY + 6 + CHIP_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={600}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
}

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

  // 每個 bar 的寬度至少要能容納其 chip 標籤，加 12px 左右間距
  const barSlot = useMemo(() => {
    if (data.length === 0) return 60;
    const maxChip = Math.max(...data.map((d) => chipWidth(d.name)));
    return Math.max(maxChip + 12, 60);
  }, [data]);

  const chartW = Math.max(data.length * barSlot + 24, 300);
  const totalH = CHART_H + AXIS_MARGIN;

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
        Tags
      </h2>

      {/* 橫向捲動容器 */}
      <div className="overflow-x-auto custom-scrollbar-x pb-1">
        <div style={{ width: chartW, height: totalH }}>
          <BarChart
            width={chartW}
            height={totalH}
            data={data}
            margin={{ top: 8, right: 12, left: 12, bottom: AXIS_MARGIN }}
            barSize={28}
          >
            <YAxis
              hide
              domain={[0, (max: number) => max + 1]}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={(props) => <ChipTick {...props} index={props.index} />}
              height={AXIS_MARGIN}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 4 }}
              contentStyle={{
                background: '#1c1c1c',
                border: '1px solid #3a3a3a',
                borderRadius: 8,
                fontSize: 12,
                color: '#f1f5f9',
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: 2 }}
              itemStyle={{ color: '#f1f5f9' }}
              formatter={(value) => [`${value} 題`, '出現次數']}
            />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                style={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 700 }}
              />
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      {data.length > 8 && (
        <p className="text-[10px] text-muted-foreground/50 text-right shrink-0">
          共 {data.length} 個 Tag · 向右滾動查看更多
        </p>
      )}
    </div>
  );
}
