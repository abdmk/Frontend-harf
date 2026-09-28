import { Tabs as TabsPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';

import { useSlidingIndicator } from '@/hooks/use-sliding-indicator';
import { cn } from '@/lib/cn';

/** التبويبات (دليل التصميم 3.4): خطّ أحمر ينزلق تحت التبويب النشط */
const Tabs = TabsPrimitive.Root;

function TabsList({ className, children, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  const [list, ind] = useSlidingIndicator<HTMLDivElement, HTMLSpanElement>('[data-state="active"]');
  return (
    <TabsPrimitive.List
      ref={list}
      data-slot="tabs-list"
      className={cn('relative flex [scrollbar-width:none] gap-10 overflow-x-auto border-b', className)}
      {...props}
    >
      {children}
      <span
        ref={ind}
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 rounded-full bg-primary-fill opacity-0 transition-[transform,width] duration-(--dur-slow) ease-out-quint"
      />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'h-13 shrink-0 text-lead whitespace-nowrap text-tertiary transition-colors duration-(--dur-base) hover:text-foreground',
        'data-[state=active]:font-medium data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('animate-fade-up py-8 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
