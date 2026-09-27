import 'server-only';

import { cookies } from 'next/headers';

import type { User } from '@/types/domain/user';
import { MOCK_USERS } from '@/mocks/users';

/** اسم كوكي الحساب التجريبي — يضبطه proxy.ts من ‎?as=free|studio */
export const DEMO_ACCOUNT_COOKIE = 'harf_demo_as';

/**
 * ⚠️ مؤقّت للعرض: لا توجد مصادقة بعد.
 * عند ربط المصادقة الحقيقية يُستبدل هذا بقراءة الجلسة والتحقّق منها على الخادم
 * (كوكي httpOnly موقّع + فحص الصلاحية في كل طلب محمي)، بالواجهة نفسها.
 */
export async function getCurrentUser(): Promise<User> {
  const as = (await cookies()).get(DEMO_ACCOUNT_COOKIE)?.value;
  return as === 'studio' ? MOCK_USERS.studio : MOCK_USERS.free;
}
