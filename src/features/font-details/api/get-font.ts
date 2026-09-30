import { applyEdit, isPubliclyVisible, publicFonts } from '@/lib/catalog-overrides';
import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font } from '@/types/domain/font';

/** بيانات صفحة الخط — اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها */
export function getFont(id: string): Font | null {
  const font = MOCK_FONTS.find((f) => f.id === id);
  // خط أخفاه المشرف أو حذفه: غير موجود للزوّار (404)
  return font && isPubliclyVisible(id) ? applyEdit(font) : null;
}

export function getRelatedFonts(font: Font, limit = 3): Font[] {
  return publicFonts(MOCK_FONTS)
    .filter((f) => f.id !== font.id)
    .sort(
      (a, b) =>
        Number(b.category === font.category) - Number(a.category === font.category) || b.popularity - a.popularity,
    )
    .slice(0, limit);
}
