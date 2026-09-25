'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { LeetcodeRecord } from '@/lib/types';
import { useMemo } from 'react';

interface Props {
  records: LeetcodeRecord[];
}

// SVG 的 fill/stroke 屬性不支援 CSS 變數，值需與 globals.css 的 --brand / --paper 保持一致
const BAR_COLOR = '#d9ff43';
const LABEL_COLOR = '#f2f0e9';
const MONO_FONT = 'var(--font-app-mono)';

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

function ChipTick({ x = 0, y = 0, payload }: TickProps) {
  if (!payload) return null;
  const tickX = Number(x);
  const tickY = Number(y);
  const text = String(payload.value ?? '');
  const chipW = chipWidth(text);

  return (
    <g>
      <rect
        x={tickX - chipW / 2}
        y={tickY + 6}
        width={chipW}
        height={CHIP_H}
        fill="none"
        stroke={LABEL_COLOR}
        strokeWidth={1}
        strokeOpacity={0.15}
      />
      <text
        x={tickX}
        y={tickY + 6 + CHIP_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
        style={{ fontFamily: MONO_FONT }}
        fill={LABEL_COLOR}
        fillOpacity={0.75}
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
    <div className="flex h-full flex-col space-y-4">
      <h3 className="shrink-0 font-mono text-[11px] uppercase text-zinc-400">
        Tags / {data.length}
      </h3>

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
              tick={(props) => <ChipTick {...props} />}
              height={AXIS_MARGIN}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 0,
                fontSize: 13,
                color: LABEL_COLOR,
              }}
              labelStyle={{ color: '#a1a1aa', marginBottom: 2, fontFamily: MONO_FONT }}
              itemStyle={{ color: LABEL_COLOR }}
              formatter={(value) => [`${value} 題`, '出現次數']}
            />
            <Bar dataKey="value" fill={BAR_COLOR} fillOpacity={0.9}>
              <LabelList
                dataKey="value"
                position="top"
                style={{ fill: LABEL_COLOR, fontSize: 12, fontWeight: 600, fontFamily: MONO_FONT }}
              />
            </Bar>
          </BarChart>
        </div>
      </div>

      {data.length > 8 && (
        <p className="shrink-0 text-right font-mono text-[11px] uppercase text-zinc-500">
          共 {data.length} 個 Tag · 向右滾動查看更多
        </p>
      )}
    </div>
  );
}
