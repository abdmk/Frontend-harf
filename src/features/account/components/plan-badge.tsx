import { CrownIcon } from '@/components/ui/icons';
import type { Plan } from '@/features/account/types';
import { cn } from '@/lib/cn';

const STYLE: Record<Plan, string> = {
  free: 'bg-tint-ok text-lic',
  basic: 'bg-tint-warn text-warn-text',
  studio: 'bg-tint-info text-info-strong',
};
export const PLAN_BADGE_LABEL: Record<Plan, string> = { free: 'مجانية', basic: 'أساسي', studio: 'الاستوديو' };

/** شارة الخطة: خضراء للمجانية، برتقالية للأساسية، زرقاء للاستوديو — كما في التصميم */
export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7.5 items-center gap-1.5 rounded-full px-3 text-meta leading-none font-medium whitespace-nowrap',
        STYLE[plan],
        className,
      )}
    >
      <CrownIcon className="size-3.5" />
      {PLAN_BADGE_LABEL[plan]}
    </span>
  );
}
