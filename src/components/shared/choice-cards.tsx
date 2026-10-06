import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * اختيار بالبطاقات: معاينة مصغّرة فوق اسم الخيار (المظهر، موضع الإشعارات…).
 * مجموعة أزرار راديو حقيقية — الأسهم تتنقّل بينها، والمختار بحدّ العلامة وخلفية فاتحة.
 */
export function ChoiceCards<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string; preview: ReactNode }[];
  className?: string;
}) {
  return (
    <RadioGroupPrimitive.Root
      aria-label={label}
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className={cn('grid grid-cols-3 gap-3 sm:gap-4', className)}
    >
      {options.map((o) => (
        <RadioGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className="group flex flex-col items-center gap-2.5 rounded-xl p-2 transition-colors duration-(--dur-base) outline-none hover:bg-sunken focus-visible:ring-2 focus-visible:ring-ring data-[state=checked]:bg-tint-brand data-[state=checked]:ring-2 data-[state=checked]:ring-primary"
        >
          <span className="block w-full transition-transform duration-(--dur-base) ease-pop group-hover:-translate-y-0.5">
            {o.preview}
          </span>
          <span className="pb-1 text-control text-muted-foreground group-data-[state=checked]:font-medium group-data-[state=checked]:text-primary">
            {o.label}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

/** نافذة مصغّرة: نقاط العنوان وشريطان — بألوان الوضع المطلوب لا الوضع الحالي */
export function MockWindow({
  tone,
  children,
  className,
}: {
  tone: 'light' | 'dark' | 'split';
  children?: ReactNode;
  className?: string;
}) {
  const bar = (t: 'light' | 'dark') => (t === 'light' ? 'bg-mock-light-bar' : 'bg-mock-dark-bar');
  const pane = (t: 'light' | 'dark') => (
    <span className={cn('flex flex-1 flex-col gap-1.5 p-2.5 pt-2', t === 'light' ? 'bg-mock-light' : 'bg-mock-dark')}>
      <span className="flex gap-1">
        <span className="size-1.5 rounded-full bg-mock-dot-1" />
        <span className="size-1.5 rounded-full bg-mock-dot-2" />
        <span className="size-1.5 rounded-full bg-mock-dot-3" />
      </span>
      <span className={cn('mt-1 h-4 rounded-xs', bar(t))} />
      <span className={cn('h-1.5 w-2/3 rounded-full', bar(t))} />
      <span className={cn('h-1.5 w-1/2 rounded-full', bar(t))} />
    </span>
  );
  return (
    <span
      aria-hidden
      className={cn('relative flex aspect-[4/3] overflow-hidden rounded-lg border shadow-soft', className)}
    >
      {tone === 'split' ? (
        <>
          <span className="absolute inset-0 flex">{pane('light')}</span>
          <span className="absolute inset-0 flex [clip-path:inset(0_0_0_50%)]">{pane('dark')}</span>
        </>
      ) : (
        pane(tone)
      )}
      {children}
    </span>
  );
}
