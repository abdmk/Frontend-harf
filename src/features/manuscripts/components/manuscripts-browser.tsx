import { type ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Masonry } from '@/components/shared/masonry';
import { SearchField } from '@/components/shared/search-field';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, CrossSmallIcon, FlameIcon, PictureIcon, TimePastIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';
import { MANUSCRIPT_CATEGORIES, MANUSCRIPT_CATEGORY_LABEL, type Manuscript } from '@/types/domain/manuscript';

import { CARD_FOOTER, CARD_PAD, ManuscriptCard } from './manuscript-card';
import { ManuscriptViewer } from './manuscript-viewer';
import { countByCategory, DEFAULT_QUERY, getManuscripts, parseQuery } from '../api/get-manuscripts';
import { useSavedManuscripts } from '../hooks/use-saved';

const pill =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-control leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-(--dur-fast) active:scale-[.97]';

const ratio = (m: Manuscript) => (1 - CARD_PAD) * (m.height / m.width) + CARD_PAD;
const plural = (n: number) =>
  n === 0 ? 'لا أعمال' : n === 1 ? 'عمل واحد' : n === 2 ? 'عملان' : n <= 10 ? `${n} أعمال` : `${n} عملاً`;

/**
 * معرض المخطوطات: شريط بنمط شريط المكتبة، شرائح التصنيفات، ثم تدفّق متراكب (Masonry) يحترم
 * نسب كل عمل. كل الحالة في الرابط (بحث، تصنيف، ترتيب، المحفوظة، العمل المفتوح) — قابلة للمشاركة.
 */
export function ManuscriptsBrowser({ action }: { action?: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const query = parseQuery(params);
  const savedView = params.get('view') === 'saved';
  const saved = useSavedManuscripts();
  const counts = useMemo(() => countByCategory(), []);

  const all = getManuscripts(query);
  const list = savedView ? all.filter((m) => saved.has(m.id)) : all;
  const openId = params.get('m');
  const open = openId ? (getManuscripts(DEFAULT_QUERY).find((m) => m.id === openId) ?? null) : null;

  const update = (patch: Record<string, string | null>, replace = true) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        for (const [k, v] of Object.entries(patch)) {
          if (v === null || v === '' || (k === 'cat' && v === 'all') || (k === 'sort' && v === 'newest')) n.delete(k);
          else n.set(k, v);
        }
        return n;
      },
      { replace },
    );
  const active = query.q || query.cat !== 'all' || savedView;

  return (
    <div className="flex flex-col gap-5">
      <div role="search" className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <SearchField
          label="ابحث عن مخطوطة"
          placeholder="ابحث عن لوحة أو مناسبة أو خط…"
          value={query.q}
          onChange={(q) => update({ q })}
          className="min-w-45 flex-1"
        />
        <button
          type="button"
          aria-pressed={savedView}
          onClick={() => update({ view: savedView ? null : 'saved' })}
          className={cn(
            pill,
            savedView
              ? 'border-primary bg-card font-medium text-primary dark:bg-paper dark:text-harf-600'
              : 'border-border bg-card hover:border-strong dark:border-transparent dark:bg-sunken',
          )}
        >
          <BookmarkIcon className={cn('size-4', savedView && '[&_path]:fill-current')} />
          المحفوظة
          {saved.ids.length > 0 && (
            <span dir="ltr" className={cn('text-caption text-tertiary tabular-nums', savedView && 'dark:text-n-600')}>
              {saved.ids.length}
            </span>
          )}
        </button>
        <SegmentedControl
          label="الترتيب"
          value={query.sort}
          onChange={(sort) => update({ sort })}
          options={[
            { value: 'newest', label: 'الأحدث', icon: <TimePastIcon /> },
            { value: 'popular', label: 'الأكثر تحميلاً', icon: <FlameIcon /> },
          ]}
        />
        {action}
      </div>

      <div className="-m-1 [scrollbar-width:none] overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden">
        <div role="group" aria-label="التصنيفات" className="flex w-max gap-2">
          {(['all', ...MANUSCRIPT_CATEGORIES] as const).map((c) => {
            const on = query.cat === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => update({ cat: c })}
                className={cn(
                  pill,
                  on
                    ? 'border-primary bg-card font-medium text-primary dark:bg-paper dark:text-harf-600'
                    : 'border-border bg-card text-muted-foreground hover:border-strong hover:text-foreground dark:border-transparent dark:bg-sunken',
                )}
              >
                {c === 'all' ? 'الكل' : MANUSCRIPT_CATEGORY_LABEL[c]}
                <span dir="ltr" className={cn('text-caption text-tertiary tabular-nums', on && 'dark:text-n-600')}>
                  {counts.get(c) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className="flex min-h-7 flex-wrap items-center gap-2 text-meta text-muted-foreground">
        <span className="font-medium text-foreground">{plural(list.length)}</span>
        {query.q && (
          <button
            type="button"
            aria-label={`إزالة البحث ${query.q}`}
            onClick={() => update({ q: null })}
            className="inline-flex h-6 animate-pop-in items-center gap-1 rounded-full bg-tint-brand ps-2 pe-1 text-caption text-primary"
          >
            «{query.q}»
            <CrossSmallIcon className="size-3.5" />
          </button>
        )}
        {active && (
          <button
            type="button"
            onClick={() => update({ q: null, cat: null, view: null })}
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
          extra={CARD_FOOTER}
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
          icon={savedView ? <BookmarkIcon /> : <PictureIcon />}
          title={savedView ? 'لا مخطوطات محفوظة بعد' : 'لا أعمال تطابق بحثك'}
          description={savedView ? 'احفظ ما يعجبك لتجده هنا.' : 'جرّب كلمة أخرى، أو تصنيفاً آخر، أو امسح البحث.'}
          action={
            <Button variant="outline" onClick={() => update({ q: null, cat: null, view: null })}>
              عرض كل المخطوطات
            </Button>
          }
        />
      )}

      <ManuscriptViewer
        list={list.length ? list : all}
        current={open}
        onChange={(m) => update({ m: m?.id ?? null })}
        saved={open ? saved.has(open.id) : false}
        onSave={() => open && saved.toggle(open.id)}
      />
    </div>
  );
}
