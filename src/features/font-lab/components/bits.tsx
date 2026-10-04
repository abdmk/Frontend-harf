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

/**
 * رسم محرف من الملف مباشرة (مسار fontkit) — دقيق ومستقلّ عن محرّك التشكيل،
 * فيُرى البديل نفسه لا ما يختاره المتصفّح. size: ارتفاع الرسم بالبكسل.
 */
export function GlyphShape({
  font,
  gid,
  size = 48,
  label,
  className,
}: {
  font: { kit: unknown; metrics: { ascent: number; descent: number }; unitsPerEm: number };
  gid: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const g = (
    font.kit as {
      getGlyph(id: number): { advanceWidth: number; bbox: { minX: number; maxX: number }; path: { toSVG(): string } };
    }
  ).getGlyph(gid);
  const { ascent, descent } = font.metrics;
  const finite = Number.isFinite(g.bbox.minX);
  // العلامات بلا عرض: نأخذ حدود الرسم نفسه
  const x0 = finite ? Math.min(0, g.bbox.minX) : 0;
  const x1 = finite ? Math.max(g.advanceWidth, g.bbox.maxX) : g.advanceWidth || font.unitsPerEm / 2;
  const pad = font.unitsPerEm * 0.04;
  const w = x1 - x0 + pad * 2;
  const h = ascent - descent;
  return (
    <svg
      viewBox={`${x0 - pad} ${-ascent} ${w} ${h}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('shrink-0', className)}
      style={{ height: size, width: (size * w) / h }}
    >
      <path d={g.path.toSVG()} transform="scale(1,-1)" className="fill-current" />
    </svg>
  );
}
