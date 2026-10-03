import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { type ReactElement, type ReactNode, useMemo, useState } from 'react';

import { PanelSheetContent } from '@/components/shared/panel-sheet';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { CrossIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { type Brief, DEFAULT_BRIEF, FONTS_LABEL, LANG_LABEL, TIER_LABEL } from '../data/brief';
import { FAMILIES, LANG_SETS, type LangSetKey, TIERS, type TierKey, USE_CASES, type UseCaseKey } from '../data/catalog';
import { rankPairs } from '../utils/pairing';

type Draft = Pick<Brief, 'useCase' | 'lang' | 'tier' | 'fonts'>;

/**
 * خيارات التركيب في لوحة التصفية نفسها (الهيكل والمقاسات): الاستخدام، اللغة، الترخيص، عدد الخطوط.
 * تُطبَّق بزرّ واحد، ويقول الزرّ مسبقاً إن كانت الخيارات لا تعطي أي تركيبة.
 */
export function NasaqOptionsSheet({
  brief,
  onApply,
  trigger,
}: {
  brief: Brief;
  onApply: (b: Brief) => void;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(brief);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const dirty =
    draft.useCase !== DEFAULT_BRIEF.useCase ||
    draft.lang !== DEFAULT_BRIEF.lang ||
    draft.tier !== DEFAULT_BRIEF.tier ||
    draft.fonts !== DEFAULT_BRIEF.fonts;

  const possible = useMemo(
    () =>
      open
        ? rankPairs(FAMILIES, {
            useCase: USE_CASES[draft.useCase],
            tiers: TIERS[draft.tier].tiers,
            scripts: LANG_SETS[draft.lang].scripts,
          }).length
        : 0,
    [open, draft.useCase, draft.tier, draft.lang],
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) setDraft(brief);
        setOpen(v);
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <PanelSheetContent>
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <SheetTitle className="flex-1 text-lg font-semibold">الخيارات</SheetTitle>
          <SheetDescription className="sr-only">
            اختر الاستخدام واللغات والترخيص وعدد الخطوط في كل تركيبة
          </SheetDescription>
          <button
            type="button"
            disabled={!dirty}
            onClick={() =>
              setDraft({
                useCase: DEFAULT_BRIEF.useCase,
                lang: DEFAULT_BRIEF.lang,
                tier: DEFAULT_BRIEF.tier,
                fonts: DEFAULT_BRIEF.fonts,
              })
            }
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
          <Section title="الاستخدام" hint="نختار خطوطاً تناسب طبيعة التصميم">
            <ChipGroup
              type="single"
              aria-label="الاستخدام"
              value={draft.useCase}
              onValueChange={(v) => v && patch({ useCase: v as UseCaseKey })}
            >
              {(Object.keys(USE_CASES) as UseCaseKey[]).map((k) => (
                <Chip key={k} value={k}>
                  {USE_CASES[k].label}
                </Chip>
              ))}
            </ChipGroup>
          </Section>
          <Section title="اللغة" hint="تظهر الخطوط التي تدعم كل اللغات المختارة">
            <Toggle
              label="اللغة"
              value={draft.lang}
              options={(Object.keys(LANG_SETS) as LangSetKey[]).map((k) => [k, LANG_LABEL[k]])}
              onChange={(lang) => patch({ lang })}
            />
          </Section>
          <Section title="الترخيص" hint="المجانية تُحمَّل من حرف مباشرة، والمدفوعة تُشترى من السلة">
            <Toggle
              label="الترخيص"
              value={draft.tier}
              options={(Object.keys(TIERS) as TierKey[]).map((k) => [k, TIER_LABEL[k]])}
              onChange={(tier) => patch({ tier })}
            />
          </Section>
          <Section title="عدد الخطوط" hint="الثالث للعناوين الفرعية، بين العنوان والمتن">
            <Toggle
              label="عدد الخطوط"
              value={String(draft.fonts) as '2' | '3'}
              options={[
                ['2', FONTS_LABEL[2]],
                ['3', FONTS_LABEL[3]],
              ]}
              onChange={(v) => patch({ fonts: Number(v) as 2 | 3 })}
            />
          </Section>
        </div>

        <div className="border-t px-5 py-4">
          <Button
            size="lg"
            className="w-full"
            disabled={possible === 0}
            onClick={() => {
              onApply({ ...brief, ...draft });
              setOpen(false);
            }}
          >
            <span aria-live="polite">{possible === 0 ? 'لا تركيبات لهذه الخيارات' : 'عرض التركيبات'}</span>
          </Button>
        </div>
      </PanelSheetContent>
    </Sheet>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="py-5">
      <div className="mb-3.5">
        <h3 className="text-control font-semibold">{title}</h3>
        {hint && <p className="mt-0.5 text-caption text-tertiary">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** نفس مبدّل «الرخصة» في لوحة التصفية */
function Toggle<K extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: K;
  options: readonly (readonly [K, string])[];
  onChange: (v: K) => void;
}) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(v) => v && onChange(v as K)}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-sunken p-1"
    >
      {options.map(([k, text]) => (
        <ToggleGroupPrimitive.Item
          key={k}
          value={k}
          className="h-9 rounded-full px-2 text-control whitespace-nowrap text-muted-foreground transition-[background-color,color,box-shadow] duration-(--dur-base) hover:text-foreground data-[state=on]:bg-paper data-[state=on]:font-medium data-[state=on]:text-paper-foreground data-[state=on]:shadow-soft"
        >
          {text}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
