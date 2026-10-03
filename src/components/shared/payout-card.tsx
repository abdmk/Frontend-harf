import type { ReactNode } from 'react';

import { BankIcon, LockIcon, MobileIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { type MaskedPayout, PAYOUT_METHOD_LABEL, payoutLabel } from '@/lib/payout';

/** حساب الاستلام مقنّعاً: أيقونة الوسيلة، آخر 4 أرقام، واسم صاحبه — ثم أزرار التحديث والإزالة */
export function PayoutCard({
  payout,
  actions,
  note,
  className,
}: {
  payout: MaskedPayout;
  actions?: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  const Icon = payout.method === 'bank' ? BankIcon : MobileIcon;
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <span
          aria-hidden
          className={cn(
            'grid h-11 w-14 shrink-0 place-items-center rounded-md border [&_svg]:size-5',
            payout.method === 'bank' ? 'bg-tint-info text-info-text' : 'bg-tint-ai text-ai-text',
          )}
        >
          <Icon />
        </span>
        <div className="min-w-0">
          <p dir="ltr" className="text-end text-lead font-semibold tracking-wide tabular-nums">
            {payoutLabel(payout)}
          </p>
          <p className="mt-0.5 truncate text-meta text-muted-foreground">
            {PAYOUT_METHOD_LABEL[payout.method]} · <bdi>{payout.holder}</bdi>
            {payout.country && (
              <>
                {' · '}
                <bdi>{payout.country}</bdi>
              </>
            )}
          </p>
        </div>
      </div>
      {actions && <div className="grid grid-cols-2 gap-3">{actions}</div>}
      {note}
    </div>
  );
}

/** ملاحظة الأمان تحت النماذج المالية — نصّ صادق عمّا يحدث فعلاً للبيانات */
export function SecureNote({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-start justify-center gap-2 text-caption leading-relaxed text-tertiary', className)}>
      <LockIcon className="mt-0.5 size-3.5 shrink-0" />
      <span>{children ?? 'تُرسل البيانات مشفّرة عبر اتصال آمن (TLS)، ونحفظ للعرض آخر 4 أرقام فقط.'}</span>
    </p>
  );
}
