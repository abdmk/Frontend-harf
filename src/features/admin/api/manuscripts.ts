import { useMemo } from 'react';
import { z } from 'zod';

import {
  type ManuscriptSubmission,
  REFERENCE,
  type SubmissionDecision,
  getSubmission,
  updateSubmission,
  useSubmissions,
} from '@/lib/manuscript-submissions';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';
import { REASON_MAX, REASON_MIN } from './review';

/**
 * مراجعة المخطوطات المرفوعة — على نمط مراجعة الخطوط: قبول (يُنشر في المكتبة)، أو طلب تعديلات، أو رفض.
 * السبب إلزامي لغير القبول لأنه يصل لصاحب العمل كما هو (في «طلباتك» بصفحة الرفع).
 * ⚠️ عرض: القرار في هذا المتصفّح. في المنتج يحفظه الخادم، ينقل الملف إلى التخزين العامّ عند القبول، ويرسل الإشعار.
 */
export const MANUSCRIPT_REASON_PRESETS = [
  'الملف منخفض الجودة أو مقصوص الأطراف.',
  'العمل غير مكتوب بخطوط من مكتبة حرف.',
  'حقوق العمل غير واضحة — أرفق ما يثبت ملكيتك له.',
  'التصنيف لا يناسب العمل — اختر التصنيف الصحيح وأعد الرفع.',
] as const;

const decisionSchema = z
  .object({
    reference: z.string().regex(REFERENCE),
    decision: z.enum(['approved', 'changes', 'rejected']),
    reason: z.string().trim().max(REASON_MAX, `السبب ${REASON_MAX} حرف على الأكثر.`),
  })
  .refine((d) => d.decision === 'approved' || d.reason.length >= REASON_MIN, {
    message: `اكتب سبباً واضحاً (${REASON_MIN} أحرف على الأقل) — يصل لصاحب العمل كما هو.`,
    path: ['reason'],
  });

const ACTION: Record<SubmissionDecision, string> = {
  approved: 'قبول مخطوطة',
  changes: 'طلب تعديلات على مخطوطة',
  rejected: 'رفض مخطوطة',
};

export function decideManuscript(input: unknown): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة.' };
  const { reference, decision, reason } = parsed.data;
  const sub = getSubmission(reference);
  if (!sub) return { ok: false, error: 'الطلب غير موجود.' };
  if (sub.status !== 'pending') return { ok: false, error: 'اتُّخذ قرار في هذا الطلب من قبل.' };
  // لا يُنشر عمل لا ملف له (طلبات قديمة قبل حفظ الملفات)
  if (decision === 'approved' && !sub.file.id) return { ok: false, error: 'ملف العمل غير متاح — لا يمكن نشره.' };
  const saved = updateSubmission(reference, {
    status: decision,
    reason: decision === 'approved' ? undefined : reason,
    decidedAt: new Date().toISOString(),
    by: admin.name,
  });
  if (!saved) return { ok: false, error: 'تعذّر الحفظ.' };
  logAdmin(admin.name, ACTION[decision], sub.title);
  return { ok: true };
}

/** التراجع عن قرار (خطأ نقر) — يعيد الطلب إلى الطابور، ويسحبه من المكتبة إن كان قد قُبل */
export function undoManuscriptDecision(reference: string): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const sub = getSubmission(reference);
  if (!sub || sub.status === 'pending') return { ok: false, error: 'لا قرار للتراجع عنه.' };
  updateSubmission(reference, { status: 'pending', reason: undefined, decidedAt: undefined, by: undefined });
  logAdmin(admin.name, 'تراجع عن قرار مخطوطة', sub.title);
  return { ok: true };
}

/** كل الطلبات للمشرف — بلا جلسة مشرف لا شيء (الحارس في التخطيط أيضاً) */
export function useManuscriptRequests(): ManuscriptSubmission[] {
  const all = useSubmissions();
  return useMemo(() => (adminOrNull() ? all : []), [all]);
}

export function usePendingManuscripts(): number {
  return useManuscriptRequests().filter((s) => s.status === 'pending').length;
}
