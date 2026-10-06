import { getCurrentUser } from '@/lib/auth';
import { canSell, statusOf } from '@/stores/studio-verification';

import { isKnownFoundry, isKnownPerson, personById } from './directory';
import { draftSchema } from '../types/draft';

/**
 * إرسال الخط للمراجعة.
 * ⚠️ عرض: لا تخزين. في المنتج: يُرسل إلى الـAPI ويدخل طابور المراجعة.
 */
export type SubmitResult =
  { ok: true; reference: string; notified: string[] } | { ok: false; errors: { path: string; message: string }[] };

export function submitForReview(input: unknown): SubmitResult {
  const user = getCurrentUser();
  if (!user || user.plan !== 'studio')
    return { ok: false, errors: [{ path: 'auth', message: 'النشر لحساب الاستوديو.' }] };
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({ path: String(i.path[0] ?? ''), message: i.message })),
    };
  // أوّل نشر بعد التوثيق؛ والمدفوع بعد اعتماد الإدارة فقط — الخادم يكرّر الفحص نفسه
  if (user.role !== 'admin') {
    const status = statusOf(user.id);
    if (status !== 'pending' && status !== 'approved')
      return { ok: false, errors: [{ path: 'auth', message: 'وثّق حسابك أولاً لتنشر.' }] };
    if (parsed.data.mode === 'studio' && parsed.data.availability === 'paid' && !canSell(user.id))
      return {
        ok: false,
        errors: [{ path: 'availability', message: 'الخطوط المدفوعة تُفتح بعد توثيق حسابك.' }],
      };
  }
  if (parsed.data.mode === 'admin' && user.role !== 'admin')
    return { ok: false, errors: [{ path: 'mode', message: 'وضع المشرف غير متاح لحسابك.' }] };
  // الحسابات والمسابك المُشار إليها يجب أن تكون موجودة — لا إشارة إلى معرّف مختلَق
  const unknown = [
    ...parsed.data.designers.filter((d) => !isKnownPerson(d)).map(() => 'designers'),
    ...parsed.data.foundries.filter((f) => !isKnownFoundry(f)).map(() => 'foundries'),
  ];
  if (unknown.length)
    return { ok: false, errors: unknown.map((path) => ({ path, message: 'حساب غير موجود في حرف.' })) };
  // ⚠️ عرض: في المنتج يرسل الخادم إشعاراً لكل مصمّم مُشار إليه (ويمكنه رفض الإشارة)
  const notified = parsed.data.designers.map((d) => personById(d)?.name ?? d);
  return { ok: true, reference: `REV-${Math.floor(1000 + Math.random() * 8999)}`, notified };
}
