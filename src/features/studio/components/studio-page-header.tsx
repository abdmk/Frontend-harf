import type { ReactNode } from 'react';

/** رأس صفحة داخل الاستوديو: عنوان، وصف قصير، وإجراء على الطرف الآخر */
export function StudioPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="animate-fade-up text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-meta text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const RANGE_LABEL = { '7': '7 أيام', '30': '30 يوماً', '90': '90 يوماً' } as const;
