import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * بداية الصفحة — نظام واحد لكل الموقع بدل عناوين متفرّقة المقاسات:
 * - section: الأدوات والمجموعات (نسق، مختبر الخط، عين، عكس النص، مخطوطات) — تصنيف صغير،
 *   عنوان كبير، ومقدّمة بعرض قراءة.
 * - compact: صفحات المهامّ (السلة، الدفع، الإشعارات) — عنوان وعدد، بلا مقدّمة طويلة.
 * الصفحات الوثائقية (عن حرف، المساعدة، الشروط) لها بدايتها الوسطية في ContentPage/LegalDocument.
 * section تحمل «اللحظة اللونية» المعتمدة (فجر) — لحظة واحدة في الصفحة.
 */
export function PageIntro({
  title,
  lead,
  eyebrow,
  aside,
  count,
  icon,
  size = 'section',
  className,
}: {
  title: string;
  lead?: ReactNode;
  /** سطر صغير فوق العنوان (مثل «أدوات حرف») */
  eyebrow?: string;
  /** عنصر على الطرف الآخر (شارة، زرّ) */
  aside?: ReactNode;
  /** عدد بجانب العنوان (السلة) */
  count?: number;
  icon?: ReactNode;
  size?: 'section' | 'compact';
  className?: string;
}) {
  const section = size === 'section';
  return (
    <header
      data-moment={section ? 'intro' : undefined}
      className={cn(
        'flex flex-wrap items-end justify-between gap-4',
        // «فجر»: لحظة الصفحة اللونية — شريط هادئ يسكن زاويته اللون
        section ? 'mb-8 rounded-2xl border moment px-6 py-8 sm:px-10 sm:py-12' : 'mb-8',
        className,
      )}
    >
      <div className={cn('min-w-0', section && 'max-w-[62ch]')}>
        {eyebrow && (
          <p className="mb-2 text-caption font-medium" style={{ color: 'var(--grad-dawn-ink)' }}>
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            'flex animate-fade-up items-center gap-3 font-bold',
            section ? 'text-display leading-tight' : 'text-2xl sm:text-3xl',
          )}
        >
          {icon && <span className="text-muted-foreground [&_svg]:size-6">{icon}</span>}
          {title}
          {count !== undefined && count > 0 && (
            <span
              dir="ltr"
              className="grid h-7 min-w-7 place-items-center rounded-full bg-sunken px-2 text-meta font-medium tabular-nums"
            >
              {count}
            </span>
          )}
        </h1>
        {lead && <p className="mt-3 text-lead leading-relaxed text-muted-foreground">{lead}</p>}
      </div>
      {aside}
    </header>
  );
}
