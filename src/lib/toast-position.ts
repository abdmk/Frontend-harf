import { useSyncExternalStore } from 'react';

import { createLocalStoreSignal } from './local-store-signal';

/** موضع الإشعارات العابرة: بداية الأسفل، الوسط (الافتراضي)، أو نهاية الأسفل — يُحفظ في هذا المتصفّح */
export const TOAST_POSITIONS = ['start', 'center', 'end'] as const;
export type ToastPosition = (typeof TOAST_POSITIONS)[number];

const KEY = 'harf_toast_pos';
const signal = createLocalStoreSignal();

function read(): ToastPosition {
  try {
    const v = localStorage.getItem(KEY);
    return (TOAST_POSITIONS as readonly string[]).includes(v ?? '') ? (v as ToastPosition) : 'center';
  } catch {
    return 'center';
  }
}

export function setToastPosition(p: ToastPosition) {
  try {
    if (p === 'center') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, p);
  } catch {
    /* التخزين غير متاح — يبقى الوسط */
  }
  signal.notify();
}

export function useToastPosition() {
  return useSyncExternalStore(signal.subscribe, read, () => 'center' as const);
}
