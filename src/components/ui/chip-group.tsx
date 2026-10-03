import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import type * as React from 'react';

import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * مجموعة شرائح اختيار (دليل التصميم 2.5 «الشرائح»): حدّ رفيع، والمختارة بلون العلامة الفاتح وحدّها مع ✓ —
 * هادئة بجانب زرّ التطبيق الأحمر.
 * type="single" أو "multiple" كما في Radix ToggleGroup — التنقّل بالأسهم مدعوم.
 */
function ChipGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="chip-group"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

function Chip({
  className,
  children,
  size = 'sm',
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & { size?: 'sm' | 'md' }) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="chip"
      className={cn(
        'group/chip inline-flex flex-none items-center justify-center gap-0 rounded-full border border-border bg-transparent font-normal whitespace-nowrap text-muted-foreground',
        'transition-[background-color,border-color,color,gap] duration-(--dur-base) hover:border-strong hover:text-foreground',
        'data-[state=on]:gap-1.5 data-[state=on]:border-primary data-[state=on]:bg-tint-brand data-[state=on]:font-medium data-[state=on]:text-primary',
        'disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-8 px-4 text-meta' : 'h-10 px-5 text-control',
        className,
      )}
      {...props}
    >
      <CheckIcon className="size-3.5 w-0 scale-50 opacity-0 transition-[width,transform,opacity] duration-(--dur-slow) ease-pop group-data-[state=on]/chip:w-3.5 group-data-[state=on]/chip:scale-100 group-data-[state=on]/chip:opacity-100" />
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { Chip, ChipGroup };
