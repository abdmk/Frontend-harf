import { useSyncExternalStore } from 'react';

import { createLocalStoreSignal } from '@/lib/local-store-signal';

import type { NotificationView } from '../utils/group';

/**
 * حالة المقروء مشتركة بين قائمة الترويسة وصفحة الإشعارات (تبقى بعد التنقّل وإعادة التحميل).
 * ⚠️ عرض: تُحفظ في هذا المتصفّح؛ مع الخادم يصير التعليم طلباً للخادم والحالة هنا تفاؤلية.
 */
const KEY = 'harf_ntf_read';
const signal = createLocalStoreSignal();
let cache: { raw: string | null; ids: ReadonlySet<string> } = { raw: null, ids: new Set() };

function readIds(): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cache.ids;
  }
  if (raw === cache.raw) return cache.ids;
  let ids: string[] = [];
  try {
    const x = JSON.parse(raw ?? '[]') as unknown;
    if (Array.isArray(x)) ids = x.filter((v): v is string => typeof v === 'string').slice(-200);
  } catch {
    ids = [];
  }
  cache = { raw, ids: new Set(ids) };
  return cache.ids;
}

function addIds(ids: string[]) {
  const next = [...new Set([...readIds(), ...ids])].slice(-200);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cache = { raw: cache.raw, ids: new Set(next) };
  }
  signal.notify();
}

export function useNotifications(initial: NotificationView[]) {
  const read = useSyncExternalStore(signal.subscribe, readIds, () => cache.ids);
  const items = initial.map((n) => (n.unread && read.has(n.id) ? { ...n, unread: false } : n));
  return {
    items,
    unread: items.filter((n) => n.unread).length,
    markRead: (id: string) => addIds([id]),
    markAllRead: () => addIds(items.filter((n) => n.unread).map((n) => n.id)),
  };
}

/** وجهة آمنة فقط: مسار داخلي («/…») لا رابط خارجي ولا «//host» ولا «javascript:» */
export function safeHref(href?: string): string | undefined {
  return href && /^\/(?![/\\])/.test(href) ? href : undefined;
}
