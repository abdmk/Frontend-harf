import type * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * الحقل (دليل التصميم 2.2): أرضية بيضاء بحدّ رفيع، والتركيز حدّ أحمر مع حلقة ناعمة.
 * الخطأ: aria-invalid (يُربط بالرسالة عبر FieldError).
 */
const fieldBox = cn(
  'flex h-11.5 w-full min-w-0 items-center gap-2 rounded-sm border border-border bg-card px-3 text-lead text-foreground',
  'transition-[border-color,box-shadow] duration-(--dur-base) ease-out-quint',
  'focus-within:border-primary focus-within:shadow-focus hover:border-strong focus-within:hover:border-primary',
  'has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-sunken has-[:disabled]:opacity-60',
  'has-[[aria-invalid=true]]:border-dgr-500 has-[[aria-invalid=true]]:focus-within:shadow-none',
);

const bareInput =
  'h-full w-full min-w-0 bg-transparent outline-none placeholder:text-tertiary disabled:cursor-not-allowed [font-variant-numeric:tabular-nums]';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <span className={cn(fieldBox, className)}>
      <input data-slot="input" className={bareInput} {...props} />
    </span>
  );
}

/** حقل بأيقونة/لاحقة: <InputGroup start={<MailIcon/>}><input…/></InputGroup> */
function InputGroup({
  start,
  end,
  className,
  ...props
}: React.ComponentProps<'input'> & { start?: React.ReactNode; end?: React.ReactNode }) {
  return (
    <span className={cn(fieldBox, 'group/input', className)}>
      {start && (
        <span className="flex shrink-0 text-tertiary transition-colors group-focus-within/input:text-primary [&_svg]:size-4.5">
          {start}
        </span>
      )}
      <input data-slot="input" className={bareInput} {...props} />
      {end && <span className="flex shrink-0 text-tertiary">{end}</span>}
    </span>
  );
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-25 w-full resize-y rounded-sm border border-border bg-card p-3 text-control leading-[1.8] text-foreground outline-none placeholder:text-tertiary',
        'transition-[border-color,box-shadow] duration-(--dur-base) hover:border-strong focus:border-primary focus:shadow-focus',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:opacity-60 aria-invalid:border-dgr-500',
        className,
      )}
      {...props}
    />
  );
}

export { Input, InputGroup, Textarea, fieldBox };
