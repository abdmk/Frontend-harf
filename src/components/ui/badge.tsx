import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * الشارات (دليل التصميم 2.5): أرضية خفيفة بلون الحالة + أيقونة في دائرة مصمتة.
 * appearance="solid" للشارات فوق الصور (مجاني/تجريبي/مدفوع على بطاقة الخط).
 */
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&>svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'bg-sunken text-muted-foreground',
        success: 'bg-tint-ok text-ok-text [--badge-ic:var(--color-ok-500)]',
        info: 'bg-tint-info text-info-text [--badge-ic:var(--color-trial-500)]',
        warning: 'bg-tint-warn text-warn-text [--badge-ic:var(--color-warn-500)]',
        danger: 'bg-tint-dgr text-dgr-text [--badge-ic:var(--color-dgr-500)]',
        studio: 'bg-tint-warn text-warn-text [--badge-ic:var(--color-gold-500)]',
        brand: 'bg-tint-brand text-primary [--badge-ic:var(--color-harf-500)]',
        ai: 'bg-tint-ai text-ai-text [--badge-ic:var(--color-ai-500)]',
      },
      appearance: { soft: '', solid: '' },
      size: {
        sm: 'h-6 px-2 text-caption leading-none',
        md: 'h-7.5 px-3 text-meta leading-none',
      },
    },
    compoundVariants: [
      { appearance: 'solid', tone: 'success', class: 'bg-ok-700 text-white' },
      { appearance: 'solid', tone: 'info', class: 'bg-trial-600 text-white' },
      { appearance: 'solid', tone: 'studio', class: 'bg-gold-500 text-gold-foreground' },
      { appearance: 'solid', tone: 'danger', class: 'bg-dgr-500 text-white' },
      { appearance: 'solid', tone: 'brand', class: 'bg-primary-fill text-primary-foreground' },
      { appearance: 'solid', tone: 'neutral', class: 'bg-ink text-ink-foreground' },
    ],
    defaultVariants: { tone: 'neutral', appearance: 'soft', size: 'sm' },
  },
);

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** أيقونة الحالة — تُعرض داخل دائرة بلون الحالة في النمط soft */
    icon?: React.ReactNode;
  };

function Badge({ className, tone, appearance, size, icon, children, ...props }: BadgeProps) {
  const circled = icon && (appearance ?? 'soft') === 'soft' && tone && tone !== 'neutral';
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, appearance, size }), className)} {...props}>
      {icon &&
        (circled ? (
          <span
            aria-hidden
            className="-ms-0.5 grid size-4.5 place-items-center rounded-full bg-(--badge-ic) text-white [&>svg]:size-3"
          >
            {icon}
          </span>
        ) : (
          icon
        ))}
      {children}
    </span>
  );
}

export { Badge, badgeVariants, type BadgeProps };
