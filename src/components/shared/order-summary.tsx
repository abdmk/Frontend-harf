import type { ReactNode } from 'react';

import { ShieldCheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { Cart } from '@/types/domain/commerce';

/**
 * ملخّص الطلب (السلة والدفع): المجموع الفرعي، الخصم، الإجمالي.
 * القيم من الخادم؛ الخانات (الكود، الزرّ) تأتي من الـfeature المستعمِلة.
 */
export function OrderSummary({
  cart,
  title = 'ملخّص الطلب',
  headerAction,
  lines = false,
  coupon,
  action,
  note = 'السعر النهائي يُحسب ويُتحقَّق منه على الخادم عند الدفع.',
  subtotalHint,
  tone = 'card',
  className,
}: {
  cart: Cart;
  title?: string;
  headerAction?: ReactNode;
  /** يعرض سطراً لكل عنصر (في صفحة الدفع) */
  lines?: boolean;
  coupon?: ReactNode;
  action?: ReactNode;
  note?: ReactNode;
  /** بجانب «المجموع الفرعي» — عدد العناصر */
  subtotalHint?: string;
  /** moment: لحظة «فجر» اللونية — حين يكون الملخّص بطل الصفحة (السلة) */
  tone?: 'card' | 'moment';
  className?: string;
}) {
  return (
    <section
      aria-labelledby="summary-title"
      className={cn('flex flex-col gap-4 rounded-lg border p-6', tone === 'moment' ? 'moment' : 'bg-card', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="summary-title" className="text-base font-semibold">
          {title}
        </h2>
        {headerAction}
      </div>
      <dl className="flex flex-col gap-2.5 text-control">
        {lines &&
          cart.items.map((i) => (
            <div key={i.id} className="flex justify-between gap-4 text-muted-foreground">
              <dt className="min-w-0 truncate">
                <span dir="ltr">{i.fontName}</span> — {i.summary[0]}
              </dt>
              <dd dir="ltr" className="font-medium text-foreground">
                {formatMoney(i.price)}
              </dd>
            </div>
          ))}
        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>المجموع الفرعي{subtotalHint && <span className="text-caption text-tertiary"> ({subtotalHint})</span>}</dt>
          <dd dir="ltr" className="font-medium text-foreground">
            {formatMoney(cart.subtotal)}
          </dd>
        </div>
        {cart.discount.cents > 0 && (
          <div className="flex justify-between gap-4 text-ok-text">
            <dt>
              الخصم{' '}
              <span dir="ltr" className="text-caption tabular-nums">
                ({cart.coupon})
              </span>
            </dt>
            <dd dir="ltr" className="font-medium">
              −{formatMoney(cart.discount)}
            </dd>
          </div>
        )}
      </dl>
      {coupon}
      <div className="flex items-end justify-between gap-4 border-t pt-4">
        <div>
          <p className="text-control font-semibold">الإجمالي</p>
          <p className="text-caption text-tertiary">بالدولار الأمريكي</p>
        </div>
        <p dir="ltr" className="text-3xl font-semibold tracking-tight">
          {formatMoney(cart.total)}
        </p>
      </div>
      {action}
      {note && (
        <p className="flex items-start gap-1.5 text-caption text-tertiary">
          <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-ok-500" />
          {note}
        </p>
      )}
    </section>
  );
}
