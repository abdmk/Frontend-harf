import { publicFonts } from '@/lib/catalog-overrides';
import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font } from '@/types/domain/font';

/** ما يراه الزوّار فقط — المخفي والمحذوف من «مخزن الخطوط» خارج الأدوات أيضاً */
const visible = () => publicFonts(MOCK_FONTS);

/**
 * خطوط «نسق» هي خطوط مكتبة حرف (المعرّفات نفسها) — منها السعر وحزمة التحميل وصفحة الخط.
 * اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها.
 */
export function libraryFont(id: string): Font | null {
  return visible().find((f) => f.id === id) ?? null;
}
