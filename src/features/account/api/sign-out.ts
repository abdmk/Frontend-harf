'use server';

import { redirect } from 'next/navigation';

import { setDemoSession } from '@/lib/auth';

/**
 * تسجيل الخروج — Server Action (طلب POST محميّ من CSRF بفحص المصدر في Next.js).
 * اليوم يضع الجلسة التجريبية على «خارج»؛ لاحقاً يُبطل الجلسة الحقيقية على الخادم.
 */
export async function signOut() {
  await setDemoSession('out');
  redirect('/');
}
