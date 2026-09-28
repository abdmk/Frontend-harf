import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { type ReactElement, type ReactNode, useState } from 'react';

import { RangeField } from '@/components/shared/range-field';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { ChevronUpIcon, CrossIcon, FilterIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { below } from '@/design-system/tokens';
import {
  type CatalogQuery,
  DATE_RANGES,
  type DateRange,
  DEFAULT_QUERY,
  LICENSE_FILTERS,
  type LicenseFilter,
  PRICE_STOPS,
  WEIGHT_STOPS,
} from '@/features/catalog/types/catalog-query';
import { DATE_LABEL, LICENSE_FILTER_LABEL } from '@/features/catalog/utils/labels';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/cn';
import { weightsLabel } from '@/lib/format';
import { LANG_LABEL } from '@/lib/labels';
import { LANGS, type Lang } from '@/types/domain/font';

import { useCatalog } from './catalog-context';

type Draft = Pick<CatalogQuery, 'license' | 'lang' | 'date' | 'price' | 'weights'>;
const pick = (q: CatalogQuery): Draft => ({
  license: q.license,
  lang: q.lang,
  date: q.date,
  price: q.price,
  weights: q.weights,
});

/**
 * لوحة التصفية: نافذة في منتصف الشاشة على الشاشات الواسعة وورقة سفلية على الجوال.
 * التعديلات مسودّة محلية حتى «تطبيق» — فلا تتغيّر النتائج مع كل نقرة.
 */
export function FilterSheet({ trigger }: { trigger: ReactElement }) {
  const { query, setQuery } = useCatalog();
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery(below('sm'));
  const [draft, setDraft] = useState<Draft>(() => pick(query));

  function handleOpen(v: boolean) {
    if (v) setDraft(pick(query));
    setOpen(v);
  }

  // الزرّ داخل SheetTrigger كي يعيد Radix التركيز إليه عند الإغلاق
  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side={mobile ? 'bottom' : 'center'}
        showCloseButton={false}
        className={cn(
          'gap-0 border bg-sheet p-0 shadow-overlay',
          mobile
            ? 'max-h-[92dvh] rounded-t-xl data-[state=open]:duration-500'
            : 'max-h-[min(820px,calc(100dvh-2rem))] w-[min(480px,calc(100vw-2rem))]',
        )}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-medium">
            <FilterIcon className="size-5" />
            تصفية
          </SheetTitle>
          <SheetDescription className="sr-only">
            اختر الرخصة واللغة وتاريخ النشر ونطاق السعر وعدد الأوزان
          </SheetDescription>
          <SheetClose
            aria-label="إغلاق"
            className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
          >
            <CrossIcon className="size-4.5" />
          </SheetClose>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-4">
          <Section title="الرخصة">
            <ChipGroup
              type="single"
              aria-label="الرخصة"
              value={draft.license}
              onValueChange={(v) => v && setDraft((d) => ({ ...d, license: v as LicenseFilter }))}
            >
              {LICENSE_FILTERS.map((v) => (
                <Chip key={v} value={v}>
                  {LICENSE_FILTER_LABEL[v]}
                </Chip>
              ))}
            </ChipGroup>
          </Section>

          <Section title="اللغة">
            <ChipGroup
              type="multiple"
              aria-label="اللغة"
              value={draft.lang}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, lang: v.filter((x): x is Lang => (LANGS as readonly string[]).includes(x)) }))
              }
            >
              {LANGS.map((l) => (
                <Chip key={l} value={l}>
                  {LANG_LABEL[l]}
                </Chip>
              ))}
            </ChipGroup>
          </Section>

          <Section title="تاريخ النشر">
            <ChipGroup
              type="single"
              aria-label="تاريخ النشر"
              value={draft.date}
              onValueChange={(v) => v && setDraft((d) => ({ ...d, date: v as DateRange }))}
            >
              {DATE_RANGES.map((v) => (
                <Chip key={v} value={v}>
                  {DATE_LABEL[v]}
                </Chip>
              ))}
            </ChipGroup>
          </Section>

          <Section title="نطاق السعر">
            <RangeField
              stops={PRICE_STOPS}
              value={draft.price}
              onChange={(price) => setDraft((d) => ({ ...d, price }))}
              format={(v) => `$${v}`}
              labels={['أدنى سعر', 'أعلى سعر']}
            />
          </Section>

          <Section title="الأوزان">
            <RangeField
              stops={WEIGHT_STOPS}
              value={draft.weights}
              onChange={(weights) => setDraft((d) => ({ ...d, weights }))}
              format={weightsLabel}
              labels={['أقلّ عدد أوزان', 'أكثر عدد أوزان']}
            />
          </Section>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-5">
          <Button
            size="xl"
            onClick={() => {
              setQuery(draft);
              setOpen(false);
            }}
          >
            تطبيق
          </Button>
          <Button
            size="xl"
            variant="secondary"
            className="border-transparent text-muted-foreground"
            onClick={() => setDraft(pick(DEFAULT_QUERY))}
          >
            مسح الكل
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** قسم قابل للطيّ بارتفاع متحرّك */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <CollapsiblePrimitive.Root defaultOpen className="rounded-lg bg-sunken px-2 pb-2">
      <h3>
        <CollapsiblePrimitive.Trigger className="group/sec flex w-full items-center justify-between rounded-md px-3 py-4 text-start text-base font-medium">
          {title}
          <span className="grid size-7 place-items-center rounded-full bg-card text-muted-foreground transition-transform duration-300 ease-out-quint group-data-[state=closed]/sec:rotate-180 dark:bg-inset">
            <ChevronUpIcon className="size-4" />
          </span>
        </CollapsiblePrimitive.Trigger>
      </h3>
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="rounded-md bg-sheet-inset p-5">{children}</div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
