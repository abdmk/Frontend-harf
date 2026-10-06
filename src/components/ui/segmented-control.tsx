import type { ReactNode } from 'react';

import { useSlidingIndicator } from '@/hooks/use-sliding-indicator';
import { cn } from '@/lib/utils';

type Option<T extends string> = { value: T; label: string; icon?: ReactNode };

/** مبدّل بحبّة بيضاء تنزلق إلى الخيار المختار (مثل «الأكثر شهرة / الأحدث») */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const [box, pill] = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>('[aria-pressed="true"]');
  return (
    <div
      ref={box}
      role="group"
      aria-label={label}
      className={cn(
        'relative isolate flex h-11 shrink-0 rounded-full bg-sunken p-1 shadow-[0_0_0_4px_var(--sunken)] dark:shadow-none',
        className,
      )}
    >
      <span
        ref={pill}
        aria-hidden
        className="absolute inset-y-1 left-0 -z-10 rounded-full bg-paper opacity-0 shadow-soft transition-[transform,width] duration-(--dur-slow) ease-out-quint"
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className="flex items-center gap-1.5 rounded-full px-4 text-control leading-none whitespace-nowrap text-muted-foreground transition-colors duration-(--dur-base) aria-pressed:font-medium aria-pressed:text-paper-foreground [&_svg]:size-4"
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
