import type { ReactNode } from 'react';

import { ArrowDownIcon, ArrowUpIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

import { Sparkline } from './charts/sparkline';
import { CountUp } from './count-up';

const ICON_TONE = {
  brand: 'text-primary',
  info: 'text-info-text',
  ok: 'text-ok-text',
  warn: 'text-warn-text',
  ai: 'text-ai-text',
  danger: 'text-dgr-text',
} as const;

/** بطاقة رقم (لوحات الإحصاء والأرباح): عنوان، قيمة كبيرة، وتغيّر نسبي اختياري */
export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  trend,
  trendColor,
  deltaSuffix = '%',
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  /** نسبة التغيّر، مثل 12.4 أو -3 */
  delta?: number;
  hint?: ReactNode;
  icon?: ReactNode;
  /** خطّ اتجاه صغير (12 نقطة) */
  trend?: number[];
  trendColor?: string;
  /** «%» للنسب، و«» للأعداد المطلقة (+312) */
  deltaSuffix?: string;
  /** لون الأيقونة (لمسة بسيطة تميّز البطاقات) — بلا لون تبقى رمادية */
  tone?: keyof typeof ICON_TONE;
  className?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border bg-card p-5', className)}>
      <div className="flex items-center justify-between gap-3 text-meta text-muted-foreground">
        <span>{label}</span>
        {icon && <span className={cn('[&_svg]:size-4.5', tone ? ICON_TONE[tone] : 'text-tertiary')}>{icon}</span>}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span dir="ltr" className="text-2xl font-semibold tracking-tight tabular-nums">
          {typeof value === 'string' || typeof value === 'number' ? <CountUp value={String(value)} /> : value}
        </span>
        {delta !== undefined && (
          <span
            dir="ltr"
            className={cn(
              'inline-flex h-6 items-center gap-0.5 rounded-full px-2 text-caption font-medium',
              up ? 'bg-tint-ok text-ok-text' : 'bg-tint-dgr text-dgr-text',
            )}
          >
            {up ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
            {Math.abs(delta).toLocaleString('en-US')}
            {deltaSuffix}
            <span className="sr-only">{up ? ' ارتفاع' : ' انخفاض'}</span>
          </span>
        )}
      </div>
      {hint && <p className="text-caption text-tertiary">{hint}</p>}
      {trend && <Sparkline values={trend} color={trendColor} />}
    </div>
  );
}
