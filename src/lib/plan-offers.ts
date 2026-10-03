import { useSyncExternalStore } from 'react';
import { z } from 'zod';

import { MOCK_PLANS } from '@/mocks/plans';
import { cents } from '@/types/domain/commerce';
import type { PlanOffer } from '@/types/domain/subscription';
import { PLANS, type Plan } from '@/types/domain/user';

import { asObject, createJsonStore } from './json-store';

/**
 * تعريف الخطط كما تعدّله الإدارة: الاسم والوصف والسعرين والمزايا. نافذة الخطط وصفحة الاشتراك
 * تقرآن من هنا. الحفظ يمرّ على المخطّط نفسه عند الكتابة والقراءة — قيمة تالفة تعود للافتراضي.
 * ⚠️ عرض: في المنتج السعر الذي يُدفع فعلاً هو سعر Stripe (Price) يُنشأ على الخادم؛ تغيير السعر
 * يُنشئ Price جديداً للمشتركين الجدد ولا يغيّر اشتراكاً قائماً بصمت.
 */
export const PLAN_LIMITS = { name: 24, tagline: 80, badge: 20, inherits: 60, feature: 60, features: 10 };
/** الحدّ الأعلى للسعر الشهري بالسنت — حاجز ضدّ خطأ إدخال (صفر زائد) */
export const MAX_PRICE_CENTS = 100_000;

const price = z.number().int('السعر بالسنت عدد صحيح.').min(0).max(MAX_PRICE_CENTS, 'السعر أعلى من المسموح.');

export const planEditSchema = z
  .object({
    id: z.enum(PLANS),
    name: z.string().trim().min(2, 'اسم الخطة مطلوب.').max(PLAN_LIMITS.name),
    tagline: z.string().trim().min(4, 'اكتب وصفاً قصيراً للخطة.').max(PLAN_LIMITS.tagline),
    monthlyCents: price,
    yearlyPerMonthCents: price,
    badge: z.string().trim().max(PLAN_LIMITS.badge),
    inherits: z.string().trim().max(PLAN_LIMITS.inherits),
    features: z
      .array(
        z.object({
          label: z.string().trim().min(2, 'كل ميزة تحتاج نصّاً.').max(PLAN_LIMITS.feature),
          included: z.boolean(),
        }),
      )
      .min(1, 'أضف ميزة واحدة على الأقل.')
      .max(PLAN_LIMITS.features, `${PLAN_LIMITS.features} مزايا على الأكثر.`),
  })
  .superRefine((p, ctx) => {
    if (p.id === 'free' && (p.monthlyCents !== 0 || p.yearlyPerMonthCents !== 0))
      ctx.addIssue({ code: 'custom', message: 'الخطة المجانية بلا سعر.', path: ['monthlyCents'] });
    if (p.id !== 'free' && p.monthlyCents === 0)
      ctx.addIssue({ code: 'custom', message: 'الخطة المدفوعة تحتاج سعراً شهرياً.', path: ['monthlyCents'] });
    const labels = p.features.map((f) => f.label);
    if (new Set(labels).size !== labels.length)
      ctx.addIssue({ code: 'custom', message: 'ميزتان بالنصّ نفسه — احذف المكرّرة.', path: ['features'] });
    if (p.yearlyPerMonthCents > p.monthlyCents)
      ctx.addIssue({
        code: 'custom',
        message: 'سعر الشهر في الدفع السنوي لا يزيد على الشهري.',
        path: ['yearlyPerMonthCents'],
      });
  });

export type PlanEdit = z.infer<typeof planEditSchema>;

export const toEdit = (p: PlanOffer): PlanEdit => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline,
  monthlyCents: p.monthly.cents,
  yearlyPerMonthCents: p.yearlyPerMonth.cents,
  badge: p.badge ?? '',
  inherits: p.inherits ?? '',
  features: p.features.map((f) => ({ ...f })),
});

export const fromEdit = (e: PlanEdit): PlanOffer => ({
  id: e.id,
  name: e.name,
  tagline: e.tagline,
  monthly: cents(e.monthlyCents),
  yearlyPerMonth: cents(e.yearlyPerMonthCents),
  yearlyTotal: cents(e.yearlyPerMonthCents * 12),
  ...(e.badge ? { badge: e.badge } : {}),
  ...(e.inherits ? { inherits: e.inherits } : {}),
  features: e.features,
});

export const DEFAULT_PLANS = MOCK_PLANS;
export const defaultPlan = (id: Plan) => DEFAULT_PLANS.find((p) => p.id === id)!;

/** المحفوظ: تعريف كل خطة بصيغة التحرير؛ ما لم يُحفظ أو لم يمرّ على المخطّط يبقى على الافتراضي */
type Stored = Record<Plan, PlanEdit>;
const DEFAULT_STORED = Object.fromEntries(DEFAULT_PLANS.map((p) => [p.id, toEdit(p)])) as Stored;

const store = createJsonStore<Stored>(
  'harf_plan_offers',
  (x) => {
    const o = asObject(x);
    return Object.fromEntries(
      PLANS.map((id) => {
        const r = planEditSchema.safeParse(o[id]);
        return [id, r.success && r.data.id === id ? r.data : DEFAULT_STORED[id]];
      }),
    ) as Stored;
  },
  DEFAULT_STORED,
);

/** القائمة المشتقّة مخبّأة على مرجع المحفوظ — مرجع ثابت يحتاجه useSyncExternalStore */
let derived: { from: Stored | null; offers: PlanOffer[] } = { from: null, offers: DEFAULT_PLANS };
export function getPlanOffers(): PlanOffer[] {
  const stored = store.get();
  if (stored !== derived.from) derived = { from: stored, offers: PLANS.map((id) => fromEdit(stored[id])) };
  return derived.offers;
}
export function usePlanOffers(): PlanOffer[] {
  return useSyncExternalStore(store.subscribe, getPlanOffers, () => DEFAULT_PLANS);
}

/** يحفظ خطة واحدة بعد التحقّق (null يعيدها إلى الافتراضي) — false إن رُفضت أو تعذّر الحفظ */
export function savePlanEdit(id: Plan, edit: unknown | null): { ok: true } | { ok: false; error: string } {
  let next: PlanEdit;
  if (edit === null) next = DEFAULT_STORED[id];
  else {
    const r = planEditSchema.safeParse(edit);
    if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? 'بيانات غير صالحة.' };
    if (r.data.id !== id) return { ok: false, error: 'خطة غير صالحة.' };
    next = r.data;
  }
  if (!store.set({ ...store.get(), [id]: next })) return { ok: false, error: 'تعذّر الحفظ — مساحة التخزين ممتلئة.' };
  return { ok: true };
}
