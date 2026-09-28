import { useSyncExternalStore } from 'react';

import { getCurrentUser, subscribeSession } from '@/lib/auth';

/** جلسة تجريبية تعيد الرسم فوراً عند الدخول/الخروج — للعناصر الدائمة في التخطيط كالترويسة */
export function useCurrentUser() {
  return useSyncExternalStore(subscribeSession, getCurrentUser);
}
