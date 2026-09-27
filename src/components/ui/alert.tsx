import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { BanIcon, CheckIcon, CrossSmallIcon, ExclamationIcon, InfoIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * التنبيه (دليل التصميم 2.6): بطاقة بشريط لوني على البداية، وأيقونة في دائرة بلون الحالة،
 * وكل تنبيه يحمل إجراءً. الأحمر للفشل فقط.
 */
const alertVariants = cva(
  'relative flex items-start gap-3 overflow-hidden rounded-md border bg-card p-4 ps-5 shadow-soft before:absolute before:inset-y-0 before:start-0 before:w-0.75 before:bg-(--alert-ac)',
  {
    variants: {
      tone: {
        success: '[--alert-ac:var(--color-ok-500)] [--alert-text:var(--color-ok-text)]',
        info: '[--alert-ac:var(--color-trial-500)] [--alert-text:var(--color-info-text)]',
        warning: '[--alert-ac:var(--color-warn-500)] [--alert-text:var(--color-warn-text)]',
        danger: '[--alert-ac:var(--color-dgr-500)] [--alert-text:var(--color-dgr-text)]',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

const TONE_ICON = { success: CheckIcon, info: InfoIcon, warning: ExclamationIcon, danger: BanIcon } as const;

type AlertProps = Omit<React.ComponentProps<'div'>, 'title'> &
  VariantProps<typeof alertVariants> & {
    title: React.ReactNode;
    description?: React.ReactNode;
    /** أزرار الإجراء — استعمل AlertAction */
    actions?: React.ReactNode;
    onDismiss?: () => void;
  };

function Alert({ tone = 'info', title, description, actions, onDismiss, className, ...props }: AlertProps) {
  const Icon = TONE_ICON[tone ?? 'info'];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      data-slot="alert"
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <span className="grid size-8.5 shrink-0 place-items-center rounded-full bg-(--alert-ac)/13 text-(--alert-ac)">
        <Icon className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.75">
        <p className="text-control leading-snug font-medium">{title}</p>
        {description && <p className="text-meta leading-relaxed text-muted-foreground">{description}</p>}
        {actions && <div className="-ms-2 mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="إغلاق التنبيه"
          className="-m-1 grid size-7 shrink-0 place-items-center rounded-xs text-tertiary transition-colors hover:bg-sunken hover:text-foreground"
        >
          <CrossSmallIcon className="size-4.5" />
        </button>
      )}
    </div>
  );
}

function AlertAction({ className, muted, ...props }: React.ComponentProps<'button'> & { muted?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-7.5 rounded-xs px-2 text-meta font-medium transition-colors',
        muted ? 'text-tertiary hover:text-foreground' : 'text-(--alert-text) hover:bg-(--alert-ac)/10',
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertAction, type AlertProps };
