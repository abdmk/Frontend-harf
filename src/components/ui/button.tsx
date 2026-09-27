import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/cn';

import { Spinner } from './spinner';

/**
 * زرّ حرف — الأنواع والأحجام من دليل التصميم (2.1).
 * الأحمر هو لون الفعل الوحيد: زرّ primary واحد في كل منطقة.
 */
const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2 border border-transparent font-medium whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-(--dur-fast) ease-out-quint',
    'active:scale-[.975] disabled:pointer-events-none disabled:opacity-40 aria-busy:pointer-events-none',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5",
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-harf-600',
        secondary: 'border-border bg-sunken text-foreground hover:bg-inset',
        outline: 'border-border bg-card text-foreground hover:border-strong',
        ghost: 'text-muted-foreground hover:bg-sunken hover:text-foreground',
        danger: 'bg-tint-dgr text-dgr-text hover:bg-dgr-100 dark:hover:bg-tint-dgr/70',
        ink: 'bg-ink text-ink-foreground shadow-soft hover:opacity-90',
        ai: 'bg-(image:--grad-ai) text-white shadow-soft hover:opacity-95',
        link: 'h-auto! border-0 px-0! text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8.5 rounded-xs px-4 text-caption',
        md: 'h-10.5 rounded-sm px-5 text-control',
        lg: 'h-12 rounded-sm px-6 text-lead',
        xl: 'h-14 rounded-md px-6 text-lead',
        'icon-sm': 'size-8 rounded-xs',
        icon: 'size-10.5 rounded-sm',
        'icon-lg': 'size-12 rounded-sm',
      },
      shape: {
        default: '',
        pill: 'rounded-full',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md', shape: 'default' },
  },
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** يعرض العنصر كابن (مثل Link) مع أسلوب الزرّ */
    asChild?: boolean;
    /** حالة الانتظار: مؤشّر + aria-busy، ويمنع النقر المتكرّر */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  shape,
  block,
  asChild = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'primary'}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, shape, block }), className)}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <Spinner className="absolute" />
          <span className="invisible inline-flex items-center gap-2">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants, type ButtonProps };
