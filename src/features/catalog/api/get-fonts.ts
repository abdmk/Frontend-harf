import 'server-only';

import { MOCK_FONTS } from '@/mocks/fonts';

import type { Font } from '@/types/domain/font';
import type { CatalogQuery } from '@/features/catalog/types/catalog-query';
import { filterFonts } from '@/features/catalog/utils/filter-fonts';

/**
 * طبقة البيانات — تعمل على الخادم فقط.
 * اليوم تقرأ بيانات تجريبية؛ لاحقاً تستدعي قاعدة البيانات/الـAPI بالواجهة نفسها،
 * فلا تتغيّر المكوّنات.
 */
export async function getFonts(query: CatalogQuery): Promise<Font[]> {
  return filterFonts(MOCK_FONTS, query);
}

export async function getAllFontIds(): Promise<string[]> {
  return MOCK_FONTS.map((f) => f.id);
}
