import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeftIcon, ChevronDownIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { LayoutContext, ParagraphsContext, TestsContext } from './contexts';
import { OT_SPECIMENS } from './tools/features';
import { featureGroup, featureInfo, featureOn } from '../data/features';
import { PRESETS } from '../data/presets';
import { type CanvasMode, CANVAS_MODES } from '../data/tools';
import { useLab } from '../hooks/lab-context';
import { analyzeOpenType } from '../utils/opentype';

/** الميزات التي غيّرها المستخدم عن افتراضي الخط */
export function useChangedFeatures() {
  const { active, settings } = useLab();
  if (!active) return [];
  return active.features
    .map((f) => f.tag)
    .filter((t, i, a) => a.indexOf(t) === i && featureInfo(t).mode !== 'engine')
    .filter((t) => t in settings.features && featureOn(t, settings.features) !== (featureInfo(t).mode === 'on'));
}

const MODE =
  'h-9 shrink-0 rounded-full px-3.5 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-card aria-pressed:font-medium aria-pressed:text-foreground aria-pressed:shadow-soft';

/**
 * لوحة الاختبار — قلب المختبر: سياق واحد في كل مرّة، وكل السياقات تتبع الإعدادات نفسها
 * (الحجم، السطر، المحاذاة، OpenType) فيظهر أثر كل تغيير حيث يهمّ:
 * اكتب (نصّك، يُحرَّر في مكانه) · اختبارات (عيوب الرسم والوصل) · فقرات (القراءة واللغات) · تخطيط (صفحة مقال).
 * شريط OpenType فوقها: ميزات الملف الاختيارية تُشغَّل بنقرة دون مغادرة العيّنة.
 */
export function TestCanvas({
  mode,
  onMode,
  compare,
  onCompare,
  onAllFeatures,
}: {
  mode: CanvasMode;
  onMode: (m: CanvasMode) => void;
  compare: boolean;
  onCompare: (v: boolean) => void;
  onAllFeatures: () => void;
}) {
  const { settings: s, set, active } = useLab();
  const changed = useChangedFeatures();
  if (!active) return null;
  const presets = [...PRESETS, ...OT_SPECIMENS.slice(1, 4)];
  const preset = presets.find(([, text]) => text === s.text)?.[0];

  return (
    <section id="lab-canvas" aria-label="لوحة الاختبار" className="flex min-w-0 scroll-mt-24 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="سياق الاختبار"
          className="flex max-w-full [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-full bg-sunken p-1 [&::-webkit-scrollbar]:hidden"
        >
          {CANVAS_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={m.key === mode}
              title={m.hint}
              onClick={() => onMode(m.key)}
              className={MODE}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'write' && (
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {preset ? `نص جاهز: ${preset.split(' — ')[0]}` : 'نص جاهز'}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>ضع في العيّنة نصاً</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={s.text} onValueChange={(text) => set({ text })}>
                  {presets.map(([label, text]) => (
                    <DropdownMenuRadioItem key={label} value={text}>
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={compare && changed.length > 0}
              disabled={!changed.length}
              onClick={() => onCompare(!compare)}
              title={changed.length ? 'قارن افتراضي الخط بميزاتك' : 'فعّل ميزة OpenType لتقارن'}
              className="aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              قبل / بعد
            </Button>
          </div>
        )}
      </div>

      <OpenTypeStrip onAll={onAllFeatures} />

      <div key={mode} className="animate-fade-up">
        {mode === 'write' && <WriteContext compare={compare && changed.length > 0} />}
        {mode === 'tests' && <TestsContext />}
        {mode === 'paragraphs' && <ParagraphsContext />}
        {mode === 'layout' && <LayoutContext />}
      </div>
    </section>
  );
}

/**
 * ميزات OpenType الاختيارية في الملف — شرائح تُشغَّل وتُطفأ فوق العيّنة مباشرة.
 * المفعّلة بلون العلامة؛ والتفصيل (الأثر، الجرد، المحرّك) في أداة «ميزات OpenType».
 */
function OpenTypeStrip({ onAll }: { onAll: () => void }) {
  const { active, settings, set } = useLab();
  if (!active) return null;
  const names = new Map(analyzeOpenType(active).features.map((f) => [f.tag, f.name]));
  // الاختيارية فقط (مجموعات أسلوبية، بدائل، أرقام…) وما غيّره المستخدم — المفعّل افتراضياً كـkern في أداة الميزات
  const tags = [...new Set(active.features.map((f) => f.tag))].filter(
    (t) => featureGroup(t) !== 'engine' && (featureInfo(t).mode !== 'on' || t in settings.features),
  );
  // الأشكال والبدائل أولاً — هي ما يبحث عنه المصمّم — ثم الربطات، فالأرقام، فالمسافات
  const rank = { style: 0, liga: 1, num: 2, space: 3, engine: 4 } as const;
  tags.sort((a, b) => rank[featureGroup(a)] - rank[featureGroup(b)]);
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-caption font-semibold">OpenType</span>
      <div
        role="group"
        aria-label="OpenType في العيّنة"
        className="flex min-w-0 flex-1 [scrollbar-width:none] items-center gap-1.5 overflow-x-auto [mask-image:linear-gradient(to_left,black_calc(100%-2rem),transparent)] py-0.5 [&::-webkit-scrollbar]:hidden"
      >
        {tags.length === 0 && <span className="text-caption text-tertiary">لا ميزات اختيارية في هذا الملف</span>}
        {tags.map((tag) => {
          const on = featureOn(tag, settings.features);
          const name = names.get(tag) ?? featureInfo(tag).label;
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              aria-label={`${tag} — ${name}`}
              title={name}
              onClick={() => set({ features: { ...settings.features, [tag]: !on } })}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 text-caption text-muted-foreground transition-colors hover:border-strong hover:text-foreground aria-pressed:border-primary/50 aria-pressed:bg-tint-brand aria-pressed:text-primary"
            >
              <span dir="ltr" className="font-mono font-medium">
                {tag}
              </span>
              <span className="max-w-28 truncate max-sm:hidden">
                {featureInfo(tag).mode === 'on' ? featureInfo(tag).label : name}
              </span>
            </button>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" onClick={onAll} className="shrink-0">
        كل الميزات
        <ArrowLeftIcon />
      </Button>
    </div>
  );
}

/** «اكتب» — نصّك بالخط، يُحرَّر في مكانه. «قبل / بعد» يقسمها: افتراضي الخط بجانب ميزاتك */
function WriteContext({ compare }: { compare: boolean }) {
  const { active, settings: s, set, specimen } = useLab();
  if (!active) return null;
  const style = (features?: 'default') =>
    specimen(active, {
      fontSize: s.size,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      wordSpacing: s.wordSpacing,
      width: `${s.width}%`,
      textAlign: s.align,
      color: s.color || undefined,
      ...(features === 'default' ? { fontFeatureSettings: 'normal' } : {}),
    });

  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-2xl border bg-card',
        compare && 'max-lg:divide-y lg:grid-cols-2 lg:divide-x',
      )}
      style={{ background: s.background || undefined }}
    >
      {compare && (
        <div className="min-w-0 p-6 sm:p-10">
          <p className="mb-3 text-caption text-tertiary">افتراضي الخط</p>
          <p lang={s.lang || undefined} dir="auto" className="break-words whitespace-pre-wrap" style={style('default')}>
            {s.text}
          </p>
        </div>
      )}
      <div className="min-w-0 p-6 sm:p-10">
        {compare && <p className="mb-3 text-caption text-primary">بميزاتك</p>}
        <textarea
          aria-label="نص العيّنة — قابل للتحرير"
          value={s.text}
          onChange={(e) => set({ text: e.target.value.slice(0, 2000) })}
          spellCheck={false}
          dir="auto"
          lang={s.lang || undefined}
          placeholder="اكتب هنا لتجرّب الخط…"
          className="block [field-sizing:content] min-h-[min(40vh,22rem)] w-full resize-none bg-transparent outline-none placeholder:text-tertiary focus-visible:outline-none"
          style={style()}
        />
      </div>
    </div>
  );
}
