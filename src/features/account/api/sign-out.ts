'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DEMO_ACCOUNT_COOKIE } from '@/lib/auth';

/**
 * تسجيل الخروج — Server Action (طلب POST محميّ من CSRF بفحص المصدر في Next.js).
 * اليوم يمسح كوكي الحساب التجريبي؛ لاحقاً يُبطل الجلسة الحقيقية على الخادم.
 */
export async function signOut() {
  (await cookies()).delete(DEMO_ACCOUNT_COOKIE);
  redirect('/');
}
