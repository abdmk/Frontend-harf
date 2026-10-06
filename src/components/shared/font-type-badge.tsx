import type { ReactNode } from 'react';

import { CheckIcon, ClockIcon, CrownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { LicenseType } from '@/types/domain/font';
import { TYPE_LABEL } from '@/utils/labels';

/** ألوان نوع الخط — واحدة في كل الموقع: مجاني أخضر، تجربة أزرق، مدفوع ذهبي */
export const FONT_TYPE_BADGE = {
  free: { cls: 'bg-ok-700 text-white', Icon: CheckIcon },
  trial: { cls: 'bg-trial-600 text-white', Icon: ClockIcon },
  paid: { cls: 'bg-gold-500 text-gold-foreground', Icon: CrownIcon },
} as const satisfies Record<LicenseType, { cls: string; Icon: unknown }>;

/** شارة نوع الخط (مجاني/تجربة/مدفوع) — بطاقات الخطوط والإدارة والاستوديو */
export function FontTypeBadge({
  type,
  children,
  className,
}: {
  type: LicenseType;
  /** إضافة بعد الاسم (مثل السعر) */
  children?: ReactNode;
  className?: string;
}) {
  const { cls, Icon } = FONT_TYPE_BADGE[type];
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-caption leading-none font-medium whitespace-nowrap',
        cls,
        className,
      )}
    >
      <Icon className="size-3" />
      {TYPE_LABEL[type]}
      {children}
    </span>
  );
}
