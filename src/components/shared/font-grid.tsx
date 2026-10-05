import type { ReactNode } from 'react';

import { Reveal } from '@/components/shared/reveal';
import { cn } from '@/lib/cn';
import type { Font } from '@/types/domain/font';

import { FontCard } from './font-card';

type FontGridProps = {
  fonts: Font[];
  /** يركّب البطاقة (مع المفضّلة مثلاً) — افتراضياً بطاقة بلا إضافات */
  renderCard?: (font: Font) => ReactNode;
  /** ما يُعرض حين لا توجد نتائج */
  empty?: ReactNode;
  /** أعمدة بديلة — مثلاً «خطوط مشابهة» الأربعة: 2 ثم 4 بلا صفّ يتيم */
  columns?: string;
};

/** شبكة البطاقات: 4 أعمدة من 1280px، ثم 3، ثم 2، ثم 1 — والبطاقات تظهر بالتتابع عند التمرير */
export function FontGrid({
  fonts,
  renderCard,
  empty = null,
  columns = 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}: FontGridProps) {
  if (!fonts.length) return empty;
  return (
    <ul className={cn('grid grid-cols-1 gap-5', columns)}>
      {fonts.map((f, i) => (
        <Reveal as="li" key={f.id} index={i} className="flex [&>*]:w-full">
          {renderCard ? renderCard(f) : <FontCard font={f} />}
        </Reveal>
      ))}
    </ul>
  );
}
