import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** عنوان قسم مع رابط/إجراء اختياري على الطرف الآخر */
export function SectionHeading({
  id,
  title,
  description,
  action,
  as: H = 'h2',
  className,
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <H id={id} className={cn('font-semibold', H === 'h1' ? 'text-2xl' : 'text-lg')}>
          {title}
        </H>
        {description && <p className="mt-1 text-meta text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
