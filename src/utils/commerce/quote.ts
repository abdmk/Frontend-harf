import type { LicensePricing, LicenseSelection, LicenseUse } from '@/types/domain/license';

const USE_LABEL: Record<LicenseUse, string> = {
  desktop: 'سطح المكتب',
  web: 'موقع إلكتروني',
  app: 'تطبيق',
};

export type Quote = { cents: number; summary: string[] };

/**
 * يحسب سعر اختيار من جدول التسعير. دالة نقية: تُستعمل للعرض في المتصفّح
 * وتُعاد على الخادم عند الإضافة للسلة وعند الدفع — والخادم هو المرجع.
 * ترجع null إن كان الاختيار لا يطابق الجدول (وزن أو مستوى غير موجود).
 */
export function quote(pricing: LicensePricing, sel: LicenseSelection): Quote | null {
  if (sel.fontId !== pricing.fontId) return null;
  let base: number;
  const summary: string[] = [];
  if (sel.package === 'family') {
    base = pricing.familyCents;
    summary.push(`العائلة الكاملة (${pricing.weights.length} أوزان)`);
  } else {
    const w = pricing.weights.find((x) => x.id === sel.weightId);
    if (!w) return null;
    base = pricing.singleCents;
    summary.push(`وزن ${w.nameAr}`);
  }

  let total = 0;
  let any = false;
  for (const use of ['desktop', 'web', 'app'] as const) {
    const tierId = sel.uses[use];
    if (!tierId) continue;
    const tier = pricing.uses[use].find((t) => t.id === tierId);
    if (!tier) return null;
    any = true;
    // كل استخدام يُسعَّر على أساس الحزمة ثم يُضاف مستواه
    const ratio = sel.package === 'family' ? 1 : pricing.singleCents / Math.max(1, pricing.familyCents);
    total += (use === 'desktop' ? base : 0) + Math.round(tier.addCents * ratio);
    summary.push(`${USE_LABEL[use]} · ${tier.label}`);
  }
  if (!any) return null;
  return { cents: total, summary };
}
