import type { ReactNode } from 'react';

import { CategoryToggle, TOOLBAR_PILL } from '@/components/shared/category-toggle';
import { SearchField } from '@/components/shared/search-field';
import { FlameIcon, SlidersIcon, TimePastIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { Sort } from '@/features/catalog/types/catalog-query';
import { activeFilterCount } from '@/features/catalog/utils/filter-fonts';
import { cn } from '@/lib/cn';
import { CATEGORY_LABEL } from '@/lib/labels';
import { CATEGORIES } from '@/types/domain/font';

import { useCatalog } from './catalog-context';
import { FilterSheet } from './filter-sheet';

const SORT_OPTIONS = [
  { value: 'popular', label: 'الأكثر شهرة', icon: <FlameIcon filled="auto" /> },
  { value: 'newest', label: 'الأحدث', icon: <TimePastIcon filled="auto" /> },
] as const satisfies readonly { value: Sort; label: string; icon: ReactNode }[];

const CHIPS = [
  { value: 'all' as const, label: 'الكل' },
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
];

const pill = TOOLBAR_PILL;

export function CatalogToolbar() {
  const { query, setQuery } = useCatalog();
  const count = activeFilterCount(query);

  return (
    <div role="search" className="mt-10 flex flex-wrap items-center gap-2 lg:flex-nowrap">
      {/* التصنيف: يُظهر شرائح التصنيفات ويخفيها؛ البحث يتّسع حين تُخفى */}
      <CategoryToggle
        id="cat-chips"
        options={CHIPS}
        value={query.cat}
        defaultValue="all"
        onChange={(cat) => setQuery({ cat })}
      />

      <SearchField
        label="ابحث عن الخط أو مصمم"
        placeholder="ابحث عن الخط أو مصمم ..."
        value={query.q}
        onChange={(q) => setQuery({ q })}
        className="min-w-45 flex-1"
      />

      <FilterSheet
        trigger={
          <button
            type="button"
            className={cn(
              pill,
              'border-border bg-card font-medium hover:border-strong dark:border-transparent dark:bg-sunken',
            )}
          >
            <SlidersIcon filled="auto" className="size-4" />
            تصفية
            {count > 0 && (
              <span
                dir="ltr"
                className="grid h-4.5 min-w-4.5 animate-pop-in place-items-center rounded-full bg-primary-fill px-1 text-micro text-white"
              >
                {count}
              </span>
            )}
          </button>
        }
      />

      <SegmentedControl
        label="الترتيب"
        value={query.sort}
        onChange={(sort) => setQuery({ sort })}
        options={SORT_OPTIONS}
      />
    </div>
  );
}
