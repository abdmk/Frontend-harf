'use client';

import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type * as React from 'react';

import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/** خانة اختيار حرف (دليل التصميم 2.4): مربّع ناعم يمتلئ بالأحمر */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer grid size-5 shrink-0 place-items-center rounded-[6px] border-[1.5px] border-strong bg-card text-primary-foreground',
        'transition-[background-color,border-color] duration-(--dur-fast) hover:border-muted-foreground',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-dgr-500',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="animate-pop-in">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
