import { Select as SelectPrimitive } from 'radix-ui';
import type * as React from 'react';

import { CheckIcon, ChevronDownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { fieldBox } from './input';

/** القائمة المنسدلة (دليل التصميم 2.3) — بشكل الحقل نفسه، وقائمة منبثقة بظلّ عائم */
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({
  className,
  start,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { start?: React.ReactNode }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        fieldBox,
        'group/input cursor-pointer text-start outline-none focus-visible:border-primary focus-visible:shadow-focus aria-invalid:border-dgr-500 data-[placeholder]:text-tertiary',
        className,
      )}
      {...props}
    >
      {start && <span className="flex shrink-0 text-tertiary [&_svg]:size-4.5">{start}</span>}
      <span className="flex-1 truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) group-data-[state=open]/input:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={6}
        className={cn(
          'relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1.5 text-popover-foreground shadow-float',
          'duration-(--dur-base) ease-out-quint data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex h-10 cursor-pointer items-center gap-2 rounded-xs ps-3 pe-8 text-control outline-none select-none',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-sunken data-[state=checked]:font-medium',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute end-3 text-primary">
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn('px-3 py-1.5 text-caption text-tertiary', className)} {...props} />;
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn('-mx-1.5 my-1.5 h-px bg-border', className)} {...props} />;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue };
