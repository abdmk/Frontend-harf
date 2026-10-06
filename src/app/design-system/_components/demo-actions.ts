import { selectionSchema } from '@/utils/commerce/selection';

/** إجراء عرض للدليل: يتحقّق من الاختيار ولا يغيّر السلة */
export function demoSubmit(input: unknown): { ok: true } | { ok: false; error: string } {
  return selectionSchema.safeParse(input).success ? { ok: true } : { ok: false, error: 'اختيار غير صالح' };
}

/** إجراء عرض لنافذة الخطط: لا يغيّر الحساب */
export function demoPlan(): { ok: true } {
  return { ok: true };
}
