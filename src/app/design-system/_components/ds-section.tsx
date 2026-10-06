import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type DsStatus = 'live' | 'reference' | 'not-designed' | 'proposal';

const STATUS: Record<DsStatus, [string, string]> = {
  live: ['نموذج حيّ', 'bg-tint-ok text-ok-text'],
  reference: ['مرجع ثابت', 'bg-sunken text-muted-foreground'],
  'not-designed': ['لم يُصمَّم بعد', 'bg-tint-warn text-warn-text'],
  proposal: ['مقترح — للمراجعة', 'bg-tint-ai text-ai-text'],
};

/** قسم في الدليل: رقم + عنوان عربي/إنجليزي + حالة التنفيذ */
export function DsSection({
  id,
  num,
  title,
  en,
  status = 'live',
  note,
  children,
}: {
  id: string;
  num: string;
  title: string;
  en: string;
  status?: DsStatus;
  note?: ReactNode;
  children?: ReactNode;
}) {
  const [label, cls] = STATUS[status];
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-b py-12 first:pt-0 last:border-0">
      <header className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span dir="ltr" className="font-mono text-caption text-tertiary">
          {num}
        </span>
        <h2 id={`${id}-title`} className="text-2xl font-semibold">
          {title}
        </h2>
        <span dir="ltr" className="text-meta text-tertiary">
          {en}
        </span>
        <span className={cn('ms-auto inline-flex h-6 items-center rounded-full px-2.5 text-caption', cls)}>
          {label}
        </span>
      </header>
      {children}
      {note && <p className="mt-4 text-meta text-muted-foreground">{note}</p>}
    </section>
  );
}

/** لوحة عرض بعنوان صغير */
export function DsPanel({ label, className, children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      {label && <p className="mb-2 text-caption text-tertiary">{label}</p>}
      <div className={cn('rounded-lg border bg-card p-6', className)}>{children}</div>
    </div>
  );
}
