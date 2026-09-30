import { z } from 'zod';

import { asObject, createJsonStore } from '@/lib/json-store';
import { REVIEW_QUEUE, type Submission } from '@/mocks/review-queue';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/**
 * مراجعة الخطوط المرفوعة: قبول، أو طلب تعديلات، أو رفض — والسبب إلزامي لغير القبول لأنه
 * يصل إلى الاستوديو كما هو ويحدّد ما يصلحه.
 * ⚠️ عرض: القرار يُحفظ في المتصفّح. في المنتج يحفظه الخادم، ينقل الخط إلى النشر عند القبول،
 * ويرسل الإشعار للاستوديو.
 */
export type Decision = 'approved' | 'changes' | 'rejected';
export type ReviewState = 'pending' | Decision;
export type DecisionRecord = { decision: Decision; reason: string; at: string; by: string };
export type ReviewItem = Submission & { state: ReviewState; record?: DecisionRecord };

export const REASON_MIN = 10;
export const REASON_MAX = 500;
export const REJECT_PRESETS = [
  'ملفات ناقصة المحارف للغات المذكورة.',
  'اسم العائلة داخل الملفات لا يطابق الاسم المُدخل.',
  'لم يُرفق الترخيص أو إقرار ملكية التصميم.',
  'الخط مطابق لخط منشور لجهة أخرى.',
] as const;

const store = createJsonStore<Record<string, DecisionRecord>>(
  'harf_admin_reviews',
  (x) => {
    const out: Record<string, DecisionRecord> = {};
    for (const [id, v] of Object.entries(asObject(x)).slice(0, 500)) {
      const r = asObject(v);
      if (
        /^REV-\d{3,6}$/.test(id) &&
        (r.decision === 'approved' || r.decision === 'changes' || r.decision === 'rejected') &&
        typeof r.at === 'string' &&
        typeof r.by === 'string'
      )
        out[id] = {
          decision: r.decision,
          reason: typeof r.reason === 'string' ? r.reason.slice(0, REASON_MAX) : '',
          at: r.at.slice(0, 40),
          by: r.by.slice(0, 60),
        };
    }
    return out;
  },
  {},
);

const decisionSchema = z
  .object({
    id: z.string().regex(/^REV-\d{3,6}$/),
    decision: z.enum(['approved', 'changes', 'rejected']),
    reason: z.string().trim().max(REASON_MAX, `السبب ${REASON_MAX} حرف على الأكثر.`),
  })
  .refine((d) => d.decision === 'approved' || d.reason.length >= REASON_MIN, {
    message: `اكتب سبباً واضحاً (${REASON_MIN} أحرف على الأقل) — يصل إلى الاستوديو كما هو.`,
    path: ['reason'],
  });

const DECISION_ACTION: Record<Decision, string> = {
  approved: 'قبول خط',
  changes: 'طلب تعديلات على خط',
  rejected: 'رفض خط',
};

export function decide(input: unknown): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة.' };
  const { id, decision, reason } = parsed.data;
  const sub = REVIEW_QUEUE.find((s) => s.id === id);
  if (!sub) return { ok: false, error: 'الطلب غير موجود.' };
  if (store.get()[id]) return { ok: false, error: 'اتُّخذ قرار في هذا الطلب من قبل.' };
  const saved = store.set({
    ...store.get(),
    [id]: { decision, reason: decision === 'approved' ? '' : reason, at: new Date().toISOString(), by: admin.name },
  });
  if (!saved) return { ok: false, error: 'تعذّر الحفظ.' };
  logAdmin(admin.name, DECISION_ACTION[decision], sub.nameLatin);
  return { ok: true };
}

/** التراجع عن قرار خلال الجلسة (خطأ نقر) — يعيد الطلب إلى الطابور */
export function undoDecision(id: string): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const all = { ...store.get() };
  if (!all[id]) return { ok: false, error: 'لا قرار للتراجع عنه.' };
  delete all[id];
  store.set(all);
  logAdmin(admin.name, 'تراجع عن قرار مراجعة', id);
  return { ok: true };
}

export function useReviewItems(): ReviewItem[] {
  const records = store.use();
  return REVIEW_QUEUE.map((s) => ({ ...s, state: records[s.id]?.decision ?? 'pending', record: records[s.id] }));
}

export function usePendingCount() {
  return useReviewItems().filter((i) => i.state === 'pending').length;
}
