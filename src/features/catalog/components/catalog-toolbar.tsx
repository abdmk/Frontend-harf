import { type ReactNode, useState } from 'react';

import { SearchField } from '@/components/shared/search-field';
import { AppsIcon, FlameIcon, SlidersIcon, TimePastIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { Sort } from '@/features/catalog/types/catalog-query';
import { activeFilterCount } from '@/features/catalog/utils/filter-fonts';
import { cn } from '@/lib/cn';
import { CATEGORY_LABEL } from '@/lib/labels';
import { CATEGORIES } from '@/types/domain/font';

import { useCatalog } from './catalog-context';
import { FilterSheet } from './filter-sheet';

const SORT_OPTIONS = [
  { value: 'popular', label: 'الأكثر شهرة', icon: <FlameIcon /> },
  { value: 'newest', label: 'الأحدث', icon: <TimePastIcon /> },
] as const satisfies readonly { value: Sort; label: string; icon: ReactNode }[];

const CHIPS = [['all', 'الكل'] as const, ...CATEGORIES.map((c) => [c, CATEGORY_LABEL[c]] as const)];

const pill =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-control leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 active:scale-[.97]';

export function CatalogToolbar() {
  const { query, setQuery } = useCatalog();
  // مطويّ افتراضياً؛ يبقى مفتوحاً إن وصل المستخدم وتصنيف مختار في الرابط
  const [catsOpen, setCatsOpen] = useState(query.cat !== 'all');
  const count = activeFilterCount(query);

  return (
    <div role="search" className="mt-10 flex flex-wrap items-center gap-2 lg:flex-nowrap">
      {/* التصنيف: يُظهر شرائح التصنيفات ويخفيها؛ البحث يتّسع حين تُخفى */}
      <button
        type="button"
        aria-expanded={catsOpen}
        aria-controls="cat-chips"
        onClick={() => setCatsOpen((v) => !v)}
        className={cn(pill, 'border-transparent bg-primary ps-4 font-medium text-white hover:bg-harf-600')}
      >
        <AppsIcon className={cn('size-4 transition-transform duration-300 ease-pop', !catsOpen && 'rotate-90')} />
        التصنيف
        {/* مطويّ وتصنيف مختار: يظهر اسمه على الزرّ حتى لا يُنسى الفلتر */}
        {!catsOpen && query.cat !== 'all' && (
          <span className="animate-pop-in font-normal opacity-85">· {CATEGORY_LABEL[query.cat]}</span>
        )}
      </button>

      <div
        id="cat-chips"
        role="group"
        aria-label="التصنيفات"
        inert={!catsOpen}
        className={cn(
          'order-last -m-1 flex w-full [scrollbar-width:none] gap-2 overflow-x-auto p-1 transition-[max-width,opacity] duration-500 ease-out-quint lg:order-none lg:w-auto',
          catsOpen ? 'max-w-250 opacity-100' : 'max-w-0 opacity-0 max-lg:hidden',
        )}
      >
        {CHIPS.map(([value, label]) => {
          const on = query.cat === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => setQuery({ cat: value })}
              className={cn(
                pill,
                on
                  ? 'border-primary bg-card font-medium text-primary dark:bg-paper'
                  : 'border-border bg-card text-muted-foreground hover:border-strong hover:text-foreground dark:border-transparent dark:bg-sunken',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

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
            <SlidersIcon className="size-4" />
            تصفية
            {count > 0 && (
              <span
                dir="ltr"
                className="grid h-4.5 min-w-4.5 animate-pop-in place-items-center rounded-full bg-primary px-1 text-micro text-white"
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
