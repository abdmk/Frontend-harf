import { type ReactNode, useRef, useState } from 'react';

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
  // عرض الشريط على الكمبيوتر: يتحرّك بين 0 والعرض الفعلي المقاس (لا max-width وهمي يؤخّر الإغلاق)، ثم auto
  const [chipsWidth, setChipsWidth] = useState(catsOpen ? 'auto' : '0px');
  const chipsRef = useRef<HTMLDivElement>(null);
  const count = activeFilterCount(query);

  const toggleCats = () => {
    const next = !catsOpen;
    setCatsOpen(next);
    const row = chipsRef.current;
    if (!row) return;
    // + 8 = الحشوة p-1 حول الشرائح (تحفظ حلقة التركيز من القصّ)
    const full = `${row.offsetWidth + 8}px`;
    if (next) {
      setChipsWidth(full);
    } else {
      // من العرض الحالي بالبكسل إلى 0 — الانتقال لا يعمل من auto
      setChipsWidth(full);
      requestAnimationFrame(() => requestAnimationFrame(() => setChipsWidth('0px')));
    }
  };

  return (
    <div role="search" className="mt-10 flex flex-wrap items-center gap-2 lg:flex-nowrap">
      {/* التصنيف: يُظهر شرائح التصنيفات ويخفيها؛ البحث يتّسع حين تُخفى */}
      <button
        type="button"
        aria-expanded={catsOpen}
        aria-controls="cat-chips"
        onClick={toggleCats}
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
        style={{ '--chips-w': chipsWidth } as React.CSSProperties}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'width' && catsOpen) setChipsWidth('auto');
        }}
        className={cn(
          // الجوال: سطر مستقل ينفتح طولياً (grid 0fr→1fr)؛ الكمبيوتر: يتّسع أفقياً بجانب الزرّ
          '-m-1 grid w-full overflow-hidden transition-[grid-template-rows,width,opacity] duration-(--dur-xslow) ease-out-quint max-lg:order-last lg:w-(--chips-w)',
          catsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 lg:grid-rows-[1fr]',
        )}
      >
        <div className="min-h-0 [scrollbar-width:none] overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden">
          <div ref={chipsRef} className="flex w-max gap-2">
            {CHIPS.map(([value, label], i) => {
              const on = query.cat === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setQuery({ cat: value })}
                  // تتابع قصير عند الفتح فقط؛ الحركة keyframes حتى لا تؤخّر ألوان المرور
                  style={catsOpen ? { animationDelay: `${i * 28}ms` } : undefined}
                  className={cn(
                    pill,
                    catsOpen && 'animate-chip-in',
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
        </div>
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
