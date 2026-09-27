'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getCurrentUser, setDemoSession } from '@/lib/auth';
import { PLANS } from '@/types/domain/user';

/**
 * تغيير الخطة — ⚠️ محاكاة: يبدّل الحساب التجريبي فقط.
 * في المنتج: جلسة Stripe Checkout/Billing تُنشأ على الخادم، والتفعيل يتمّ من webhook موقّع.
 */
export type ChangePlanResult = { ok: true } | { ok: false; error: string };

const input = z.object({ plan: z.enum(PLANS), cycle: z.enum(['monthly', 'yearly']) });

export async function changePlan(raw: unknown): Promise<ChangePlanResult> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'خطة غير صالحة.' };
  if (!(await getCurrentUser())) return { ok: false, error: 'سجّل الدخول أوّلاً.' };
  await new Promise((r) => setTimeout(r, 900));
  await setDemoSession(parsed.data.plan);
  revalidatePath('/', 'layout');
  return { ok: true };
}
