'use client';

import { useState } from 'react';

import { ChartTooltip, DataTable } from './chart-frame';
import { niceTicks } from './scale';
import { useWidth } from './use-width';

const H = 200;
const PAD = { top: 16, bottom: 26, start: 44 };

/**
 * خطّ بمساحة خفيفة (سلسلة واحدة): خطّ 2px، مساحة بنسبة 10%، خطّ عمودي يتبع المؤشّر
 * ويلتقط أقرب نقطة، وتسمية القمّة فقط — لا رقم على كل نقطة.
 */
export function AreaChart({
  labels,
  values,
  label,
  color = 'var(--chart-2)',
  caption,
  tickEvery = 7,
}: {
  labels: string[];
  values: number[];
  label: string;
  color?: string;
  caption: string;
  tickEvery?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...values), 3);
  const top = ticks[ticks.length - 1]!;
  const plotW = width - PAD.start - 8;
  const x = (i: number) => PAD.start + (i / Math.max(1, values.length - 1)) * plotW;
  const y = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / top);
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const peak = values.indexOf(Math.max(...values));

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - PAD.start) / plotW) * (values.length - 1));
    setHover(Math.min(values.length - 1, Math.max(0, i)));
  }

  return (
    <div>
      <div ref={ref} className="relative">
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={caption}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setHover((h) => Math.min(values.length - 1, (h ?? -1) + 1));
            if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? values.length) - 1));
          }}
          onBlur={() => setHover(null)}
          className="block overflow-visible outline-none"
        >
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
                {t.toLocaleString('en-US')}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % tickEvery === 0 ? (
              <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-micro">
                {l}
              </text>
            ) : null,
          )}
          <path d={area} fill={color} opacity={0.1} />
          <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(peak)} cy={y(values[peak]!)} r={4} fill={color} stroke="var(--card)" strokeWidth={2} />
          <text
            x={x(peak)}
            y={y(values[peak]!) - 10}
            textAnchor="middle"
            className="fill-foreground text-micro font-semibold"
            direction="ltr"
          >
            {values[peak]!.toLocaleString('en-US')}
          </text>
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="var(--strong)" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(values[hover]!)} r={4} fill={color} stroke="var(--card)" strokeWidth={2} />
            </g>
          )}
        </svg>
        {hover !== null && (
          <ChartTooltip
            x={x(hover)}
            y={y(values[hover]!)}
            title={labels[hover]!}
            rows={[{ label, value: values[hover]!.toLocaleString('en-US'), color }]}
          />
        )}
      </div>
      <DataTable caption={caption} columns={['اليوم', label]} rows={labels.map((l, i) => [l, values[i]!])} />
    </div>
  );
}
