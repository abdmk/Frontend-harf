import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * بداية صفحات الأدوات التي تبدأ برفع ملف (عين، مختبر الخط): كل شيء في المنتصف —
 * شارة صغيرة، عنوان من سطرين (الثاني بلون العلامة)، ووصف بعرض قراءة. بطاقة الرفع تأتي بعده مباشرة
 * فتكون أول ما يُفعل في الصفحة. مسطّحة عمداً: لا تدرّجات قبل اعتماد «اللحظات اللونية».
 */
export function ToolHero({
  badge,
  title,
  highlight,
  lead,
  className,
}: {
  /** شارة فوق العنوان — حقيقة عن الأداة، لا شعار تسويقي */
  badge: ReactNode;
  title: string;
  /** السطر الثاني من العنوان — بلون العلامة */
  highlight: string;
  lead: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mx-auto mb-8 max-w-3xl text-center sm:mb-10', className)}>
      <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-caption font-medium text-muted-foreground">
        <span aria-hidden className="size-1.5 rounded-full bg-primary-fill" />
        {badge}
      </p>
      <h1 className="mt-5 animate-fade-up text-hero leading-[1.2] font-bold tracking-tight text-balance">
        {title}
        <span className="block text-primary">{highlight}</span>
      </h1>
      <p className="mx-auto mt-4 max-w-[56ch] animate-fade-up text-lead leading-relaxed text-pretty text-muted-foreground">
        {lead}
      </p>
    </header>
  );
}
