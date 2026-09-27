import 'server-only';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { MOCK_USERS } from '@/mocks/users';
import type { User } from '@/types/domain/user';

export { safeNext } from './safe-next';

/** اسم كوكي الحساب التجريبي — يضبطه proxy.ts من ‎?as=free|basic|studio، وتضبطه إجراءات الدخول والخروج */
export const DEMO_ACCOUNT_COOKIE = 'harf_demo_as';
export const DEMO_ACCOUNTS = ['free', 'basic', 'studio', 'out'] as const;
export type DemoAccount = (typeof DEMO_ACCOUNTS)[number];

/**
 * ⚠️ مؤقّت للعرض: لا توجد مصادقة حقيقية بعد.
 * عند الربط يُستبدل بقراءة جلسة موقّعة (كوكي httpOnly + تحقّق على الخادم في كل طلب)، بالواجهة نفسها.
 * بلا كوكي يُعرض الحساب المجاني لتسهيل العرض؛ «out» = مسجّل الخروج.
 */
export async function getCurrentUser(): Promise<User | null> {
  const as = (await cookies()).get(DEMO_ACCOUNT_COOKIE)?.value;
  if (as === 'out') return null;
  if (as === 'studio') return MOCK_USERS.studio;
  if (as === 'basic') return MOCK_USERS.basic;
  return MOCK_USERS.free;
}

/** للصفحات المحمية: بلا جلسة ← صفحة الدخول مع العودة إلى الصفحة نفسها */
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** يضبط الجلسة التجريبية (يُستبدل بإنشاء/إبطال جلسة حقيقية) */
export async function setDemoSession(account: DemoAccount) {
  (await cookies()).set(DEMO_ACCOUNT_COOKIE, account, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** لوحة المسبك والنشر: حساب الاستوديو وحده (غيره ← صفحة الاشتراك) */
export async function requireStudio(returnTo: string): Promise<User> {
  const user = await requireUser(returnTo);
  if (user.plan !== 'studio') redirect('/account/subscription');
  return user;
}

/** لوحة الإدارة: غير المشرف يرى 404 — لا نكشف وجود المسار */
export async function requireAdmin(returnTo: string): Promise<User> {
  const user = await requireUser(returnTo);
  if (user.role !== 'admin') notFound();
  return user;
}
