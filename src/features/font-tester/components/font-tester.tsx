import { useRef, useState } from 'react';

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CopyIcon,
  InterliningIcon,
  PaletteIcon,
  RefreshIcon,
  TextIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { weightStyle } from '@/lib/font-weight';

const PARAGRAPH =
  'لا إبداع حيث لا حرية، ولا فكرة حقيقية تولد في مكان يخشى السؤال. يبدأ الإبداع حين نمنح العقل مساحة للشك، وللتجربة، وللبحث، ولارتكاب الخطأ دون خوف من الحكم أو التراجع. فالأفكار الجديدة لا تأتي من الطرق الآمنة دائماً، بل غالباً ما تبدأ من تساؤل بسيط، أو محاولة غير مكتملة، أو خطوة لا تبدو مألوفة في بدايتها.\n\nكل عمل مختلف كان يوماً احتمالاً غريباً، وكل طريق جديد بدأ بخطوة لم يجرؤ أحد على اتخاذها من قبل. لذلك لا تكون الحرية مجرد جزء من العملية الإبداعية، بل البيئة التي ينمو فيها الإبداع أصلاً: مساحة تسمح للفكرة أن تتغير، وأن تختبر، وأن تفشل أحياناً، ثم تعود بصورة أقوى وأكثر وضوحاً.';

const PRESETS = {
  sentence: { label: 'جملة', text: 'لا إبداع حيث لا حرية، ولا فكرة حقيقية تولد في مكان يخشى السؤال.', size: 36 },
  title: { label: 'عنوان', text: 'حرف يصنع الهوية', size: 64 },
  para: { label: 'فقرة', text: PARAGRAPH, size: 24 },
  abc: { label: 'الأبجدية', text: 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي', size: 36 },
  nums: { label: 'أرقام', text: '0123456789 ٠١٢٣٤٥٦٧٨٩ ۰۱۲۳۴۵۶۷۸۹', size: 40 },
} as const;
type Preset = keyof typeof PRESETS;

const WEIGHTS = [
  [200, 'رفيع'],
  [300, 'خفيف'],
  [500, 'متوسط'],
  [600, 'شبه عريض'],
  [700, 'عريض'],
  [900, 'أسود'],
] as const;
const ALIGNS = [
  ['justify', 'ضبط', AlignJustifyIcon],
  ['right', 'يمين', AlignRightIcon],
  ['center', 'وسط', AlignCenterIcon],
  ['left', 'يسار', AlignLeftIcon],
] as const;
const LINE_HEIGHTS = [1.9, 1.5, 2.4];

const initial = {
  preset: 'para' as Preset,
  size: 24,
  weight: 300,
  align: 'justify' as (typeof ALIGNS)[number][0],
  lh: 0,
  invert: false,
};

/** مختبر الخط: نصّ قابل للتحرير مع حجم ووزن ومحاذاة وتباعد وقلب ألوان */
export function FontTester() {
  const [s, setS] = useState(initial);
  const [status, setStatus] = useState('');
  const [swap, setSwap] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);

  function preset(p: Preset) {
    setS((x) => ({ ...x, preset: p, size: PRESETS[p].size }));
    setSwap((n) => n + 1); // يعيد تركيب الحقل بالنصّ الجديد
  }
  const iconBtn =
    'grid size-8 place-items-center rounded-xs text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground aria-pressed:bg-sunken aria-pressed:text-foreground';

  return (
    <section aria-labelledby="tester-title" className="mt-12 overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle px-5 py-4">
        <h2 id="tester-title" className="flex items-center gap-2 text-sm font-semibold">
          <TextIcon className="size-4.5 text-muted-foreground" />
          تجربة الخط
        </h2>
        <div role="group" aria-label="نصّ جاهز" className="flex flex-wrap gap-1.5">
          {(Object.keys(PRESETS) as Preset[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={s.preset === p}
              onClick={() => preset(p)}
              className="h-7 rounded-full border bg-sunken px-3 text-caption leading-none text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-primary aria-pressed:bg-tint-brand aria-pressed:text-primary"
            >
              {PRESETS[p].label}
            </button>
          ))}
        </div>
      </div>

      <div
        key={swap}
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label="نصّ التجربة — اكتب ما تريد"
        spellCheck={false}
        onPaste={(e) => {
          // اللصق نصّاً عادياً فقط وبطول معقول — لا HTML
          e.preventDefault();
          const t = e.clipboardData.getData('text/plain').slice(0, 2000);
          document.execCommand('insertText', false, t);
        }}
        className={cn(
          'min-h-56 p-5 [overflow-wrap:anywhere] whitespace-pre-wrap outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--primary)] sm:p-8',
          'transition-[font-size,line-height,color,background-color] duration-300 ease-out-quint',
          swap > 0 && 'animate-fade-up',
          s.invert && 'bg-foreground text-background',
        )}
        style={{ fontSize: s.size, lineHeight: LINE_HEIGHTS[s.lh], textAlign: s.align, ...weightStyle(s.weight) }}
      >
        {PRESETS[s.preset].text}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-subtle px-5 py-3">
        <div role="group" aria-label="أدوات" className="flex items-center gap-1">
          <button
            type="button"
            className={iconBtn}
            aria-pressed={s.lh !== 0}
            aria-label="تباعد الأسطر"
            title="تباعد الأسطر"
            onClick={() => setS((x) => ({ ...x, lh: (x.lh + 1) % LINE_HEIGHTS.length }))}
          >
            <InterliningIcon className="size-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            aria-pressed={s.invert}
            aria-label="قلب الألوان"
            title="قلب الألوان"
            onClick={() => setS((x) => ({ ...x, invert: !x.invert }))}
          >
            <PaletteIcon className="size-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            aria-label="نسخ النص"
            title="نسخ النص"
            onClick={() => {
              const t = textRef.current?.textContent ?? '';
              navigator.clipboard?.writeText(t).then(
                () => {
                  setStatus('نُسخ النص');
                  window.setTimeout(() => setStatus(''), 1600);
                },
                () => undefined,
              );
            }}
          >
            <CopyIcon className="size-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            aria-label="إعادة الضبط"
            title="إعادة الضبط"
            onClick={() => {
              setS(initial);
              setSwap((n) => n + 1);
            }}
          >
            <RefreshIcon className="size-4" />
          </button>
          <span className="sr-only" aria-live="polite">
            {status}
          </span>
        </div>

        <label className="flex items-center gap-3 text-caption text-muted-foreground">
          الحجم
          <input
            type="range"
            min={12}
            max={120}
            value={s.size}
            onChange={(e) => setS((x) => ({ ...x, size: Number(e.target.value) }))}
            dir="ltr"
            className="h-5 w-[clamp(120px,18vw,220px)] cursor-pointer accent-primary"
          />
          <output dir="ltr" className="min-w-11 text-left text-foreground">
            {s.size} px
          </output>
        </label>

        <div role="group" aria-label="الوزن" className="flex flex-wrap gap-0.5">
          {WEIGHTS.map(([w, label]) => (
            <button
              key={w}
              type="button"
              aria-pressed={s.weight === w}
              onClick={() => setS((x) => ({ ...x, weight: w }))}
              className="h-6.5 rounded-full px-2.5 text-caption leading-none text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-tint-brand aria-pressed:text-primary"
            >
              {label}
            </button>
          ))}
        </div>

        <div role="group" aria-label="المحاذاة" className="flex items-center gap-1">
          {ALIGNS.map(([a, label, Icon]) => (
            <button
              key={a}
              type="button"
              className={iconBtn}
              aria-pressed={s.align === a}
              aria-label={label}
              title={label}
              onClick={() => setS((x) => ({ ...x, align: a }))}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
