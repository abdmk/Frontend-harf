import { Button } from '@/components/ui/button';
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, RefreshIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { DEFAULT_TEXT, useLab } from '../../hooks/lab-context';
import type { LabSettings } from '../../types';
import { Panel, RangeControl } from '../bits';

export const PRESETS: [string, string][] = [
  ['عنوان', DEFAULT_TEXT],
  [
    'فقرة',
    'الخطُّ العربي فنٌّ قائم على التوازن بين الحرف والفراغ، وبين امتداد الكلمة ووقفتها. حين يُحسن المصمّم توزيع الأوزان وضبط المسافات، يصير النص مقروءًا قبل أن يكون جميلًا، ويصير الجمال نتيجةً للوضوح لا بديلًا عنه.',
  ],
  ['الأبجدية', 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ء آ أ إ ؤ ئ ة ى'],
  ['أرقام', '٠١٢٣٤٥٦٧٨٩ · 0123456789 · ٪ ، ؛ ؟ ( ) « »'],
  ['مختلط', 'حرف Harf — مكتبة الخطوط العربية Arabic Type Library ٢٠٢٦'],
];

// الألوان من رموز التصميم فقط — لا قيم ثابتة
const SWATCHES: { label: string; color: string; background: string }[] = [
  { label: 'افتراضي', color: '', background: '' },
  { label: 'حبر على ورق', color: 'var(--ink)', background: 'var(--card)' },
  { label: 'ورق على حبر', color: 'var(--ink-foreground)', background: 'var(--ink)' },
  { label: 'أحمر حرف', color: 'var(--primary)', background: 'var(--tint-brand)' },
  { label: 'هادئ', color: 'var(--foreground)', background: 'var(--sunken)' },
];

const ALIGN: { value: LabSettings['align']; label: string; Icon: typeof AlignRightIcon }[] = [
  { value: 'start', label: 'محاذاة لليمين', Icon: AlignRightIcon },
  { value: 'center', label: 'توسيط', Icon: AlignCenterIcon },
  { value: 'end', label: 'محاذاة لليسار', Icon: AlignLeftIcon },
  { value: 'justify', label: 'ضبط الطرفين', Icon: AlignJustifyIcon },
];

export function Sample() {
  const { active, settings: s, set, specimen, resetSettings } = useLab();
  if (!active) return null;
  const wght = active.axes.find((a) => a.tag === 'wght');

  return (
    <div className="flex flex-col gap-5">
      <Panel label="إعدادات العيّنة" className="flex flex-col gap-5 p-5">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <RangeControl label="الحجم" value={s.size} min={12} max={160} onChange={(size) => set({ size })} />
          {wght ? (
            <RangeControl
              label="الوزن (محور wght)"
              unit=""
              value={s.axes.wght ?? wght.default}
              min={wght.min}
              max={wght.max}
              onChange={(v) => set({ axes: { ...s.axes, wght: v } })}
            />
          ) : (
            <RangeControl
              label={s.weight === active.weight ? 'الوزن' : 'الوزن (مصطنع)'}
              unit=""
              value={s.weight}
              min={100}
              max={900}
              step={100}
              onChange={(weight) => set({ weight })}
            />
          )}
          <RangeControl
            label="ارتفاع السطر"
            unit=""
            value={s.lineHeight}
            min={0.9}
            max={3}
            step={0.1}
            onChange={(lineHeight) => set({ lineHeight })}
          />
          <RangeControl
            label="تباعد الحروف"
            value={s.letterSpacing}
            min={-5}
            max={20}
            onChange={(letterSpacing) => set({ letterSpacing })}
          />
          <RangeControl
            label="تباعد الكلمات"
            value={s.wordSpacing}
            min={-10}
            max={40}
            onChange={(wordSpacing) => set({ wordSpacing })}
          />
          <RangeControl label="عرض النص" unit="%" value={s.width} min={30} max={100} onChange={(width) => set({ width })} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div role="group" aria-label="المحاذاة" className="flex gap-1 rounded-full bg-sunken p-1">
            {ALIGN.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={s.align === value}
                onClick={() => set({ align: value })}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors aria-pressed:bg-paper aria-pressed:text-paper-foreground aria-pressed:shadow-soft"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
          <div role="group" aria-label="الألوان" className="flex items-center gap-1.5">
            {SWATCHES.map((w) => {
              const on = s.color === w.color && s.background === w.background;
              return (
                <button
                  key={w.label}
                  type="button"
                  title={w.label}
                  aria-label={w.label}
                  aria-pressed={on}
                  onClick={() => set({ color: w.color, background: w.background })}
                  className={cn(
                    'grid size-9 place-items-center rounded-full border text-meta font-semibold transition-shadow',
                    on && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                  )}
                  style={{ color: w.color || undefined, background: w.background || undefined }}
                >
                  ب
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" onClick={resetSettings}>
            <RefreshIcon />
            الافتراضي
          </Button>
        </div>
      </Panel>

      <Panel label="العيّنة" className="overflow-hidden">
        <div className="flex flex-wrap gap-1.5 border-b px-5 py-3">
          {PRESETS.map(([label, text]) => (
            <button
              key={label}
              type="button"
              aria-pressed={s.text === text}
              onClick={() => set({ text })}
              className="rounded-full border px-3 py-1 text-caption text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-primary aria-pressed:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-6 sm:p-10" style={{ background: s.background || undefined }}>
          <textarea
            aria-label="نص العيّنة — قابل للتحرير"
            value={s.text}
            onChange={(e) => set({ text: e.target.value.slice(0, 2000) })}
            spellCheck={false}
            dir="auto"
            className="block min-h-40 resize-none bg-transparent [field-sizing:content] outline-none focus-visible:outline-none"
            style={specimen(active, {
              fontSize: s.size,
              lineHeight: s.lineHeight,
              letterSpacing: s.letterSpacing,
              wordSpacing: s.wordSpacing,
              width: `${s.width}%`,
              textAlign: s.align,
              color: s.color || undefined,
              ...(wght ? {} : { fontWeight: s.weight }),
            })}
          />
        </div>
      </Panel>
    </div>
  );
}
