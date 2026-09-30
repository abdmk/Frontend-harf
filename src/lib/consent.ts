import { useSyncExternalStore } from 'react';

import { createLocalStoreSignal } from './local-store-signal';

/**
 * موافقة ملفات تعريف الارتباط. الضرورية (الجلسة، السلة، التفضيلات، هذا الاختيار نفسه) تعمل دائماً؛
 * التحليلات والتسويق لا تعمل قبل موافقة صريحة. الاختيار يُحفظ في هذا المتصفّح ويُعدَّل في أي وقت.
 * رفع VERSION يعيد السؤال (عند إضافة فئة أو تغيير جوهري في الاستخدام).
 */
export type ConsentCategory = 'analytics' | 'marketing';
export type Consent = Record<ConsentCategory, boolean> & { at: string };

const KEY = 'harf_consent';
const VERSION = 1;
const signal = createLocalStoreSignal();

let cache: { raw: string | null; value: Consent | null } = { raw: null, value: null };

function read(): Consent | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cache.raw) return cache.value;
  let value: Consent | null = null;
  try {
    const x = JSON.parse(raw ?? 'null') as Record<string, unknown> | null;
    // قيمة لا تطابق الشكل أو من نسخة أقدم ← كأن لا اختيار (نسأل من جديد، لا نفترض الموافقة)
    if (
      x &&
      x.v === VERSION &&
      typeof x.analytics === 'boolean' &&
      typeof x.marketing === 'boolean' &&
      typeof x.at === 'string'
    )
      value = { analytics: x.analytics, marketing: x.marketing, at: x.at };
  } catch {
    value = null;
  }
  cache = { raw, value };
  return value;
}

export function getConsent(): Consent | null {
  return read();
}

/** هل وافق الزائر على هذه الفئة؟ بلا اختيار = لا */
export function hasConsent(c: ConsentCategory): boolean {
  return read()?.[c] === true;
}

export function saveConsent(choice: Record<ConsentCategory, boolean>) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        v: VERSION,
        analytics: choice.analytics,
        marketing: choice.marketing,
        at: new Date().toISOString(),
      }),
    );
  } catch {
    /* التخزين غير متاح — يبقى الافتراضي: غير الضروري معطّل */
  }
  signal.notify();
}

export function useConsent() {
  return useSyncExternalStore(signal.subscribe, read, () => null);
}

/* فتح نافذة الإعدادات من أي مكان (التذييل، سياسة الخصوصية) — النافذة واحدة في جذر التطبيق */
const openers = new Set<() => void>();
export function openConsentSettings() {
  for (const fn of openers) fn();
}
export function onOpenConsentSettings(fn: () => void) {
  openers.add(fn);
  return () => {
    openers.delete(fn);
  };
}
