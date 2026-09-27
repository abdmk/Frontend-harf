import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font } from '@/types/domain/font';

/** بيانات صفحة الخط — اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها */
export function getFont(id: string): Font | null {
  return MOCK_FONTS.find((f) => f.id === id) ?? null;
}

export function getRelatedFonts(font: Font, limit = 3): Font[] {
  return MOCK_FONTS.filter((f) => f.id !== font.id)
    .sort(
      (a, b) =>
        Number(b.category === font.category) - Number(a.category === font.category) || b.popularity - a.popularity,
    )
    .slice(0, limit);
}
