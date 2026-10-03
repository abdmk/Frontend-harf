import { PLATFORM_SHARE_PCT } from '@/lib/studio-verification';
import { cents } from '@/types/domain/commerce';

/**
 * شروط الناشر المالية. ⚠️ قيم تجريبية: الشروط والأحكام تُحيل هذه الأرقام إلى اتفاقية الناشر،
 * فتُحدَّد عند توقيعها وتأتي من الخادم — لا تُعتمد الأرقام هنا.
 */
export const PUBLISHER_TERMS = {
  /** حصّة حرف من سعر البيع (تشمل رسوم معالجة الدفع) */
  platformPct: PLATFORM_SHARE_PCT,
  /** الأرباح تصير قابلة للسحب بعد انتهاء مدّة الاسترجاع */
  holdDays: 14,
  /** دورية التحويل التلقائي */
  payoutEveryDays: 14,
  minPayout: cents(5000),
  /** تغيير حساب التحويل: تأكيد بالبريد ثم تعليق التحويلات هذه المدّة (حماية من سرقة الحساب) */
  accountChangeHoldHours: 72,
} as const;

/** صافي الناشر من سعر بيع — بالسنتات الصحيحة، والتقريب لصالح الناشر */
export function netOf(grossCents: number) {
  const fee = Math.floor((grossCents * PUBLISHER_TERMS.platformPct) / 100);
  return { fee, net: grossCents - fee };
}
