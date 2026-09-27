import type { CatalogQuery } from '@/features/catalog/types/catalog-query';
import { filterFonts } from '@/features/catalog/utils/filter-fonts';
import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font } from '@/types/domain/font';

/**
 * طبقة البيانات.
 * اليوم تقرأ بيانات تجريبية؛ لاحقاً تستدعي الـAPI بالواجهة نفسها،
 * فلا تتغيّر المكوّنات.
 */
export function getFonts(query: CatalogQuery): Font[] {
  return filterFonts(MOCK_FONTS, query);
}

export function getAllFontIds(): string[] {
  return MOCK_FONTS.map((f) => f.id);
}
