import { useSyncExternalStore } from 'react';

import { DEMO_MODE } from '@/config/demo';
import { MOCK_NEW_STUDIO, MOCK_USERS } from '@/mocks/users';
import type { User } from '@/types/domain/user';

import { type AccountOverrides, getAccountOverrides, subscribeAccountOverrides } from './account-overrides';
import { type AccountProfile, getAccountProfiles, initialsOf, subscribeAccountProfiles } from './account-profile';
import { createLocalStoreSignal } from './local-store-signal';

export { safeNext } from './safe-next';

/** اسم مفتاح التخزين المحلي للحساب التجريبي */
const DEMO_STORAGE_KEY = 'harf_demo_as';
export const DEMO_ACCOUNTS = ['free', 'basic', 'studio', 'newstudio', 'admin', 'out'] as const;
export type DemoAccount = (typeof DEMO_ACCOUNTS)[number];

const sessionSignal = createLocalStoreSignal();
/** يشترك عنصر دائم في التخطيط (كالترويسة) بتغيّر الجلسة التجريبية — استخدمه عبر useCurrentUser */
/** الجلسة تتغيّر بتبديل الحساب أو بقرار إداري عليه (خطة/حظر/حذف) */
export const subscribeSession = (cb: () => void) => {
  const a = sessionSignal.subscribe(cb);
  const b = subscribeAccountOverrides(cb);
  const c = subscribeAccountProfiles(cb);
  return () => {
    a();
    b();
    c();
  };
};

/** هل الزائر الحالي مشرف؟ — لإظهار أدوات الإدارة السريعة في الموقع (الخادم يتحقّق في كل طلب) */
export function useIsAdmin(): boolean {
  return useSyncExternalStore(
    subscribeSession,
    () => getCurrentUser()?.role === 'admin',
    () => false,
  );
}

/**
 * ⚠️ مؤقّت للعرض: لا توجد مصادقة حقيقية بعد.
 * عند الربط بالـBackend يُستبدل باستدعاء API للتحقّق من الجلسة، بالواجهة نفسها.
 * بلا قيمة يُعرض الحساب المجاني لتسهيل العرض؛ «out» = مسجّل الخروج.
 */
function baseUser(): User | null {
  const as = getDemoSession();
  // الإنتاج: الزائر بلا جلسة غير مسجّل؛ العرض التجريبي: الحساب المجاني لتسهيل العرض
  if (as === 'out' || (as === null && !DEMO_MODE)) return null;
  if (as === 'studio') return MOCK_USERS.studio;
  // ناشر جديد (المجاني بعد الترقية): لم يوثّق استوديوه بعد
  if (as === 'newstudio') return MOCK_NEW_STUDIO;
  if (as === 'admin') return MOCK_USERS.admin;
  if (as === 'basic') return MOCK_USERS.basic;
  return MOCK_USERS.free;
}

// نسخة ثابتة المرجع ما لم يتغيّر الحساب أو قرار الإدارة عليه (يتطلّبه useSyncExternalStore)
let userCache: {
  base: User | null;
  o: AccountOverrides | null;
  p: Record<string, AccountProfile> | null;
  value: User | null;
} = { base: null, o: null, p: null, value: null };

/** حدود الاستخدام تتبع الخطة الفعلية: المجانية محدودة، والمدفوعة بلا حدّ */
function usageFor(base: User, plan: User['plan']): User['usage'] {
  if (plan === base.plan) return base.usage;
  const free = MOCK_USERS.free.usage;
  return {
    ...base.usage,
    downloads: { used: base.usage.downloads.used, limit: plan === 'free' ? free.downloads.limit : null },
    matching: { used: base.usage.matching.used, limit: plan === 'free' ? free.matching.limit : null },
  };
}

/**
 * المستخدم الحالي — المصدر الوحيد لكل ما يُعرض عنه: الحساب الأساسي + ما عدّله صاحبه (الاسم، الصورة…)
 * + خطّته الفعلية. لا يحمل أي مكوّن نسخة خاصة من هذه البيانات.
 */
export function getCurrentUser(): User | null {
  const base = baseUser();
  const o = getAccountOverrides();
  const p = getAccountProfiles();
  if (userCache.base === base && userCache.o === o && userCache.p === p) return userCache.value;
  let value: User | null = base;
  // المحظور والمحذوف بلا جلسة
  if (base && (o.deleted.includes(base.id) || o.banned[base.id])) value = null;
  else if (base) {
    const edits = p[base.id] ?? {};
    const plan = o.plans[base.id] ?? base.plan;
    const name = edits.name ?? base.name;
    value = {
      ...base,
      name,
      initials: edits.name ? initialsOf(name) : base.initials,
      avatarUrl: edits.avatar ?? base.avatarUrl,
      profession: edits.profession ?? base.profession,
      location: edits.location ?? base.location,
      website: edits.website ?? base.website,
      plan,
      usage: usageFor(base, plan),
    };
  }
  userCache = { base, o, p, value };
  return value;
}

/** للصفحات المحمية: بلا جلسة ← إرجاع null (المكوّن يوجّه للدخول) */
export function requireUser(): User | null {
  return getCurrentUser();
}

/** الاستوديو والنشر: حساب الاستوديو وحده */
export function requireStudio(): User | null {
  const user = getCurrentUser();
  if (!user || user.plan !== 'studio') return null;
  return user;
}

/** لوحة الإدارة: المشرف وحده */
export function requireAdmin(): User | null {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') return null;
  return user;
}

/** يضبط الجلسة التجريبية — يُستبدل بإنشاء/إبطال جلسة حقيقية عبر الـAPI */
export function setDemoSession(account: DemoAccount) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, account);
  } catch {
    // localStorage غير متاح
  }
  sessionSignal.notify();
}

/** ما يصل إليه الدخول التجريبي من النموذج — في الإنتاج لا يُقبل غيره ولو حُفظ في المتصفّح (كجلسة إدارة سابقة) */
const PUBLIC_ACCOUNTS: readonly DemoAccount[] = ['free', 'studio', 'out'];

export function getDemoSession(): DemoAccount | null {
  try {
    const v = localStorage.getItem(DEMO_STORAGE_KEY);
    const allowed: readonly string[] = DEMO_MODE ? DEMO_ACCOUNTS : PUBLIC_ACCOUNTS;
    return allowed.includes(v ?? '') ? (v as DemoAccount) : null;
  } catch {
    return null;
  }
}

const WELCOME_KEY = 'harf_welcome_pending';

/**
 * أول دخول بعد إنشاء الحساب: تُعرض نافذة الخطط مرّة واحدة («تابع مجاناً» أو اختر خطة).
 * ⚠️ عرض: علامة في هذا المتصفّح؛ مع الخادم تصير حقلاً في حساب المستخدم (onboarded).
 */
export function markWelcomePending() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    /* التخزين غير متاح */
  }
}

/** هل تنتظر نافذة الترحيب؟ (قراءة فقط — تُمسح عند إغلاقها بـclearWelcome) */
export function isWelcomePending(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearWelcome() {
  try {
    localStorage.removeItem(WELCOME_KEY);
  } catch {
    /* التخزين غير متاح */
  }
}
