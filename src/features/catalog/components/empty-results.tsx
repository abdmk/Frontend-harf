'use client';

import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';

import { useCatalog } from './catalog-context';

export function EmptyResults() {
  const { setQuery } = useCatalog();
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-strong px-4 py-16 text-center text-sm text-muted-foreground">
      <p className="text-xl font-semibold text-foreground">لا خطوط تطابق اختيارك</p>
      <p>جرّب تصنيفاً آخر أو امسح بعض الفلاتر.</p>
      <button
        type="button"
        onClick={() => setQuery(DEFAULT_QUERY)}
        className="mt-2 h-10 rounded-sm bg-sunken px-5 font-medium text-foreground transition-colors hover:bg-inset"
      >
        مسح الكل
      </button>
    </div>
  );
}
