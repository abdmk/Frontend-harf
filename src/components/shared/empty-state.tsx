import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * الحالة الفارغة (دليل التصميم 4.3): تقول لماذا هي فارغة، وتعطي خطوة تالية واحدة.
 * هالة «الفجر» خلف الأيقونة، والأيقونة في مربّع أبيض عائم.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  headingLevel: H = 'h2',
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <div
      className={cn(
        'relative isolate flex flex-col items-center overflow-hidden rounded-xl border bg-card px-6 py-12 text-center',
        className,
      )}
    >
      <span className="mb-4 grid size-14 place-items-center rounded-md border bg-card text-primary shadow-soft [&_svg]:size-5.5">
        {icon}
      </span>
      <H className="text-base font-semibold">{title}</H>
      {description && <p className="mt-1.5 max-w-[44ch] text-control text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
