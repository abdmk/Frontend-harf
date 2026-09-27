'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AppsIcon, FlameIcon, SearchIcon, SlidersIcon, TimePastIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { CATEGORIES } from '@/types/domain/font';
import type { Sort } from '@/features/catalog/types/catalog-query';
import { activeFilterCount } from '@/features/catalog/utils/filter-fonts';
import { CATEGORY_LABEL } from '@/lib/labels';

import { useCatalog } from './catalog-context';
import { FilterSheet } from './filter-sheet';

const CHIPS = [['all', 'الكل'] as const, ...CATEGORIES.map((c) => [c, CATEGORY_LABEL[c]] as const)];

const pill =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[13px] leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 active:scale-[.97]';

export function CatalogToolbar() {
  const { query, setQuery } = useCatalog();
  const [catsOpen, setCatsOpen] = useState(true);
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
      </button>

      <div
        id="cat-chips"
        role="group"
        aria-label="التصنيفات"
        inert={!catsOpen}
        className={cn(
          'order-last -m-1 flex w-full [scrollbar-width:none] gap-2 overflow-x-auto p-1 transition-[max-width,opacity] duration-500 ease-out-quint lg:order-none lg:w-auto',
          catsOpen ? 'max-w-[1000px] opacity-100' : 'max-w-0 opacity-0 max-lg:hidden',
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
                  ? 'border-primary bg-card font-medium text-primary dark:bg-white'
                  : 'border-border bg-card text-muted-foreground hover:border-strong hover:text-foreground dark:border-transparent dark:bg-sunken',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <SearchBox value={query.q} onChange={(q) => setQuery({ q })} />

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
                className="grid h-[18px] min-w-[18px] animate-pop-in place-items-center rounded-full bg-primary px-1 text-[10px] text-white"
              >
                {count}
              </span>
            )}
          </button>
        }
      />

      <SortSwitch value={query.sort} onChange={(sort) => setQuery({ sort })} />
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  const last = useRef(value);
  // يتبع الرابط إن تغيّر من خارج الحقل (مثل «مسح الكل»)
  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setText(value);
    }
  }, [value]);
  useEffect(() => {
    const v = text.trim().slice(0, 80);
    if (v === last.current) return;
    const t = window.setTimeout(() => {
      last.current = v;
      onChange(v);
    }, 300);
    return () => window.clearTimeout(t);
  }, [text, onChange]);

  return (
    <label className="relative flex h-11 min-w-[180px] flex-1 items-center rounded-full border bg-card transition-[box-shadow,border-color] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(236_59_60/.16)] dark:border-transparent dark:bg-sunken">
      <span className="sr-only">ابحث عن الخط أو مصمم</span>
      <SearchIcon className="pointer-events-none absolute start-4 size-4 text-muted-foreground" />
      <input
        type="search"
        value={text}
        maxLength={80}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        placeholder="ابحث عن الخط أو مصمم ..."
        className="size-full rounded-full bg-transparent ps-11 pe-4 text-[13px] outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
      />
    </label>
  );
}

function SortSwitch({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const b = box.current;
    const p = pillRef.current;
    if (!b || !p) return;
    const place = () => {
      const on = b.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!on) return;
      p.style.width = `${on.offsetWidth}px`;
      p.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(b);
    return () => ro.disconnect();
  }, [value]);

  const opts: [Sort, string, typeof FlameIcon][] = [
    ['popular', 'الأكثر شهرة', FlameIcon],
    ['newest', 'الأحدث', TimePastIcon],
  ];
  return (
    <div
      ref={box}
      role="group"
      aria-label="الترتيب"
      className="relative isolate flex h-11 shrink-0 rounded-full bg-sunken p-1 shadow-[0_0_0_4px_var(--sunken)] dark:shadow-none"
    >
      <span
        ref={pillRef}
        aria-hidden
        className="absolute inset-y-1 left-0 -z-10 rounded-full bg-white shadow-soft transition-[transform,width] duration-300 ease-out-quint"
      />
      {opts.map(([v, label, Icon]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className="flex items-center gap-1.5 rounded-full px-4 text-[13px] leading-none whitespace-nowrap text-muted-foreground transition-colors duration-200 aria-pressed:font-medium aria-pressed:text-[#161616]"
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
