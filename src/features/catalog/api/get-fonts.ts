import type { CatalogQuery } from '@/features/catalog/types/catalog-query';
import { filterFonts } from '@/features/catalog/utils/filter-fonts';
import { MOCK_FONTS } from '@/mocks/fonts';
import { publicFonts } from '@/stores/catalog-overrides';
import type { Font } from '@/types/domain/font';

/**
 * طبقة البيانات.
 * اليوم تقرأ بيانات تجريبية؛ لاحقاً تستدعي الـAPI بالواجهة نفسها،
 * فلا تتغيّر المكوّنات.
 */
export function getFonts(query: CatalogQuery): Font[] {
  // المخفي والمحذوف من «مخزن الخطوط» لا يظهر للزوّار
  return filterFonts(publicFonts(MOCK_FONTS), query);
}

export function getAllFontIds(): string[] {
  return publicFonts(MOCK_FONTS).map((f) => f.id);
}
