import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, CrossSmallIcon, RefreshIcon, TextIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';

import { LANG_SETS, type LangSetKey, TIERS, type TierKey, USE_CASES, type UseCaseKey } from '../data/catalog';

export type Brief = { useCase: UseCaseKey; lang: LangSetKey; tier: TierKey; fonts: 2 | 3 };
export type View = 'suggest' | 'saved';

const LANG_LABEL: Record<LangSetKey, string> = {
  ar: 'العربية',
  'ar-en': 'العربية والإنجليزية',
  'ar-ku': 'العربية والكردية',
};
const TIER_LABEL: Record<TierKey, string> = { all: 'مجانية ومدفوعة', free: 'مجانية', paid: 'مدفوعة' };

// نفس حبوب شريط المكتبة — حتى تبدو الأداتان من عائلة واحدة
const pill =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-control leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 active:scale-[.97]';

/** قائمة منسدلة بشكل حبّة: اسم الخيار باهت، والقيمة الحالية واضحة */
function PillSelect<K extends string>({
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
  const current = options.find(([k]) => k === value)?.[1] ?? value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${current}`}
        className={cn(
          pill,
          'group border-border bg-card outline-none hover:border-strong focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-strong dark:border-transparent dark:bg-sunken',
        )}
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{current}</span>
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52 p-1.5">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as K)}>
          {options.map(([k, text]) => (
            <DropdownMenuRadioItem key={k} value={k} className="py-2 text-control">
              {text}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * شريط «نسق»: السطر الأول يحدّد ما نقترحه (الاستخدام، اللغة، الترخيص، عدد الخطوط) ويولّد
 * دفعة جديدة؛ السطر الثاني يخصّ العرض (نص المعاينة، الاقتراحات أو المحفوظة).
 */
export function NasaqToolbar({
  brief,
  onBrief,
  onRegenerate,
  heading,
  placeholder,
  onHeading,
  view,
  onView,
  savedCount,
}: {
  brief: Brief;
  onBrief: (b: Brief) => void;
  onRegenerate: () => void;
  heading: string;
  placeholder: string;
  onHeading: (v: string) => void;
  view: View;
  onView: (v: View) => void;
  savedCount: number;
}) {
  const set =
    <K extends keyof Brief>(k: K) =>
    (v: Brief[K]) =>
      onBrief({ ...brief, [k]: v });

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="خيارات الاقتراح" className="flex flex-wrap items-center gap-2">
        <PillSelect
          label="الاستخدام"
          value={brief.useCase}
          options={(Object.keys(USE_CASES) as UseCaseKey[]).map((k) => [k, USE_CASES[k].label] as const)}
          onChange={set('useCase')}
        />
        <PillSelect
          label="اللغة"
          value={brief.lang}
          options={(Object.keys(LANG_SETS) as LangSetKey[]).map((k) => [k, LANG_LABEL[k]] as const)}
          onChange={set('lang')}
        />
        <PillSelect
          label="الترخيص"
          value={brief.tier}
          options={(Object.keys(TIERS) as TierKey[]).map((k) => [k, TIER_LABEL[k]] as const)}
          onChange={set('tier')}
        />
        <SegmentedControl
          label="عدد الخطوط"
          value={String(brief.fonts) as '2' | '3'}
          onChange={(v) => onBrief({ ...brief, fonts: Number(v) as 2 | 3 })}
          options={[
            { value: '2', label: 'خطّان' },
            { value: '3', label: '٣ خطوط' },
          ]}
        />
        <div className="flex items-center gap-3 max-lg:w-full lg:ms-auto">
          <span className="text-caption text-tertiary max-lg:hidden">
            أو اضغط{' '}
            <kbd className="rounded-xs border bg-sunken px-1.5 py-0.5 font-sans text-caption text-muted-foreground">
              مسافة
            </kbd>
          </span>
          <button
            type="button"
            onClick={onRegenerate}
            className={cn(
              pill,
              'group/re border-transparent bg-primary px-5 font-medium text-primary-foreground hover:bg-harf-600 max-lg:flex-1 max-lg:justify-center',
            )}
          >
            <RefreshIcon className="size-4 transition-transform duration-(--dur-slow) ease-out-quint group-active/re:-rotate-180" />
            تركيبات جديدة
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            pill,
            'min-w-0 flex-1 basis-64 cursor-text border-border bg-card pe-1.5 focus-within:border-strong focus-within:ring-2 focus-within:ring-ring/30 dark:border-transparent dark:bg-sunken',
          )}
        >
          <TextIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="sr-only">نص المعاينة</span>
          <input
            value={heading}
            onChange={(e) => onHeading(e.target.value.slice(0, 60))}
            placeholder={`اكتب نصّك — ${placeholder}`}
            maxLength={60}
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-control outline-none placeholder:text-tertiary"
          />
          {heading && (
            <button
              type="button"
              onClick={() => onHeading('')}
              aria-label="النص الافتراضي"
              title="النص الافتراضي"
              className="grid size-8 shrink-0 animate-pop-in place-items-center rounded-full text-muted-foreground hover:bg-sunken hover:text-foreground"
            >
              <CrossSmallIcon className="size-4" />
            </button>
          )}
        </label>
        <SegmentedControl
          label="العرض"
          value={view}
          onChange={onView}
          options={[
            { value: 'suggest', label: 'الاقتراحات' },
            { value: 'saved', label: `المحفوظة${savedCount ? ` (${savedCount})` : ''}` },
          ]}
        />
      </div>
    </div>
  );
}
