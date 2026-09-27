'use client';

import { useState } from 'react';

import { chartSeries } from '@/design-system/tokens';

import { ChartTooltip, DataTable, Legend, type Series } from './chart-frame';
import { niceTicks } from './scale';
import { useWidth } from './use-width';

const H = 240;
const PAD = { top: 12, bottom: 28, start: 52 };

/**
 * أعمدة مجمّعة (حتى 4 سلاسل بترتيب ألوان ثابت): أعمدة ≤24px بحافة علوية مدوّرة 4px،
 * فجوة 2px بين الأعمدة المتلاصقة، شبكة شعرية، تلميح لكل مجموعة، وجدول بديل.
 */
export function ColumnChart({
  categories,
  series,
  unit = 'number',
  caption,
}: {
  categories: string[];
  series: Series[];
  /** وحدة القيم — قيمة لا دالّة كي تُمرَّر من مكوّن خادم */
  unit?: 'number' | 'usd';
  caption: string;
}) {
  const format = (n: number) => (unit === 'usd' ? '$' : '') + n.toLocaleString('en-US');
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1]!;
  const plotW = width - PAD.start;
  const band = plotW / categories.length;
  const barW = Math.min(24, (band * 0.6 - 2 * (series.length - 1)) / series.length);
  const groupW = barW * series.length + 2 * (series.length - 1);
  const y = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / top);
  const colors = series.map((_, i) => chartSeries[i % chartSeries.length]!);

  return (
    <div>
      <div ref={ref} className="relative" onPointerLeave={() => setHover(null)}>
        <svg width={width} height={H} role="img" aria-label={caption} className="block overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.start} x2={width} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
              <text
                x={PAD.start - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-tertiary text-micro"
                direction="ltr"
              >
                {format(t)}
              </text>
            </g>
          ))}
          {categories.map((c, ci) => {
            const gx = PAD.start + ci * band + (band - groupW) / 2;
            return (
              <g key={c} opacity={hover === null || hover === ci ? 1 : 0.55} className="transition-opacity">
                {series.map((s, si) => {
                  const v = s.values[ci] ?? 0;
                  const x = gx + si * (barW + 2);
                  const h = Math.max(0, y(0) - y(v));
                  const r = Math.min(4, h, barW / 2);
                  // حافة علوية مدوّرة، ومربّعة عند خطّ الأساس
                  const d = `M${x},${y(0)} V${y(v) + r} Q${x},${y(v)} ${x + r},${y(v)} H${x + barW - r} Q${x + barW},${y(v)} ${x + barW},${y(v) + r} V${y(0)} Z`;
                  return <path key={s.label} d={d} fill={colors[si]} />;
                })}
                <text
                  x={PAD.start + ci * band + band / 2}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-caption"
                >
                  {c}
                </text>
                <rect
                  x={PAD.start + ci * band}
                  y={0}
                  width={band}
                  height={H}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${c}: ${series.map((s) => `${s.label} ${format(s.values[ci] ?? 0)}`).join('، ')}`}
                  onPointerEnter={() => setHover(ci)}
                  onFocus={() => setHover(ci)}
                  onBlur={() => setHover(null)}
                  className="outline-none"
                />
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <ChartTooltip
            x={PAD.start + hover * band + band / 2}
            y={y(Math.max(...series.map((s) => s.values[hover] ?? 0)))}
            title={categories[hover]!}
            rows={series.map((s, i) => ({ label: s.label, value: format(s.values[hover] ?? 0), color: colors[i]! }))}
          />
        )}
      </div>
      {series.length > 1 && (
        <div className="mt-3">
          <Legend series={series.map((s, i) => ({ label: s.label, color: colors[i]! }))} />
        </div>
      )}
      <DataTable
        caption={caption}
        columns={['', ...series.map((s) => s.label)]}
        rows={categories.map((c, i) => [c, ...series.map((s) => s.values[i] ?? 0)])}
      />
    </div>
  );
}
