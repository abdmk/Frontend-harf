/* ══ بيانات تسعير تجريبية للعرض فقط ═══════════════════════════════════════
   ⚠️ ليست قرارات تسعير أو ترخيص. النسب والمستويات هنا أمثلة لبناء الواجهة،
   وتُستبدل بجدول الأسعار الذي تقرّره حرف (قاعدة البيانات / لوحة الإدارة). */
import type { Font } from '@/types/domain/font';
import type { LicensePricing } from '@/types/domain/license';

const WEIGHTS = [
  ['thin', 'رفيع جداً', 'Thin', 100],
  ['extralight', 'رفيع', 'ExtraLight', 200],
  ['light', 'خفيف', 'Light', 300],
  ['regular', 'عادي', 'Regular', 400],
  ['medium', 'متوسط', 'Medium', 500],
  ['semibold', 'شبه عريض', 'SemiBold', 600],
  ['bold', 'عريض', 'Bold', 700],
  ['extrabold', 'عريض جداً', 'ExtraBold', 800],
  ['black', 'أسود', 'Black', 900],
  ['super', 'فائق', 'Super', 1000],
] as const;

/** يختار أوزاناً متوزّعة بعدد أوزان الخط */
function weightsFor(n: number) {
  const start = n >= 8 ? 0 : n >= 5 ? 2 : 3;
  return WEIGHTS.slice(start, start + n).map(([id, nameAr, nameEn, value]) => ({ id, nameAr, nameEn, value }));
}

export function mockPricing(font: Font): LicensePricing {
  const family = font.price * 100;
  return {
    fontId: font.id,
    currency: 'USD',
    familyCents: family,
    singleCents: Math.round(family / Math.max(2, font.weights) / 100) * 100 * 2,
    compareAtFamilyCents: font.compareAtPrice ? font.compareAtPrice * 100 : undefined,
    weights: weightsFor(font.weights),
    uses: {
      desktop: [
        { id: 'd2', label: 'حتى جهازين', addCents: 0 },
        { id: 'd5', label: 'حتى 5 أجهزة', addCents: Math.round(family * 0.5) },
        { id: 'd10', label: 'حتى 10 أجهزة', addCents: family },
      ],
      web: [
        { id: 'w10k', label: 'حتى 10 آلاف زيارة/شهر', addCents: family },
        { id: 'w100k', label: 'حتى 100 ألف زيارة/شهر', addCents: family * 2 },
        { id: 'w1m', label: 'حتى مليون زيارة/شهر', addCents: family * 4 },
      ],
      app: [
        { id: 'a1', label: 'تطبيق واحد', addCents: family * 2 },
        { id: 'a3', label: 'حتى 3 تطبيقات', addCents: family * 4 },
      ],
    },
  };
}
