import { useState } from 'react';

import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, TextIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { faceStyle } from '@/lib/font-weight';
import type { LiveFace } from '@/types/domain/font';

import { OPENTYPE_FEATURES, type OpenTypeTag } from './opentype-features';

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
/** الربط القياسي والبدائل السياقية مفعّلان افتراضياً في المتصفّحات؛ البقيّة يختارها المستخدم */
const FEATURES_DEFAULT: Record<OpenTypeTag, boolean> = {
  liga: true,
  calt: true,
  dlig: false,
  swsh: false,
  salt: false,
};
const featureSettings = (f: Record<OpenTypeTag, boolean>) =>
  OPENTYPE_FEATURES.map(({ tag }) => `"${tag}" ${f[tag] ? 1 : 0}`).join(', ');

const initial = {
  preset: 'para' as Preset,
  size: 24,
  weight: 300,
  align: 'justify' as (typeof ALIGNS)[number][0],
  features: FEATURES_DEFAULT,
};

/** مختبر الخط: نصّ قابل للتحرير مع حجم ووزن ومحاذاة وميزات OpenType */
export function FontTester({ face }: { face?: LiveFace } = {}) {
  // خط حقيقي: أزرار أوزانه الموجودة فقط
  const weights = face ? WEIGHTS.filter(([w]) => face.weights.some((x) => Math.abs(x - w) <= 50)) : WEIGHTS;
  const [s, setS] = useState(initial);
  const [swap, setSwap] = useState(0);

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
          'leading-[1.9] transition-[font-size] duration-(--dur-slow) ease-out-quint',
          swap > 0 && 'animate-fade-up',
        )}
        style={{
          fontSize: s.size,
          textAlign: s.align,
          fontFeatureSettings: featureSettings(s.features),
          ...faceStyle(face, s.weight),
        }}
      >
        {PRESETS[s.preset].text}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-subtle px-5 py-3">
        {/* ميزات OpenType: كل زرّ يبدّل ميزة واحدة في النصّ — المفعّلة بإطار وحرف بلون الهوية */}
        <div role="group" aria-label="ميزات OpenType" className="flex items-center gap-1.5">
          {OPENTYPE_FEATURES.map((f) => (
            <button
              key={f.tag}
              type="button"
              aria-pressed={s.features[f.tag]}
              aria-label={`${f.label} (${f.tag})`}
              title={`${f.label} — ${f.tag}`}
              onClick={() => setS((x) => ({ ...x, features: { ...x.features, [f.tag]: !x.features[f.tag] } }))}
              className="grid size-8 place-items-center rounded-xs border bg-sunken text-muted-foreground transition-[color,background-color,border-color,scale] duration-(--dur-base) hover:border-strong hover:text-foreground active:scale-95 aria-pressed:border-primary aria-pressed:bg-tint-brand aria-pressed:text-primary"
            >
              <svg viewBox="2 2 20 20" aria-hidden className="size-6" fill="currentColor">
                {f.paths.map((d) => (
                  <path key={d} d={d} />
                ))}
              </svg>
            </button>
          ))}
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
          {weights.map(([w, label]) => (
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
