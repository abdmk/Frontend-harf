import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type Series = { label: string; values: number[] };

/** مفتاح السلاسل: مربّع للأعمدة والمساحات، خطّ للخطوط — النص بلون النص لا بلون السلسلة */
export function Legend({
  series,
  kind = 'rect',
}: {
  series: { label: string; color: string }[];
  kind?: 'rect' | 'line';
}) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted-foreground">
      {series.map((s) => (
        <li key={s.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(kind === 'rect' ? 'size-2.5 rounded-[3px]' : 'h-0.5 w-3.5 rounded-full')}
            style={{ background: s.color }}
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/** «عرض كجدول» — كل قيمة في الرسم متاحة بلا مؤشّر ولقارئ الشاشة */
export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="group mt-3 text-caption">
      <summary className="w-fit cursor-pointer text-muted-foreground hover:text-foreground">عرض كجدول</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-start">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b text-tertiary">
              {columns.map((c) => (
                <th key={c} scope="col" className="px-2 py-1.5 text-start font-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-subtle last:border-0">
                {r.map((v, j) => (
                  <td
                    key={j}
                    dir={typeof v === 'number' ? 'ltr' : undefined}
                    className="px-2 py-1.5 text-start [font-variant-numeric:tabular-nums]"
                  >
                    {typeof v === 'number' ? v.toLocaleString('en-US') : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** تلميح الرسم: القيمة أوّلاً ثم اسم السلسلة بمفتاح خطّي */
export function ChartTooltip({
  x,
  y,
  title,
  rows,
}: {
  x: number;
  y: number;
  title: string;
  rows: { label: string; value: string; color: string }[];
}) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 min-w-32 -translate-x-1/2 -translate-y-full rounded-sm border bg-popover px-3 py-2 text-caption shadow-float"
      style={{ left: x, top: y - 8 }}
    >
      <p className="mb-1 text-tertiary">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: r.color }} />
            {r.label}
          </span>
          <strong dir="ltr" className="font-semibold text-foreground">
            {r.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-xl border bg-card p-5 sm:p-6', className)}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-caption text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
