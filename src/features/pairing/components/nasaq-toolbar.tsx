import { CrossSmallIcon, RefreshIcon, SlidersIcon, TextIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';

import { NasaqOptionsSheet } from './nasaq-options-sheet';
import { type Brief, DEFAULT_BRIEF, type View } from '../data/brief';
import { USE_CASES, type UseCaseKey } from '../data/catalog';

// نفس حبوب شريط المكتبة حرفياً — «نسق» جزء من الموقع لا أداة بتصميم آخر
const pill =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-control leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-(--dur-fast) active:scale-[.97]';

/** عدد الخيارات المغيّرة عن الافتراضي (عدا الاستخدام — له شرائحه) — يظهر على زرّ «الخيارات» */
export const optionsCount = (b: Brief) =>
  Number(b.lang !== DEFAULT_BRIEF.lang) +
  Number(b.tier !== DEFAULT_BRIEF.tier) +
  Number(b.fonts !== DEFAULT_BRIEF.fonts);

/**
 * شريط «نسق» على نمط شريط المكتبة: زرّ أحمر للفعل الرئيسي، حقل بعرض المتاح، زرّ لوحة الخيارات،
 * ومبدّل العرض — ثم شرائح الاستخدام تحته كما شرائح التصنيف.
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
  const count = optionsCount(brief);
  return (
    <div className="mt-8 flex flex-col gap-3">
      <div role="group" aria-label="أدوات نسق" className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
        <button
          type="button"
          onClick={onRegenerate}
          title="أو اضغط مسافة"
          className={cn(
            pill,
            'group/re border-transparent bg-primary-fill ps-4 font-medium text-white hover:bg-harf-700',
          )}
        >
          <RefreshIcon className="size-4 transition-transform duration-(--dur-slow) ease-out-quint group-active/re:-rotate-180" />
          تركيبات جديدة
        </button>

        <label className="relative flex h-11 min-w-45 flex-1 items-center rounded-full border bg-card transition-[box-shadow,border-color] focus-within:border-primary focus-within:shadow-focus dark:border-transparent dark:bg-sunken">
          <TextIcon className="pointer-events-none absolute start-4 size-4 text-muted-foreground" />
          <span className="sr-only">نص المعاينة</span>
          <input
            value={heading}
            onChange={(e) => onHeading(e.target.value.slice(0, 60))}
            placeholder={`اكتب نصّ المعاينة … ${placeholder}`}
            maxLength={60}
            spellCheck={false}
            className="h-full w-full min-w-0 rounded-full bg-transparent ps-11 pe-11 text-control outline-none placeholder:text-muted-foreground"
          />
          {heading && (
            <button
              type="button"
              onClick={() => onHeading('')}
              aria-label="النص الافتراضي"
              title="النص الافتراضي"
              className="absolute end-2 grid size-7 animate-pop-in place-items-center rounded-full text-muted-foreground hover:bg-sunken hover:text-foreground"
            >
              <CrossSmallIcon className="size-4" />
            </button>
          )}
        </label>

        <NasaqOptionsSheet
          brief={brief}
          onApply={onBrief}
          trigger={
            <button
              type="button"
              className={cn(
                pill,
                'border-border bg-card font-medium hover:border-strong dark:border-transparent dark:bg-sunken',
              )}
            >
              <SlidersIcon className="size-4" />
              الخيارات
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
          label="العرض"
          value={view}
          onChange={onView}
          options={[
            { value: 'suggest', label: 'الاقتراحات' },
            { value: 'saved', label: `المحفوظة${savedCount ? ` (${savedCount})` : ''}` },
          ]}
        />
      </div>

      {/* الاستخدام: شرائح كشرائح التصنيف في المكتبة */}
      <div className="-m-1 [scrollbar-width:none] overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden">
        <div role="group" aria-label="الاستخدام" className="flex w-max gap-2">
          {(Object.keys(USE_CASES) as UseCaseKey[]).map((k) => {
            const on = brief.useCase === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => onBrief({ ...brief, useCase: k })}
                className={cn(
                  pill,
                  on
                    ? 'border-primary bg-card font-medium text-primary dark:bg-paper dark:text-harf-600'
                    : 'border-border bg-card text-muted-foreground hover:border-strong hover:text-foreground dark:border-transparent dark:bg-sunken',
                )}
              >
                {USE_CASES[k].label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
