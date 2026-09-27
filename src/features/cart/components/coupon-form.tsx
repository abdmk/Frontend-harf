import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

import type { CouponResult } from '../api/actions';

/** كود الخصم — يُتحقّق منه على الخادم (الكود التجريبي: HARF10) */
export function CouponForm({ action }: { action: (prev: CouponResult, form: FormData) => CouponResult | Promise<CouponResult> }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-1.5">
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
