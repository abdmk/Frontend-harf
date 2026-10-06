import { z } from 'zod';

import { getAccountOverrides, saveAccountOverrides, useAccountOverrides } from '@/stores/account-overrides';
import { MOCK_ADMIN_ANALYTICS } from '@/testing/mocks/studio';
import { MOCK_USERS } from '@/testing/mocks/users';
import { PLANS, type Plan } from '@/types/domain/user';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/**
 * إدارة الحسابات: تغيير الخطة (أو منحها)، الحظر وفكّه، والحذف الناعم مع الاسترجاع.
 * لا إجراء على حساب مشرف (ولا على نفسك) — يُدار المشرفون من الخادم مباشرة.
 */
export type AccountStatus = 'active' | 'banned' | 'deleted';
export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  /** الخطة قبل قرار الإدارة — لإظهار «ممنوحة» */
  basePlan: Plan;
  joined: string;
  admin: boolean;
  status: AccountStatus;
  banReason?: string;
};

const BASE: Omit<AdminAccount, 'plan' | 'status' | 'banReason'>[] = [
  ...Object.values(MOCK_USERS).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    basePlan: u.plan,
    joined: u.memberSince,
    admin: u.role === 'admin',
  })),
  ...MOCK_ADMIN_ANALYTICS.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    basePlan: u.plan,
    joined: u.joined,
    admin: false,
  })),
];
const byId = (id: string) => BASE.find((u) => u.id === id);

export function useAccounts(): AdminAccount[] {
  const o = useAccountOverrides();
  return BASE.map((u) => ({
    ...u,
    plan: o.plans[u.id] ?? u.basePlan,
    status: o.deleted.includes(u.id) ? 'deleted' : o.banned[u.id] ? 'banned' : 'active',
    banReason: o.banned[u.id]?.reason,
  }));
}

export const PLAN_NAME: Record<Plan, string> = { free: 'المجانية', basic: 'الأساسية', studio: 'الاستوديو' };

/** التحقّق المشترك: مشرف، والحساب موجود وليس مشرفاً */
function target(id: string): { admin: { name: string } } | { error: AdminResult } {
  const admin = adminOrNull();
  if (!admin) return { error: DENIED };
  const u = byId(id);
  if (!u) return { error: { ok: false, error: 'الحساب غير موجود.' } };
  if (u.admin) return { error: { ok: false, error: 'لا يُدار حساب مشرف من هنا.' } };
  return { admin };
}

function save(next: ReturnType<typeof getAccountOverrides>, actor: string, action: string, id: string): AdminResult {
  if (!saveAccountOverrides(next)) return { ok: false, error: 'تعذّر الحفظ.' };
  logAdmin(actor, action, byId(id)?.name ?? id);
  return { ok: true };
}

export function setPlan(id: string, plan: unknown): AdminResult {
  const t = target(id);
  if ('error' in t) return t.error;
  const p = z.enum(PLANS).safeParse(plan);
  if (!p.success) return { ok: false, error: 'خطة غير معروفة.' };
  const o = getAccountOverrides();
  const plans = { ...o.plans };
  if (p.data === byId(id)!.basePlan) delete plans[id];
  else plans[id] = p.data;
  return save({ ...o, plans }, t.admin.name, `تغيير الخطة إلى ${PLAN_NAME[p.data]}`, id);
}

export const BAN_REASON_MIN = 5;
export function ban(id: string, reason: string): AdminResult {
  const t = target(id);
  if ('error' in t) return t.error;
  const r = reason.trim();
  if (r.length < BAN_REASON_MIN || r.length > 300)
    return { ok: false, error: `اكتب سبب الحظر (${BAN_REASON_MIN}–300 حرف) — يُحفظ في السجلّ.` };
  const o = getAccountOverrides();
  return save(
    { ...o, banned: { ...o.banned, [id]: { reason: r, at: new Date().toISOString() } } },
    t.admin.name,
    'حظر حساب',
    id,
  );
}

export function unban(id: string): AdminResult {
  const t = target(id);
  if ('error' in t) return t.error;
  const o = getAccountOverrides();
  const banned = { ...o.banned };
  delete banned[id];
  return save({ ...o, banned }, t.admin.name, 'فكّ حظر حساب', id);
}

/** حذف ناعم يتطلّب كتابة البريد — يُسترجع من «المحذوفة» */
export function removeAccount(id: string, confirmEmail: string): AdminResult {
  const t = target(id);
  if ('error' in t) return t.error;
  if (confirmEmail.trim().toLowerCase() !== byId(id)!.email.toLowerCase())
    return { ok: false, error: 'اكتب البريد كما هو للتأكيد.' };
  const o = getAccountOverrides();
  return save({ ...o, deleted: [...o.deleted.filter((x) => x !== id), id] }, t.admin.name, 'حذف حساب', id);
}

export function restoreAccount(id: string): AdminResult {
  const t = target(id);
  if ('error' in t) return t.error;
  const o = getAccountOverrides();
  return save({ ...o, deleted: o.deleted.filter((x) => x !== id) }, t.admin.name, 'استرجاع حساب', id);
}
