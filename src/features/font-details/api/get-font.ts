import 'server-only';

import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font } from '@/types/domain/font';

/** بيانات صفحة الخط — اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها */
export async function getFont(id: string): Promise<Font | null> {
  return MOCK_FONTS.find((f) => f.id === id) ?? null;
}

export async function getRelatedFonts(font: Font, limit = 3): Promise<Font[]> {
  return MOCK_FONTS.filter((f) => f.id !== font.id)
    .sort(
      (a, b) =>
        Number(b.category === font.category) - Number(a.category === font.category) || b.popularity - a.popularity,
    )
    .slice(0, limit);
}
