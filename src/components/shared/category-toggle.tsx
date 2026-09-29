import { useRef, useState } from 'react';

import { AppsIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/** حبّة شريط الأدوات — واحدة في المكتبة والمخطوطات و«نسق» */
export const TOOLBAR_PILL =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-control leading-none whitespace-nowrap transition-[background-color,color,border-color,transform] duration-(--dur-fast) active:scale-[.97]';

/** شريحة اختيار في الشريط: محدّدة بالأحمر، أو هادئة */
export const toolbarChip = (on: boolean) =>
  cn(
    TOOLBAR_PILL,
    on
      ? 'border-primary bg-card font-medium text-primary dark:bg-paper dark:text-harf-600'
      : 'border-border bg-card text-muted-foreground hover:border-strong hover:text-foreground dark:border-transparent dark:bg-sunken',
  );

type Option<T extends string> = { value: T; label: string; count?: number };

/**
 * زرّ «التصنيف» الأحمر وشرائح التصنيفات بجانبه: مطويّة افتراضياً، تنفتح أفقياً على الكمبيوتر
 * وطولياً في سطر مستقل على الجوال. يُعرض داخل صفّ flex (الشريط) — جزآن متجاوران.
 */
export function CategoryToggle<T extends string>({
  id,
  options,
  value,
  onChange,
  defaultValue,
}: {
  id: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
  /** القيمة «الكل» — إن اختيرت غيرها يظهر اسمها على الزرّ المطويّ */
  defaultValue: T;
}) {
  // مطويّ افتراضياً؛ يبقى مفتوحاً إن وصل المستخدم وتصنيف مختار في الرابط
  const [open, setOpen] = useState(value !== defaultValue);
  // العرض على الكمبيوتر يتحرّك بين 0 والعرض الفعلي المقاس (لا max-width وهمي يؤخّر الإغلاق)، ثم auto
  const [width, setWidth] = useState(open ? 'auto' : '0px');
  const row = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!row.current) return;
    // + 8 = الحشوة p-1 حول الشرائح (تحفظ حلقة التركيز من القصّ)
    const full = `${row.current.offsetWidth + 8}px`;
    setWidth(full);
    // الإغلاق: من العرض الحالي بالبكسل إلى 0 — الانتقال لا يعمل من auto
    if (!next) requestAnimationFrame(() => requestAnimationFrame(() => setWidth('0px')));
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
        className={cn(TOOLBAR_PILL, 'border-transparent bg-primary-fill ps-4 font-medium text-white hover:bg-harf-700')}
      >
        <AppsIcon className={cn('size-4 transition-transform duration-(--dur-slow) ease-pop', !open && 'rotate-90')} />
        التصنيف
        {/* مطويّ وتصنيف مختار: يظهر اسمه على الزرّ حتى لا يُنسى الفلتر */}
        {!open && value !== defaultValue && current && (
          <span className="animate-pop-in font-normal opacity-85">· {current.label}</span>
        )}
      </button>

      <div
        id={id}
        role="group"
        aria-label="التصنيفات"
        inert={!open}
        style={{ '--chips-w': width } as React.CSSProperties}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'width' && open) setWidth('auto');
        }}
        className={cn(
          '-m-1 grid w-full overflow-hidden transition-[grid-template-rows,width,opacity] duration-(--dur-xslow) ease-out-quint max-lg:order-last lg:w-(--chips-w)',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 lg:grid-rows-[1fr]',
        )}
      >
        <div className="min-h-0 [scrollbar-width:none] overflow-x-auto p-1 [&::-webkit-scrollbar]:hidden">
          <div ref={row} className="flex w-max gap-2">
            {options.map((o, i) => {
              const on = value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(o.value)}
                  // تتابع قصير عند الفتح فقط؛ الحركة keyframes حتى لا تؤخّر ألوان المرور
                  style={open ? { animationDelay: `${i * 28}ms` } : undefined}
                  className={cn(toolbarChip(on), open && 'animate-chip-in')}
                >
                  {o.label}
                  {o.count !== undefined && (
                    <span dir="ltr" className={cn('text-caption text-tertiary tabular-nums', on && 'dark:text-n-600')}>
                      {o.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
