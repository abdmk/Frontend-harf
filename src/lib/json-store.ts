import { useSyncExternalStore } from 'react';

import { createLocalStoreSignal } from './local-store-signal';

/**
 * مخزن JSON فوق localStorage بقراءة مُتحقَّق منها: كل قراءة تمرّ على parse — قيمة تالفة أو معدّلة
 * يدوياً تعود للافتراضي بدل أن تصل إلى الواجهة. اللقطة مخبّأة حتى يتغيّر النص المخزَّن
 * (يتطلّبه useSyncExternalStore).
 * ⚠️ عرض فقط: في المنتج تُحفظ هذه البيانات على الخادم وتُتحقَّق صلاحياتها هناك.
 */
export function createJsonStore<T>(key: string, parse: (raw: unknown) => T, fallback: T) {
  const signal = createLocalStoreSignal();
  let cache: { raw: string | null; value: T } = { raw: null, value: fallback };

  function get(): T {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      return cache.value;
    }
    if (raw === cache.raw) return cache.value;
    let value = fallback;
    if (raw !== null) {
      try {
        value = parse(JSON.parse(raw));
      } catch {
        value = fallback;
      }
    }
    cache = { raw, value };
    return value;
  }

  /** يعيد false إن تعذّر الحفظ (امتلاء التخزين) — ليُعرض خطأ واضح بدل فقدان صامت */
  function set(value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
    signal.notify();
    return true;
  }

  function use(): T {
    return useSyncExternalStore(signal.subscribe, get, () => fallback);
  }

  return { get, set, use, subscribe: signal.subscribe };
}

/** مساعدات تحقّق صغيرة للقراءة من التخزين */
export const asObject = (x: unknown): Record<string, unknown> =>
  x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {};
export const asStrings = (x: unknown, max = 500): string[] =>
  Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string' && v.length <= 64).slice(0, max) : [];
