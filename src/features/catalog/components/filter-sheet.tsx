import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { type ReactElement, useMemo, useState } from 'react';

import { FilterSection } from '@/components/shared/filter-section';
import { PanelSheetContent } from '@/components/shared/panel-sheet';
import { RangeField } from '@/components/shared/range-field';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { CrossIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getFonts } from '@/features/catalog/api/get-fonts';
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
import { activeFilterCount } from '@/features/catalog/utils/filter-fonts';
import { DATE_LABEL, LICENSE_FILTER_LABEL } from '@/features/catalog/utils/labels';
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

const EMPTY = pick(DEFAULT_QUERY);

/** «عرض 5 نتائج» بصيغ العدد العربية */
function showLabel(n: number) {
  if (n === 0) return 'لا توجد نتائج مطابقة';
  if (n === 1) return 'عرض نتيجة واحدة';
  if (n === 2) return 'عرض نتيجتين';
  if (n <= 10) return `عرض ${n} نتائج`;
  return `عرض ${n} نتيجة`;
}

/**
 * لوحة التصفية: نافذة في منتصف الشاشة على الشاشات الواسعة وورقة سفلية على الجوال.
 * أقسام مسطّحة بفواصل رفيعة (بلا صناديق متداخلة ولا طيّ)، لكل قسم «إعادة» حين يتغيّر،
 * وزرّ التطبيق يعرض عدد النتائج قبل تطبيقها. التعديلات مسودّة محلية حتى الضغط عليه.
 */
export function FilterSheet({ trigger }: { trigger: ReactElement }) {
  const { query, setQuery } = useCatalog();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => pick(query));
  // معاينة العدد على بيانات العرض؛ مع خادم حقيقي تصير طلب عدٍّ مؤجَّلاً (debounced)
  const total = useMemo(() => (open ? getFonts({ ...query, ...draft }).length : 0), [open, query, draft]);
  const dirty = activeFilterCount({ ...DEFAULT_QUERY, ...draft }) > 0;
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  function handleOpen(v: boolean) {
    if (v) setDraft(pick(query));
    setOpen(v);
  }

  // الزرّ داخل SheetTrigger كي يعيد Radix التركيز إليه عند الإغلاق
  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <PanelSheetContent>
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <SheetTitle className="flex-1 text-lg font-semibold">تصفية</SheetTitle>
          <SheetDescription className="sr-only">
            اختر الرخصة واللغة وتاريخ النشر ونطاق السعر وعدد الأوزان
          </SheetDescription>
          <button
            type="button"
            disabled={!dirty}
            onClick={() => setDraft(EMPTY)}
            className="rounded-full px-3 py-1.5 text-meta font-medium text-primary transition-[color,background-color,opacity] hover:bg-tint-brand disabled:pointer-events-none disabled:opacity-0"
          >
            مسح الكل
          </button>
          <SheetClose
            aria-label="إغلاق"
            className="-me-2 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
          >
            <CrossIcon className="size-4.5" />
          </SheetClose>
        </div>

        <div className="scroll-none flex-1 divide-y overflow-y-auto overscroll-contain px-5">
          <FilterSection title="الرخصة" onReset={draft.license !== 'all' ? () => patch({ license: 'all' }) : undefined}>
            <ToggleGroupPrimitive.Root
              type="single"
              aria-label="الرخصة"
              value={draft.license}
              onValueChange={(v) => v && patch({ license: v as LicenseFilter })}
              className="grid grid-cols-4 gap-1 rounded-full bg-sunken p-1"
            >
              {LICENSE_FILTERS.map((v) => (
                <ToggleGroupPrimitive.Item
                  key={v}
                  value={v}
                  className="h-9 rounded-full text-control text-muted-foreground transition-[background-color,color,box-shadow] duration-(--dur-base) hover:text-foreground data-[state=on]:bg-paper data-[state=on]:font-medium data-[state=on]:text-paper-foreground data-[state=on]:shadow-soft"
                >
                  {LICENSE_FILTER_LABEL[v]}
                </ToggleGroupPrimitive.Item>
              ))}
            </ToggleGroupPrimitive.Root>
          </FilterSection>

          <FilterSection
            title="اللغة"
            hint="تظهر الخطوط التي تدعم كل اللغات المختارة"
            onReset={draft.lang.length ? () => patch({ lang: [] }) : undefined}
          >
            <ChipGroup
              type="multiple"
              aria-label="اللغة"
              value={draft.lang}
              onValueChange={(v) =>
                patch({ lang: v.filter((x): x is Lang => (LANGS as readonly string[]).includes(x)) })
              }
            >
              {LANGS.map((l) => (
                <Chip key={l} value={l}>
                  {LANG_LABEL[l]}
                </Chip>
              ))}
            </ChipGroup>
          </FilterSection>

          <FilterSection title="تاريخ النشر" onReset={draft.date !== 'all' ? () => patch({ date: 'all' }) : undefined}>
            <ChipGroup
              type="single"
              aria-label="تاريخ النشر"
              value={draft.date}
              onValueChange={(v) => v && patch({ date: v as DateRange })}
            >
              {DATE_RANGES.map((v) => (
                <Chip key={v} value={v}>
                  {DATE_LABEL[v]}
                </Chip>
              ))}
            </ChipGroup>
          </FilterSection>

          <FilterSection title="نطاق السعر" onReset={draft.price ? () => patch({ price: undefined }) : undefined}>
            <RangeField
              stops={PRICE_STOPS}
              value={draft.price}
              onChange={(price) => patch({ price })}
              format={(v) => `$${v}`}
              labels={['أدنى سعر', 'أعلى سعر']}
            />
          </FilterSection>

          <FilterSection title="الأوزان" onReset={draft.weights ? () => patch({ weights: undefined }) : undefined}>
            <RangeField
              stops={WEIGHT_STOPS}
              value={draft.weights}
              onChange={(weights) => patch({ weights })}
              format={weightsLabel}
              labels={['أقلّ عدد أوزان', 'أكثر عدد أوزان']}
            />
          </FilterSection>
        </div>

        <div className="border-t px-5 py-4">
          <Button
            size="lg"
            className="w-full"
            disabled={total === 0}
            onClick={() => {
              setQuery(draft);
              setOpen(false);
            }}
          >
            <span aria-live="polite">{showLabel(total)}</span>
          </Button>
        </div>
      </PanelSheetContent>
    </Sheet>
  );
}
