import type * as React from 'react';

import { InfoIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

/**
 * تركيب الحقل: عنوان مربوط بـfor + الحقل + تلميح أو رسالة خطأ.
 * اربط الرسالة بالحقل: aria-describedby={errorId} و aria-invalid.
 */
function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<'label'> & { required?: boolean }) {
  return (
    <label className={cn('text-meta font-medium text-muted-foreground', className)} {...props}>
      {children}
      {required && (
        <span aria-hidden className="ms-0.5 text-primary">
          *
        </span>
      )}
    </label>
  );
}

function FieldHint({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-caption text-tertiary', className)} {...props} />;
}

function FieldError({ className, children, ...props }: React.ComponentProps<'p'>) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn('flex animate-fade-up items-start gap-1.5 text-caption leading-normal text-dgr-text', className)}
      {...props}
    >
      <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
      {children}
    </p>
  );
}

export { Field, FieldError, FieldHint, FieldLabel };
