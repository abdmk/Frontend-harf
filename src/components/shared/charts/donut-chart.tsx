import { chartSeries } from '@/design-system/tokens';

/**
 * حلقة لتوزيع جزء من كلّ (حتى 4 شرائح): فجوة 2px بلون السطح بين الشرائح،
 * الإجمالي في المنتصف، ومفتاح بالقيمة والنسبة — فلا يعتمد القارئ على اللون وحده.
 */
export function DonutChart({
  slices,
  total,
  totalLabel,
  caption,
}: {
  slices: { label: string; value: number }[];
  total?: number;
  totalLabel: string;
  caption: string;
}) {
  const sum = slices.reduce((a, s) => a + s.value, 0) || 1;
  const R = 44;
  const C = 2 * Math.PI * R;
  // بداية كل شريحة = مجموع ما قبلها (محسوبة مسبقاً بلا تغيير متغيّر أثناء الرسم)
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((a, s) => a + (s.value / sum) * C, 0));
  return (
    <figure className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 120 120" className="size-36 shrink-0 -rotate-90" role="img" aria-label={caption}>
        <circle cx={60} cy={60} r={R} fill="none" stroke="var(--chart-grid)" strokeWidth={14} />
        {slices.map((s, i) => {
          const len = (s.value / sum) * C;
          return (
            <circle
              key={s.label}
              cx={60}
              cy={60}
              r={R}
              fill="none"
              stroke={chartSeries[i % chartSeries.length]}
              strokeWidth={14}
              strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
              strokeDashoffset={-starts[i]!}
            />
          );
        })}
        <g className="[transform-origin:60px_60px] rotate-90">
          <text x={60} y={58} textAnchor="middle" className="fill-foreground text-lg font-semibold" direction="ltr">
            {(total ?? sum).toLocaleString('en-US')}
          </text>
          <text x={60} y={74} textAnchor="middle" className="fill-tertiary text-micro">
            {totalLabel}
          </text>
        </g>
      </svg>
      <figcaption className="min-w-40 flex-1">
        <ul className="flex flex-col gap-2 text-meta">
          {slices.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 rounded-[3px]"
                style={{ background: chartSeries[i % chartSeries.length] }}
              />
              <span className="flex-1 text-muted-foreground">{s.label}</span>
              <span dir="ltr" className="font-medium">
                {s.value.toLocaleString('en-US')}
              </span>
              <span dir="ltr" className="w-10 text-end text-caption text-tertiary">
                {Math.round((s.value / sum) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
