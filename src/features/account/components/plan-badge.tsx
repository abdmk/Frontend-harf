import { CrownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import type { Plan } from '@/features/account/types';

const STYLE: Record<Plan, string> = {
  free: 'bg-tint-ok text-lic',
  studio: 'bg-tint-info text-info-strong',
};
const LABEL: Record<Plan, string> = { free: 'مجانية', studio: 'الاستوديو' };

/** شارة الخطة: خضراء للمجانية، زرقاء للاستوديو — كما في التصميم */
export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12.5px] leading-none font-medium whitespace-nowrap',
        STYLE[plan],
        className,
      )}
    >
      <CrownIcon className="size-3.5" />
      {LABEL[plan]}
    </span>
  );
}
