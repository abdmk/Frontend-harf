import { useCallback, useState } from 'react';

const KEY = 'harf-saved-manuscripts';

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 500) : [];
  } catch {
    return [];
  }
}

/** المخطوطات المحفوظة — في هذا المتصفّح (المعرّفات فقط) */
export function useSavedManuscripts() {
  const [ids, setIds] = useState<string[]>(read);
  const toggle = useCallback((id: string) => {
    setIds((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* التخزين غير متاح — يبقى الحفظ لهذه الزيارة */
      }
      return next;
    });
  }, []);
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
