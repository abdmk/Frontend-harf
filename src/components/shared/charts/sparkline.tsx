/**
 * خطّ اتجاه صغير لبطاقات الأرقام — زخرفيّ (القيمة مكتوبة في البطاقة)، فيُخفى عن قارئ الشاشة.
 * viewBox ثابت + non-scaling-stroke كي يبقى الخطّ 2px بأي عرض.
 */
export function Sparkline({ values, color = 'var(--chart-1)' }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 26 - ((v - min) / span) * 22] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const last = pts[pts.length - 1]!;
  return (
    <div aria-hidden className="relative h-7 w-full">
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="size-full overflow-visible">
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className="absolute size-2 -translate-1/2 rounded-full ring-2 ring-card"
        style={{ left: `${last[0]}%`, top: `${(last[1] / 28) * 100}%`, background: color }}
      />
    </div>
  );
}
