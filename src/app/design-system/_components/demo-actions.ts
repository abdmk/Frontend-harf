'use server';

import { selectionSchema } from '@/lib/commerce/selection';

/** إجراء عرض للدليل: يتحقّق من الاختيار ولا يغيّر السلة */
export async function demoSubmit(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  return selectionSchema.safeParse(input).success ? { ok: true } : { ok: false, error: 'اختيار غير صالح' };
}
