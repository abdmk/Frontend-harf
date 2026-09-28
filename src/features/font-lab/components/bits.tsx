import type { ReactNode } from 'react';

import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/cn';

/** سطح أدوات المختبر — بطاقة الموقع نفسها */
export function Panel({ className, children, label }: { className?: string; children: ReactNode; label?: string }) {
  return (
    <section aria-label={label} className={cn('rounded-xl border bg-card', className)}>
      {children}
    </section>
  );
}

/** منزلق بقيمة ظاهرة — للحجم والتباعد وارتفاع السطر */
export function RangeControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = 'px',
  className,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2.5', className)}>
      <div className="flex items-center justify-between gap-3 text-caption">
        <span className="text-muted-foreground">{label}</span>
        <span dir="ltr" className="font-medium tabular-nums">
          {step < 1 ? value.toFixed(1) : value}
          {unit}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => v !== undefined && onChange(v)}
      />
    </div>
  );
}

/** صفّ «مفتاح : قيمة» في جداول المعلومات */
export function InfoRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
          <dt className="text-meta text-muted-foreground">{k}</dt>
          <dd className="min-w-0 text-control break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** شارة حالة صغيرة بألوان النظام */
export function StatusPill({ tone, children }: { tone: 'ok' | 'warn' | 'muted'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-caption font-medium',
        tone === 'ok' && 'bg-tint-ok text-ok-text',
        tone === 'warn' && 'bg-tint-warn text-warn-text',
        tone === 'muted' && 'bg-sunken text-muted-foreground',
      )}
    >
      {children}
    </span>
  );
}
