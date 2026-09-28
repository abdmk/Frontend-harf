import { MOCK_USERS } from '@/mocks/users';
import type { User } from '@/types/domain/user';

import { createLocalStoreSignal } from './local-store-signal';

export { safeNext } from './safe-next';

/** اسم مفتاح التخزين المحلي للحساب التجريبي */
const DEMO_STORAGE_KEY = 'harf_demo_as';
export const DEMO_ACCOUNTS = ['free', 'basic', 'studio', 'out'] as const;
export type DemoAccount = (typeof DEMO_ACCOUNTS)[number];

const sessionSignal = createLocalStoreSignal();
/** يشترك عنصر دائم في التخطيط (كالترويسة) بتغيّر الجلسة التجريبية — استخدمه عبر useCurrentUser */
export const subscribeSession = sessionSignal.subscribe;

/**
 * ⚠️ مؤقّت للعرض: لا توجد مصادقة حقيقية بعد.
 * عند الربط بالـBackend يُستبدل باستدعاء API للتحقّق من الجلسة، بالواجهة نفسها.
 * بلا قيمة يُعرض الحساب المجاني لتسهيل العرض؛ «out» = مسجّل الخروج.
 */
export function getCurrentUser(): User | null {
  const as = getDemoSession();
  if (as === 'out') return null;
  if (as === 'studio') return MOCK_USERS.studio;
  if (as === 'basic') return MOCK_USERS.basic;
  return MOCK_USERS.free;
}

/** للصفحات المحمية: بلا جلسة ← إرجاع null (المكوّن يوجّه للدخول) */
export function requireUser(): User | null {
  return getCurrentUser();
}

/** لوحة المسبك والنشر: حساب الاستوديو وحده */
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

export function getDemoSession(): DemoAccount | null {
  try {
    const v = localStorage.getItem(DEMO_STORAGE_KEY);
    if (v === 'free' || v === 'basic' || v === 'studio' || v === 'out') return v;
    return null;
  } catch {
    return null;
  }
}
