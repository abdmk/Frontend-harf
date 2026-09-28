import type { ReactNode } from 'react';

import { Reveal } from '@/components/shared/reveal';
import type { Font } from '@/types/domain/font';

import { FontCard } from './font-card';

type FontGridProps = {
  fonts: Font[];
  /** يركّب البطاقة (مع المفضّلة مثلاً) — افتراضياً بطاقة بلا إضافات */
  renderCard?: (font: Font) => ReactNode;
  /** ما يُعرض حين لا توجد نتائج */
  empty?: ReactNode;
};

/** شبكة البطاقات: 3 أعمدة، ثم 2، ثم 1 — والبطاقات تظهر بالتتابع عند التمرير */
export function FontGrid({ fonts, renderCard, empty = null }: FontGridProps) {
  if (!fonts.length) return empty;
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {fonts.map((f, i) => (
        <Reveal as="li" key={f.id} index={i} className="flex [&>*]:w-full">
          {renderCard ? renderCard(f) : <FontCard font={f} />}
        </Reveal>
      ))}
    </ul>
  );
}
