import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'harf-favs';
const EVENT = 'harf-favs-change';

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

/**
 * المفضّلة في هذا المتصفّح فقط — راحة للزائر. حين يُربط الحساب تُحفظ على الخادم
 * (وتبقى هذه الواجهة كما هي).
 */
export function useFavorite(id: string) {
  const raw = useSyncExternalStore(subscribe, read, () => '[]');
  const list = safeParse(raw);
  const isFav = list.includes(id);
  const toggle = useCallback(() => {
    const cur = safeParse(read());
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next.slice(-500)));
    } catch {
      /* التخزين غير متاح */
    }
    window.dispatchEvent(new Event(EVENT));
  }, [id]);
  return { isFav, toggle };
}

function safeParse(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** كل المفضّلة في هذا المتصفّح (لقسم «المفضلة» في الحساب) */
export function useFavoriteIds(): string[] {
  const raw = useSyncExternalStore(subscribe, read, () => '[]');
  return safeParse(raw);
}
