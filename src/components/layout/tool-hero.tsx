import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * بداية صفحات الأدوات (نسق، عكس النص، مختبر الخط، عين): كل شيء في المنتصف بتسلسل واحد —
 * اسم الأداة (أيقونة + اسم) ← العنوان الرئيسي، أقوى عنصر، من سطرين والثاني بلون العلامة ←
 * الوصف تحته مباشرة ← سطر مساند صغير هادئ (اختياري) يقرّب حقيقة عن الأداة من أول فعل في الصفحة.
 * مسطّحة عمداً: لا تدرّجات قبل اعتماد «اللحظات اللونية».
 */
export function ToolHero({
  name,
  icon,
  title,
  highlight,
  lead,
  note,
  noteIcon,
  className,
}: {
  /** اسم الأداة — يعرّف بها فوق العنوان */
  name: string;
  /** أيقونة الأداة بجانب اسمها */
  icon: ReactNode;
  /** السطر الأول من العنوان الرئيسي */
  title: string;
  /** السطر الثاني من العنوان — بلون العلامة */
  highlight: string;
  lead: ReactNode;
  /** سطر مساند تحت الوصف — حقيقة عن الأداة، لا شعار تسويقي */
  note?: ReactNode;
  /** أيقونة السطر المساند — بدلها نقطة */
  noteIcon?: ReactNode;
  className?: string;
}) {
  return (
    <hgroup className={cn('mx-auto mb-10 flex max-w-3xl flex-col items-center text-center sm:mb-14', className)}>
      <p className="inline-flex animate-fade-up items-center gap-2.5 text-lg font-semibold sm:text-xl">
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-md bg-tint-brand text-primary [&_svg]:size-4.5"
        >
          {icon}
        </span>
        {name}
      </p>
      <h1 className="mt-5 animate-fade-up text-hero leading-[1.2] font-bold tracking-tight text-balance sm:mt-6">
        {title} <span className="block text-primary">{highlight}</span>
      </h1>
      <p className="mt-5 max-w-[52ch] animate-fade-up text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
        {lead}
      </p>
      {note ? (
        <p className="mt-6 inline-flex animate-fade-up items-center gap-2 rounded-full border px-3.5 py-1.5 text-meta text-muted-foreground">
          {noteIcon ? (
            <span aria-hidden className="text-primary [&_svg]:size-3.5">
              {noteIcon}
            </span>
          ) : (
            <span aria-hidden className="size-1.5 rounded-full bg-primary-fill" />
          )}
          {note}
        </p>
      ) : null}
    </hgroup>
  );
}

/**
 * مسرح بداية الأداة — بطاقة الرفع أو مساحة العمل الأولى ونصائحها تحت الـHero مباشرة.
 * عرضه محدود (1024px) حتى لا تتمدّد بطاقة الرفع على عرض الصفحة كاملاً (1440px) فتبدو فارغة؛
 * أعرض قليلاً من العنوان (768px) فيتدرّج البصر: عنوان ← أداة ← بقية الصفحة.
 */
export function ToolStage({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-5xl', className)}>{children}</div>;
}
