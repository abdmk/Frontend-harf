import { Switch as SwitchPrimitive } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/cn';

/** المفتاح (دليل التصميم 2.4): أخضر عند التشغيل، والمقبض ينزلق بحركة pop — يدعم RTL */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-strong p-0.75 transition-colors duration-(--dur-base)',
        'disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-ok-500',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block size-5.5 rounded-full bg-paper shadow-soft transition-transform duration-(--dur-base) ease-pop data-[state=checked]:-translate-x-5"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
