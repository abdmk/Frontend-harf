import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { setAccountPlan } from '@/stores/account-overrides';
import { PLANS } from '@/types/domain/user';

/**
 * تغيير الخطة — ⚠️ محاكاة: تُحفظ خطة الحساب نفسه في المتصفّح (الشخص لا يتغيّر).
 * في المنتج: جلسة Stripe Checkout/Billing تُنشأ عبر الـAPI، والتفعيل يتمّ من webhook موقّع.
 */
export type ChangePlanResult = { ok: true } | { ok: false; error: string };

const input = z.object({ plan: z.enum(PLANS), cycle: z.enum(['monthly', 'yearly']) });

export async function changePlan(raw: unknown): Promise<ChangePlanResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'خطة غير صالحة.' };
  if (!getCurrentUser()) return { ok: false, error: 'سجّل الدخول أوّلاً.' };
  await new Promise((r) => setTimeout(r, 900));
  // الشخص نفسه يبقى (الاسم، الصورة، البريد) — تتغيّر خطّته فقط؛ والناشر الجديد يبدأ بتوثيق حسابه
  const current = getCurrentUser();
  if (!current || !setAccountPlan(current.id, parsed.data.plan)) return { ok: false, error: 'تعذّر الحفظ.' };
  return { ok: true };
}
