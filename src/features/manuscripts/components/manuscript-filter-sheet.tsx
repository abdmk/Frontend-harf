import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { type ReactElement, useMemo, useState } from 'react';

import { FilterSection } from '@/components/shared/filter-section';
import { PanelSheetContent } from '@/components/shared/panel-sheet';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { CrossIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Manuscript } from '@/types/domain/manuscript';

import {
  activeFilterCount,
  DEFAULT_QUERY,
  DESIGNER_OPTIONS,
  FONT_OPTIONS,
  getManuscripts,
  type LicenseFilter,
  type ManuscriptQuery,
} from '../api/get-manuscripts';

type Draft = Pick<ManuscriptQuery, 'saved' | 'license' | 'fonts' | 'designers'>;
const pick = (q: ManuscriptQuery): Draft => ({
  saved: q.saved,
  license: q.license,
  fonts: q.fonts,
  designers: q.designers,
});
const EMPTY = pick(DEFAULT_QUERY);

const LICENSE_LABEL: Record<LicenseFilter, string> = { all: 'الكل', personal: 'شخصي', commercial: 'تجاري & شخصي' };

function showLabel(n: number) {
  if (n === 0) return 'لا أعمال مطابقة';
  if (n === 1) return 'عرض عمل واحد';
  if (n === 2) return 'عرض عملين';
  if (n <= 10) return `عرض ${n} أعمال`;
  return `عرض ${n} عملاً`;
}

const segment =
  'h-9 rounded-full text-control text-muted-foreground transition-[background-color,color,box-shadow] duration-(--dur-base) hover:text-foreground data-[state=on]:bg-paper data-[state=on]:font-medium data-[state=on]:text-paper-foreground data-[state=on]:shadow-soft';

/**
 * لوحة تصفية المخطوطات بهيكل لوحة المكتبة ومقاساتها: العرض (الكل/المحفوظة)، الترخيص، الخط، المصمّم.
 * المسودّة محلية حتى «عرض N»، والزرّ يقول العدد قبل التطبيق.
 */
export function ManuscriptFilterSheet({
  query,
  savedIds,
  published,
  onApply,
  trigger,
}: {
  query: ManuscriptQuery;
  savedIds: ReadonlySet<string>;
  published: readonly Manuscript[];
  onApply: (d: Draft) => void;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => pick(query));
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const total = useMemo(
    () => (open ? getManuscripts({ ...query, ...draft }, savedIds, published).length : 0),
    [open, query, draft, savedIds, published],
  );
  const dirty = activeFilterCount({ ...DEFAULT_QUERY, ...draft }) > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) setDraft(pick(query));
        setOpen(v);
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <PanelSheetContent>
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <SheetTitle className="flex-1 text-lg font-semibold">تصفية</SheetTitle>
          <SheetDescription className="sr-only">اختر العرض والترخيص والخط والمصمّم</SheetDescription>
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

        <div className="flex-1 divide-y overflow-y-auto overscroll-contain px-5">
          <FilterSection
            title="العرض"
            hint="المحفوظة في هذا المتصفّح"
            onReset={draft.saved ? () => patch({ saved: false }) : undefined}
          >
            <ToggleGroupPrimitive.Root
              type="single"
              aria-label="العرض"
              value={draft.saved ? 'saved' : 'all'}
              onValueChange={(v) => v && patch({ saved: v === 'saved' })}
              className="grid grid-cols-2 gap-1 rounded-full bg-sunken p-1"
            >
              <ToggleGroupPrimitive.Item value="all" className={segment}>
                كل الأعمال
              </ToggleGroupPrimitive.Item>
              <ToggleGroupPrimitive.Item value="saved" className={segment}>
                المحفوظة{savedIds.size ? ` (${savedIds.size})` : ''}
              </ToggleGroupPrimitive.Item>
            </ToggleGroupPrimitive.Root>
          </FilterSection>

          <FilterSection
            title="الترخيص"
            onReset={draft.license !== 'all' ? () => patch({ license: 'all' }) : undefined}
          >
            <ToggleGroupPrimitive.Root
              type="single"
              aria-label="الترخيص"
              value={draft.license}
              onValueChange={(v) => v && patch({ license: v as LicenseFilter })}
              className="grid grid-cols-3 gap-1 rounded-full bg-sunken p-1"
            >
              {(Object.keys(LICENSE_LABEL) as LicenseFilter[]).map((k) => (
                <ToggleGroupPrimitive.Item key={k} value={k} className={segment}>
                  {LICENSE_LABEL[k]}
                </ToggleGroupPrimitive.Item>
              ))}
            </ToggleGroupPrimitive.Root>
          </FilterSection>

          <FilterSection
            title="الخط"
            hint="الأعمال المكتوبة بأيٍّ من الخطوط المختارة"
            onReset={draft.fonts.length ? () => patch({ fonts: [] }) : undefined}
          >
            <ChipGroup
              type="multiple"
              aria-label="الخط"
              value={draft.fonts}
              onValueChange={(fonts) => patch({ fonts })}
            >
              {FONT_OPTIONS.map((f) => (
                <Chip key={f.id} value={f.id}>
                  {f.name}
                </Chip>
              ))}
            </ChipGroup>
          </FilterSection>

          <FilterSection title="المصمّم" onReset={draft.designers.length ? () => patch({ designers: [] }) : undefined}>
            <ChipGroup
              type="multiple"
              aria-label="المصمّم"
              value={draft.designers}
              onValueChange={(designers) => patch({ designers })}
            >
              {DESIGNER_OPTIONS.map((d) => (
                <Chip key={d.id} value={d.id}>
                  {d.name}
                </Chip>
              ))}
            </ChipGroup>
          </FilterSection>
        </div>

        <div className="border-t px-5 py-4">
          <Button
            size="lg"
            className="w-full"
            disabled={total === 0}
            onClick={() => {
              onApply(draft);
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
