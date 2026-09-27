'use server';

import { getCurrentUser } from '@/lib/auth';

import { draftSchema } from '../types/draft';

/**
 * إرسال الخط للمراجعة. التحقّق كاملاً على الخادم؛ وضع «المشرف» لا يُقبل إلا من مشرف.
 * ⚠️ عرض: لا تخزين. في المنتج: تُربط الملفات المرفوعة (المفحوصة) بالمسودّة، وتدخل طابور المراجعة.
 */
export type SubmitResult = { ok: true; reference: string } | { ok: false; errors: { path: string; message: string }[] };

export async function submitForReview(input: unknown): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user || user.plan !== 'studio')
    return { ok: false, errors: [{ path: 'auth', message: 'النشر لحساب الاستوديو.' }] };
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({ path: String(i.path[0] ?? ''), message: i.message })),
    };
  if (parsed.data.mode === 'admin' && user.role !== 'admin')
    return { ok: false, errors: [{ path: 'mode', message: 'وضع المشرف غير متاح لحسابك.' }] };
  return { ok: true, reference: `REV-${Math.floor(1000 + Math.random() * 8999)}` };
}
