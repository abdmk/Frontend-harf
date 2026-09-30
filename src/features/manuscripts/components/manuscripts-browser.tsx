import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { CategoryToggle, TOOLBAR_PILL } from '@/components/shared/category-toggle';
import { EmptyState } from '@/components/shared/empty-state';
import { Masonry } from '@/components/shared/masonry';
import { SearchField } from '@/components/shared/search-field';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, CrossSmallIcon, FlameIcon, PictureIcon, SlidersIcon, TimePastIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';
import { MANUSCRIPT_CATEGORIES, MANUSCRIPT_CATEGORY_LABEL, type Manuscript } from '@/types/domain/manuscript';

import { CARD_PAD, cardExtra, ManuscriptCard } from './manuscript-card';
import { ManuscriptFilterSheet } from './manuscript-filter-sheet';
import { ManuscriptViewer } from './manuscript-viewer';
import {
  activeFilterCount,
  DEFAULT_QUERY,
  DESIGNER_OPTIONS,
  FONT_OPTIONS,
  getManuscripts,
  type ManuscriptQuery,
  parseQuery,
  toParams,
} from '../api/get-manuscripts';
import { useSavedManuscripts } from '../hooks/use-saved';

const ratio = (m: Manuscript) => (1 - CARD_PAD) * (m.height / m.width) + CARD_PAD;
const plural = (n: number) =>
  n === 0 ? 'لا أعمال' : n === 1 ? 'عمل واحد' : n === 2 ? 'عملان' : n <= 10 ? `${n} أعمال` : `${n} عملاً`;
const CATS = (['all', ...MANUSCRIPT_CATEGORIES] as const).map((c) => ({
  value: c,
  label: c === 'all' ? 'الكل' : MANUSCRIPT_CATEGORY_LABEL[c],
}));
const LICENSE_CHIP = { personal: 'ترخيص شخصي', commercial: 'ترخيص تجاري' } as const;

/**
 * معرض المخطوطات بشريط المكتبة نفسه: «التصنيف» الأحمر يكشف التصنيفات، البحث، «تصفية» (العرض،
 * الترخيص، الخط، المصمّم)، والترتيب — ثم سطر الحالة بشرائح قابلة للإزالة، ثم التدفّق المتراكب.
 * كل الحالة في الرابط، قابلة للمشاركة.
 */
export function ManuscriptsBrowser() {
  const [params, setParams] = useSearchParams();
  const query = parseQuery(params);
  const saved = useSavedManuscripts();
  const savedSet = useMemo(() => new Set(saved.ids), [saved.ids]);

  const list = getManuscripts(query, savedSet);
  const openId = params.get('m');
  const open = openId ? (getManuscripts(DEFAULT_QUERY).find((m) => m.id === openId) ?? null) : null;

  const update = (patch: Partial<ManuscriptQuery> & { m?: string | null }, replace = true) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        const { m, ...q } = patch;
        const entries = Object.entries({ ...toParams(q), ...(m !== undefined && { m }) });
        for (const [k, v] of entries) {
          if (v === null || v === '') n.delete(k);
          else n.set(k, v);
        }
        return n;
      },
      { replace },
    );

  const count = activeFilterCount(query);
  const nameOf = (opts: readonly { id: string; name: string }[], id: string) => opts.find((o) => o.id === id)?.name;
  const chips = [
    ...(query.q ? [{ key: 'q', label: `«${query.q}»`, clear: () => update({ q: '' }) }] : []),
    ...(query.saved ? [{ key: 'saved', label: 'المحفوظة', clear: () => update({ saved: false }) }] : []),
    ...(query.license !== 'all'
      ? [{ key: 'lic', label: LICENSE_CHIP[query.license], clear: () => update({ license: 'all' }) }]
      : []),
    ...query.fonts.map((id) => ({
      key: `f-${id}`,
      label: nameOf(FONT_OPTIONS, id) ?? id,
      clear: () => update({ fonts: query.fonts.filter((x) => x !== id) }),
    })),
    ...query.designers.map((id) => ({
      key: `d-${id}`,
      label: nameOf(DESIGNER_OPTIONS, id) ?? id,
      clear: () => update({ designers: query.designers.filter((x) => x !== id) }),
    })),
  ];
  const clearAll = () => update({ ...DEFAULT_QUERY, sort: query.sort });

  return (
    <div className="flex flex-col gap-5">
      <div role="search" className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <CategoryToggle
          id="manuscript-cats"
          options={CATS}
          value={query.cat}
          defaultValue="all"
          onChange={(cat) => update({ cat })}
        />

        <SearchField
          label="ابحث عن مخطوطة"
          placeholder="ابحث عن لوحة أو مناسبة أو خط أو مصمّم…"
          value={query.q}
          onChange={(q) => update({ q })}
          className="min-w-45 flex-1"
        />

        <ManuscriptFilterSheet
          query={query}
          savedIds={savedSet}
          onApply={(d) => update(d)}
          trigger={
            <button
              type="button"
              className={cn(
                TOOLBAR_PILL,
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
          onChange={(sort) => update({ sort })}
          options={[
            { value: 'newest', label: 'الأحدث', icon: <TimePastIcon filled="auto" /> },
            { value: 'popular', label: 'الأكثر تحميلاً', icon: <FlameIcon filled="auto" /> },
          ]}
        />
      </div>

      {/* سطر الحالة كسطر «N نتيجة» في المكتبة: العدد + شرائح ما تغيّر (تُزال بنقرة) + «مسح الكل» */}
      <div aria-live="polite" className="flex min-h-7 flex-wrap items-center gap-2 text-meta text-muted-foreground">
        <span className="font-medium text-foreground">{plural(list.length)}</span>
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-label={`إزالة ${c.label}`}
            onClick={c.clear}
            className="group/fc inline-flex h-6 animate-pop-in items-center gap-1 rounded-full bg-tint-brand ps-2 pe-1 text-caption leading-none text-primary"
          >
            <span>{c.label}</span>
            <span className="grid size-4 place-items-center rounded-full bg-primary/15 transition-colors group-hover/fc:bg-primary-fill group-hover/fc:text-white">
              <CrossSmallIcon className="size-3" />
            </span>
          </button>
        ))}
        {(chips.length > 0 || query.cat !== 'all') && (
          <button
            type="button"
            onClick={clearAll}
            className="px-1 text-caption underline underline-offset-4 transition-colors hover:text-foreground"
          >
            مسح الكل
          </button>
        )}
      </div>

      {list.length ? (
        <Masonry
          label="المخطوطات"
          items={list}
          getKey={(m) => m.id}
          ratio={ratio}
          extra={cardExtra}
          render={(m) => (
            <ManuscriptCard
              m={m}
              saved={saved.has(m.id)}
              onSave={() => saved.toggle(m.id)}
              onOpen={() => update({ m: m.id }, false)}
            />
          )}
        />
      ) : (
        <EmptyState
          icon={query.saved ? <BookmarkIcon /> : <PictureIcon />}
          title={query.saved ? 'لا مخطوطات محفوظة هنا' : 'لا أعمال تطابق بحثك'}
          description={query.saved ? 'احفظ ما يعجبك لتجده هنا.' : 'جرّب كلمة أخرى، أو تصنيفاً آخر، أو امسح الفلاتر.'}
          action={
            <Button variant="outline" onClick={clearAll}>
              عرض كل المخطوطات
            </Button>
          }
        />
      )}

      <ManuscriptViewer
        list={list.length ? list : getManuscripts(DEFAULT_QUERY)}
        current={open}
        onChange={(m) => update({ m: m?.id ?? null })}
        saved={open ? saved.has(open.id) : false}
        onSave={() => open && saved.toggle(open.id)}
      />
    </div>
  );
}
