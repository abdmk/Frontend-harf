import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

import type { CouponResult } from '../api/actions';

/**
 * كود الخصم — مطويّ خلف «لديك رمز خصم؟» كي لا ينافس الإجمالي وزرّ الشراء؛ يُتحقّق منه على الخادم
 * (الكود التجريبي: HARF10). بعد التطبيق يظهر في سطر الخصم، فيختفي الرابط.
 */
export function CouponForm({
  action,
  applied,
}: {
  action: (prev: CouponResult, form: FormData) => CouponResult | Promise<CouponResult>;
  /** كود مطبَّق — لا حاجة للرابط */
  applied?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [open, setOpen] = useState(false);

  if (!open)
    return applied ? null : (
      <button
        type="button"
        aria-expanded={false}
        onClick={() => setOpen(true)}
        className="self-start text-meta font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        لديك رمز خصم؟
      </button>
    );

  return (
    <form action={formAction} className="flex animate-fade-up flex-col gap-1.5">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="coupon">
          كود الخصم
        </label>
        <Input
          id="coupon"
          name="coupon"
          placeholder="كود الخصم"
          maxLength={24}
          autoComplete="off"
          autoFocus
          dir="ltr"
          className="h-10.5 text-control"
          aria-invalid={state?.ok === false}
          aria-describedby="coupon-msg"
        />
        <Button type="submit" variant="secondary" loading={pending}>
          تطبيق
        </Button>
      </div>
      <p
        id="coupon-msg"
        role="status"
        className={cn('min-h-4 text-caption', state?.ok ? 'text-ok-text' : 'text-dgr-text')}
      >
        {state?.message}
      </p>
    </form>
  );
}
