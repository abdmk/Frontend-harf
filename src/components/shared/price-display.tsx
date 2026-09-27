import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { Money } from '@/types/domain/commerce';

/**
 * عرض السعر: السعر الحالي، والسعر قبل الخصم مشطوباً إن وُجد، و«مجاني» حين يكون صفراً.
 * القيم المعروضة من الخادم — لا حساب هنا.
 */
export function PriceDisplay({
  price,
  compareAt,
  size = 'md',
  suffix,
  className,
}: {
  price: Money;
  compareAt?: Money;
  size?: 'sm' | 'md' | 'lg';
  /** مثل «/ شهرياً» */
  suffix?: string;
  className?: string;
}) {
  const free = price.cents === 0;
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span
        dir="ltr"
        className={cn(
          'font-semibold tracking-tight',
          size === 'sm' && 'text-control',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-3xl',
        )}
      >
        {free ? 'مجاني' : formatMoney(price)}
      </span>
      {compareAt && compareAt.cents > price.cents && (
        <s dir="ltr" className="text-meta text-tertiary">
          <span className="sr-only">بدلاً من </span>
          {formatMoney(compareAt)}
        </s>
      )}
      {suffix && !free && <span className="text-meta text-muted-foreground">{suffix}</span>}
    </span>
  );
}
