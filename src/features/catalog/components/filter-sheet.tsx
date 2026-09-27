'use client';

import {
  Collapsible as CollapsiblePrimitive,
  RadioGroup as RadioGroupPrimitive,
  Slider as SliderPrimitive,
} from 'radix-ui';
import { type ReactElement, type ReactNode, useState } from 'react';

import { CheckIcon, ChevronUpIcon, CrossIcon, FilterIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
 * لوحة التصفية: درج جانبي على الشاشات الواسعة وورقة سفلية على الجوال.
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
        side={mobile ? 'bottom' : 'left'}
        showCloseButton={false}
        className={cn(
          'gap-0 border bg-sheet p-0 shadow-overlay data-[state=open]:duration-500',
          mobile
            ? 'max-h-[92dvh] rounded-t-xl'
            : 'inset-y-3 left-3 h-auto w-[min(440px,calc(100vw-24px))] rounded-xl sm:max-w-none',
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
            <RadioGroupPrimitive.Root
              aria-label="الرخصة"
              value={draft.license}
              onValueChange={(v) => setDraft((d) => ({ ...d, license: v as LicenseFilter }))}
              className="flex flex-col gap-3"
            >
              {LICENSE_FILTERS.map((v) => (
                <label key={v} className="flex w-fit cursor-pointer items-center gap-3 text-lead">
                  <RadioGroupPrimitive.Item
                    value={v}
                    className="size-5 rounded-full border-[1.5px] border-strong bg-card transition-[border-width,border-color] duration-200 ease-pop data-[state=checked]:border-[5px] data-[state=checked]:border-primary"
                  />
                  {LICENSE_FILTER_LABEL[v]}
                </label>
              ))}
            </RadioGroupPrimitive.Root>
          </Section>

          <Section title="اللغة">
            <ToggleGroup
              type="multiple"
              aria-label="اللغة"
              value={draft.lang}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, lang: v.filter((x): x is Lang => (LANGS as readonly string[]).includes(x)) }))
              }
              className="flex w-auto flex-wrap gap-2 shadow-none"
            >
              {LANGS.map((l) => (
                <ChipItem key={l} value={l} label={LANG_LABEL[l]} />
              ))}
            </ToggleGroup>
          </Section>

          <Section title="تاريخ النشر">
            <ToggleGroup
              type="single"
              aria-label="تاريخ النشر"
              value={draft.date}
              onValueChange={(v) => v && setDraft((d) => ({ ...d, date: v as DateRange }))}
              className="flex w-auto flex-wrap gap-2 shadow-none"
            >
              {DATE_RANGES.map((v) => (
                <ChipItem key={v} value={v} label={DATE_LABEL[v]} />
              ))}
            </ToggleGroup>
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
          <button
            type="button"
            onClick={() => {
              setQuery(draft);
              setOpen(false);
            }}
            className="h-14 rounded-md bg-primary text-lead font-medium text-white transition-[background-color,transform] hover:bg-harf-600 active:scale-[.98]"
          >
            تطبيق
          </button>
          <button
            type="button"
            onClick={() => setDraft(pick(DEFAULT_QUERY))}
            className="h-14 rounded-md bg-sunken text-lead font-medium text-muted-foreground transition-[background-color,transform] hover:bg-inset hover:text-foreground active:scale-[.98]"
          >
            مسح الكل
          </button>
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

/** شريحة اختيار: حدّ رفيع، وتمتلئ بالأحمر مع علامة ✓ حين تُختار */
function ChipItem({ value, label }: { value: string; label: string }) {
  return (
    <ToggleGroupItem
      value={value}
      className={cn(
        'group/chip h-8 flex-none gap-0 rounded-full border border-border bg-transparent px-4 text-meta font-normal text-muted-foreground shadow-none transition-[background-color,border-color,color,gap] duration-200',
        'first:rounded-full last:rounded-full hover:border-strong hover:bg-transparent hover:text-foreground',
        'data-[state=on]:gap-1.5 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-white',
      )}
    >
      <CheckIcon className="size-3.5 w-0 scale-50 opacity-0 transition-[width,transform,opacity] duration-300 ease-pop group-data-[state=on]/chip:w-3.5 group-data-[state=on]/chip:scale-100 group-data-[state=on]/chip:opacity-100" />
      {label}
    </ToggleGroupItem>
  );
}

/** مدى بمقبضين على مسار عريض بنقاط لكل خطوة — القيمة null تعني «بلا فلتر» */
function RangeField({
  stops,
  value,
  onChange,
  format,
  labels,
}: {
  stops: readonly number[];
  value: [number, number] | undefined;
  onChange: (v: [number, number] | undefined) => void;
  format: (v: number) => string;
  labels: [string, string];
}) {
  const max = stops.length - 1;
  const idx: [number, number] = value ? [stops.indexOf(value[0]), stops.indexOf(value[1])] : [0, max];
  return (
    <div dir="ltr">
      <SliderPrimitive.Root
        dir="ltr"
        min={0}
        max={max}
        step={1}
        minStepsBetweenThumbs={0}
        value={idx}
        onValueChange={([a = 0, b = max]) => onChange(a === 0 && b === max ? undefined : [stops[a]!, stops[b]!])}
        className="relative flex h-5 w-full touch-none items-center select-none"
      >
        <SliderPrimitive.Track className="relative h-5 w-full overflow-hidden rounded-full bg-sunken">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-between px-[7.5px]"
          >
            {stops.map((_, i) => (
              <i
                key={i}
                className={cn('size-1.25 rounded-full', i >= idx[0] && i <= idx[1] ? 'bg-white/55' : 'bg-strong')}
              />
            ))}
          </span>
        </SliderPrimitive.Track>
        {idx.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={labels[i]}
            aria-valuetext={format(stops[v]!)}
            className="grid size-5 cursor-grab place-items-center rounded-full outline-none active:cursor-grabbing"
          >
            <span className="size-2 rounded-full bg-white transition-transform duration-200 ease-pop in-focus-visible:scale-150 in-active:scale-150" />
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      <div className="mt-4 flex justify-between gap-3">
        {idx.map((v, i) => (
          <span
            key={i}
            className="inline-flex h-10 min-w-21 items-center justify-center rounded-full border px-5 text-sm text-muted-foreground"
            dir="rtl"
          >
            {format(stops[v]!)}
          </span>
        ))}
      </div>
    </div>
  );
}
