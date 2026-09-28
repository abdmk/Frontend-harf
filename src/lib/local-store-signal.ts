/**
 * إشارة تغيّر بسيطة لمخزن مبني على localStorage.
 * الأجزاء الدائمة في التخطيط (الترويسة) تُخزَّن قيمتها بمعزل عن React،
 * فبلا هذا الاشتراك لا تُعاد رسمها عند تغيّر الجلسة أو السلة من مكوّن آخر.
 */
export function createLocalStoreSignal() {
  const listeners = new Set<() => void>();
  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    notify() {
      for (const cb of listeners) cb();
    },
  };
}
