import { MOCK_FONTS } from '@/mocks/fonts';
import type { Font } from '@/types/domain/font';

/**
 * خطوط «نسق» هي خطوط مكتبة حرف (المعرّفات نفسها) — منها السعر وحزمة التحميل وصفحة الخط.
 * اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها.
 */
export function libraryFont(id: string): Font | null {
  return MOCK_FONTS.find((f) => f.id === id) ?? null;
}
