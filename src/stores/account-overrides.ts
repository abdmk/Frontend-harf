import { asObject, asStrings, createJsonStore } from '@/lib/json-store';
import { PLANS, type Plan } from '@/types/domain/user';


/**
 * قرارات الإدارة على الحسابات: تغيير الخطة أو منحها، الحظر، والحذف الناعم.
 * الجلسة التجريبية تقرأ من هنا (lib/auth)، فيظهر أثر القرار على الحساب نفسه.
 * ⚠️ عرض: في المنتج يحفظها الخادم، ويُبطل جلسات المحظور فوراً، ويُعالج الحذف وفق سياسة الخصوصية.
 */
export type BanRecord = { reason: string; at: string };
export type AccountOverrides = {
  plans: Record<string, Plan>;
  banned: Record<string, BanRecord>;
  deleted: string[];
};

export const EMPTY_ACCOUNT_OVERRIDES: AccountOverrides = { plans: {}, banned: {}, deleted: [] };
const ID = /^u[-a-z0-9]{1,40}$/;

const store = createJsonStore<AccountOverrides>(
  'harf_account_overrides',
  (x) => {
    const o = asObject(x);
    const plans: Record<string, Plan> = {};
    for (const [id, p] of Object.entries(asObject(o.plans)).slice(0, 2000))
      if (ID.test(id) && (PLANS as readonly string[]).includes(p as string)) plans[id] = p as Plan;
    const banned: Record<string, BanRecord> = {};
    for (const [id, b] of Object.entries(asObject(o.banned)).slice(0, 2000)) {
      const r = asObject(b);
      if (ID.test(id) && typeof r.reason === 'string' && typeof r.at === 'string')
        banned[id] = { reason: r.reason.slice(0, 300), at: r.at.slice(0, 40) };
    }
    return { plans, banned, deleted: asStrings(o.deleted, 2000).filter((id) => ID.test(id)) };
  },
  EMPTY_ACCOUNT_OVERRIDES,
);

export const getAccountOverrides = store.get;
export const saveAccountOverrides = store.set;
export const useAccountOverrides = store.use;
export const subscribeAccountOverrides = store.subscribe;

/**
 * خطة الحساب نفسه — مصدر واحد للخطة سواء غيّرها صاحبها (الاشتراك) أو منحها المشرف:
 * يبقى الشخص نفسه (الاسم والصورة والبريد) ويتغيّر الاشتراك فقط.
 */
export function setAccountPlan(userId: string, plan: Plan): boolean {
  if (!ID.test(userId)) return false;
  const o = store.get();
  return store.set({ ...o, plans: { ...o.plans, [userId]: plan } });
}
