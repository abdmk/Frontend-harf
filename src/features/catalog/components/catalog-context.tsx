'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, type ReactNode, use, useCallback, useMemo, useTransition } from 'react';

import { type CatalogQuery, parseCatalogQuery, toSearchParams } from '@/features/catalog/types/catalog-query';

type Ctx = { query: CatalogQuery; setQuery: (patch: Partial<CatalogQuery>) => void; pending: boolean };
const CatalogCtx = createContext<Ctx | null>(null);

export function useCatalog() {
  const c = use(CatalogCtx);
  if (!c) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return c;
}

/**
 * حالة المكتبة كلها في الرابط (قابلة للمشاركة ولمحرّكات البحث). كل تغيير يستبدل
 * الرابط فيعيد الخادم حساب النتائج؛ أثناء ذلك تخفت الشبكة قليلاً.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const query = useMemo(() => parseCatalogQuery(Object.fromEntries(sp.entries())), [sp]);

  const setQuery = useCallback(
    (patch: Partial<CatalogQuery>) => {
      const p = toSearchParams({ ...query, ...patch }).toString();
      start(() => router.replace(p ? `${pathname}?${p}` : pathname, { scroll: false }));
    },
    [pathname, query, router],
  );

  const value = useMemo(() => ({ query, setQuery, pending }), [query, setQuery, pending]);
  return <CatalogCtx value={value}>{children}</CatalogCtx>;
}

/** يلفّ النتائج: يخفّتها أثناء التحديث ويعلن الانشغال لقارئ الشاشة */
export function CatalogResults({ children }: { children: ReactNode }) {
  const { pending } = useCatalog();
  return (
    <div aria-busy={pending} className="transition-opacity duration-200 aria-busy:opacity-50">
      {children}
    </div>
  );
}
