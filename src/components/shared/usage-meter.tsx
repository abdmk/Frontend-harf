import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { UsageMeter as Meter } from '@/types/domain/user';

/** عدّاد استخدام بشريط: «4 / 5». بلا حدّ ← «غير محدود» */
export function UsageMeter({
  label,
  icon,
  meter,
  className,
}: {
  label: string;
  icon?: ReactNode;
  meter: Meter;
  className?: string;
}) {
  const pct = meter.limit ? Math.min(100, Math.round((meter.used / meter.limit) * 100)) : 100;
  const full = meter.limit !== null && meter.used >= meter.limit;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-3 text-control">
        <span className="flex items-center gap-2 [&_svg]:size-4">
          {icon}
          {label}
        </span>
        <span dir="ltr" className={cn('text-meta', full ? 'font-medium text-warn-text' : 'text-muted-foreground')}>
          {meter.limit === null ? 'غير محدود' : `${meter.used} / ${meter.limit}`}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={meter.limit ?? meter.used}
        aria-valuenow={meter.used}
        className="h-1.5 overflow-hidden rounded-full bg-sunken"
      >
        <span
          className={cn(
            'block h-full rounded-full transition-[width] duration-(--dur-xslow) ease-out-quint',
            full ? 'bg-warn-500' : meter.limit === null ? 'bg-ok-500' : 'bg-primary-fill',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
