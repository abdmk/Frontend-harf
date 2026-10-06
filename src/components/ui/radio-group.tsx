import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('grid gap-3', className)} {...props} />;
}

/** دائرة يتّسع حدّها الأحمر عند الاختيار (كما في لوحة التصفية) */
function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'size-5 shrink-0 rounded-full border-[1.5px] border-strong bg-card transition-[border-width,border-color] duration-(--dur-base) ease-pop',
        'data-[state=checked]:border-[5px] data-[state=checked]:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-dgr-500',
        className,
      )}
      {...props}
    />
  );
}

/** خيار بنصّ قابل للنقر بالكامل */
function RadioOption({
  label,
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & { label: React.ReactNode }) {
  return (
    <label className={cn('flex w-fit cursor-pointer items-center gap-3 text-lead', className)}>
      <RadioGroupItem {...props} />
      {label}
    </label>
  );
}

export { RadioGroup, RadioGroupItem, RadioOption };
