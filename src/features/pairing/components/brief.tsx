import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon } from '@/components/ui/icons';

import { LANG_SETS, type LangSetKey, TIERS, type TierKey, USE_CASES, type UseCaseKey } from '../data/catalog';

export type Brief = { useCase: UseCaseKey; lang: LangSetKey; tier: TierKey; fonts: 2 | 3 };

const FONT_COUNT = { 2: 'خطّين', 3: 'ثلاثة خطوط' } as const;
const LANG_WORD: Record<LangSetKey, string> = {
  ar: 'العربية',
  'ar-en': 'العربية والإنجليزية',
  'ar-ku': 'العربية والكردية',
};
const TIER_WORD: Record<TierKey, string> = { all: 'مجانية ومدفوعة', free: 'مجانية', paid: 'مدفوعة' };

/** كلمة قابلة للاختيار داخل الجملة: تبدو جزءاً من النص، وتفتح قائمة خياراتها */
function Pick<K extends string>({
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
        className="group inline-flex items-center gap-1 rounded-sm px-1 text-primary underline decoration-primary/40 decoration-dashed decoration-2 underline-offset-8 transition-colors outline-none hover:decoration-primary focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:decoration-primary"
      >
        {current}
        <ChevronDownIcon className="size-4 shrink-0 opacity-60 transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
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
 * «الموجز»: الخيارات جملة تُقرأ كطلب — «أصمّم هوية بصرية بالعربية، بخطوط مجانية، من خطّين».
 * كل كلمة ملوّنة تفتح خياراتها، والاقتراحات تتحدّث فوراً.
 */
export function BriefSentence({ value, onChange }: { value: Brief; onChange: (b: Brief) => void }) {
  const set =
    <K extends keyof Brief>(k: K) =>
    (v: Brief[K]) =>
      onChange({ ...value, [k]: v });
  return (
    <p className="text-xl leading-[2.2] font-semibold text-balance sm:text-3xl sm:leading-[2]">
      أصمّم{' '}
      <Pick
        label="نوع الاستخدام"
        value={value.useCase}
        options={(Object.keys(USE_CASES) as UseCaseKey[]).map((k) => [k, USE_CASES[k].label] as const)}
        onChange={set('useCase')}
      />{' '}
      باللغة{' '}
      <Pick
        label="اللغات"
        value={value.lang}
        options={(Object.keys(LANG_SETS) as LangSetKey[]).map((k) => [k, LANG_WORD[k]] as const)}
        onChange={set('lang')}
      />{' '}
      بخطوط{' '}
      <Pick
        label="الترخيص"
        value={value.tier}
        options={(Object.keys(TIERS) as TierKey[]).map((k) => [k, TIER_WORD[k]] as const)}
        onChange={set('tier')}
      />{' '}
      من{' '}
      <Pick
        label="عدد الخطوط"
        value={String(value.fonts) as '2' | '3'}
        options={[
          ['2', FONT_COUNT[2]],
          ['3', FONT_COUNT[3]],
        ]}
        onChange={(v) => onChange({ ...value, fonts: Number(v) as 2 | 3 })}
      />
    </p>
  );
}
