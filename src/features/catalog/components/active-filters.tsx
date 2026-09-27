'use client';

import { CrossSmallIcon } from '@/components/ui/icons';
import { weightsLabel } from '@/lib/format';

import type { CatalogQuery } from '@/features/catalog/types/catalog-query';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { CATEGORY_LABEL, LANG_SHORT } from '@/lib/labels';
import { DATE_LABEL, LICENSE_FILTER_LABEL } from '@/features/catalog/utils/labels';

import { useCatalog } from './catalog-context';

type Chip = { key: string; label: string; clear: Partial<CatalogQuery> };

function chipsFor(q: CatalogQuery): Chip[] {
  const out: Chip[] = q.lang.map((l) => ({
    key: `lang-${l}`,
    label: LANG_SHORT[l],
    clear: { lang: q.lang.filter((x) => x !== l) },
  }));
  if (q.license !== 'all')
    out.push({ key: 'license', label: LICENSE_FILTER_LABEL[q.license], clear: { license: 'all' } });
  if (q.date !== 'all') out.push({ key: 'date', label: DATE_LABEL[q.date], clear: { date: 'all' } });
  if (q.price) out.push({ key: 'price', label: `$${q.price[0]} – $${q.price[1]}`, clear: { price: undefined } });
  if (q.weights)
    out.push({ key: 'weights', label: `${q.weights[0]}–${weightsLabel(q.weights[1])}`, clear: { weights: undefined } });
  if (q.cat !== 'all') out.push({ key: 'cat', label: CATEGORY_LABEL[q.cat], clear: { cat: 'all' } });
  if (q.q) out.push({ key: 'q', label: `«${q.q}»`, clear: { q: '' } });
  return out;
}

/** «N نتيجة» + شرائح الفلاتر النشطة (تُزال بنقرة) + «مسح الكل» */
export function ActiveFilters({ count }: { count: number }) {
  const { query, setQuery } = useCatalog();
  const chips = chipsFor(query);
  return (
    <div
      aria-live="polite"
      className="mt-5 mb-6 flex min-h-7 flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground"
    >
      <span className="font-medium text-foreground">{count} نتيجة</span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          aria-label={`إزالة ${c.label}`}
          onClick={() => setQuery(c.clear)}
          className="group/fc inline-flex h-6 animate-pop-in items-center gap-1 rounded-full bg-tint-brand ps-2 pe-1 text-[11.5px] leading-none text-primary"
        >
          <span>{c.label}</span>
          <span className="grid size-4 place-items-center rounded-full bg-primary/15 transition-colors group-hover/fc:bg-primary group-hover/fc:text-white">
            <CrossSmallIcon className="size-3" />
          </span>
        </button>
      ))}
      {chips.length > 0 && (
        <button
          type="button"
          onClick={() => setQuery(DEFAULT_QUERY)}
          className="px-1 text-[11.5px] underline underline-offset-4 transition-colors hover:text-foreground"
        >
          مسح الكل
        </button>
      )}
    </div>
  );
}
