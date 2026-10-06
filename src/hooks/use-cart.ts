import { useSyncExternalStore } from 'react';

import { getCartSnapshot, subscribeCart } from '@/stores/cart';

/** سلة تعيد الرسم فوراً عند الإضافة/الحذف — للعناصر الدائمة في التخطيط كالترويسة */
export function useCart() {
  return useSyncExternalStore(subscribeCart, getCartSnapshot);
}
