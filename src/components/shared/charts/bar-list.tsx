/** قائمة أشرطة أفقية (أعلى الخطوط…) — سلسلة واحدة فلا مفتاح؛ القيمة مكتوبة بجانب كل شريط */
export function BarList({
  items,
  color = 'var(--chart-1)',
}: {
  items: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <ul className="flex flex-col gap-4">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1.5 flex justify-between text-meta">
            <span>{it.label}</span>
            <span dir="ltr" className="font-medium text-muted-foreground">
              {it.value.toLocaleString('en-US')}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sunken">
            <span
              className="block h-full rounded-full"
              style={{ width: `${(it.value / max) * 100}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
