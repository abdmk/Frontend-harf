import { useCallback, useState } from 'react';

import { type ManualRevenue, readRevenue, writeRevenue } from '../api/manual-revenue';

/** الإيرادات اليدوية — الأحدث أوّلاً */
export function useManualRevenue() {
  const [items, setItems] = useState<ManualRevenue[]>(readRevenue);
  const update = useCallback((fn: (cur: ManualRevenue[]) => ManualRevenue[]) => {
    setItems((cur) => {
      const next = fn(cur).sort((a, b) => b.date.localeCompare(a.date));
      writeRevenue(next);
      return next;
    });
  }, []);
  return {
    items,
    add: useCallback((e: ManualRevenue) => update((cur) => [e, ...cur]), [update]),
    remove: useCallback((id: string) => update((cur) => cur.filter((e) => e.id !== id)), [update]),
    restore: useCallback((e: ManualRevenue) => update((cur) => [e, ...cur.filter((x) => x.id !== e.id)]), [update]),
  };
}
