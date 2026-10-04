import { lazy, Suspense } from 'react';

import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, CrossSmallIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { LayoutContext, ParagraphsContext, TestsContext } from './contexts';
import { OT_SPECIMENS } from './tools/features';
import { PRESETS } from './tools/sample';
import { featureInfo, featureOn } from '../data/features';
import { type CanvasMode, CANVAS_MODES } from '../data/tools';
import { useLab } from '../hooks/lab-context';
import { analyzeOpenType } from '../utils/opentype';

const Waterfall = lazy(() => import('./tools/waterfall').then((m) => ({ default: m.Waterfall })));
const Weights = lazy(() => import('./tools/weights').then((m) => ({ default: m.Weights })));

/** الميزات التي غيّرها المستخدم عن افتراضي الخط — تظهر شرائح فوق النص */
export function useChangedFeatures() {
  const { active, settings } = useLab();
  if (!active) return [];
  return active.features
    .map((f) => f.tag)
    .filter((t, i, a) => a.indexOf(t) === i && featureInfo(t).mode !== 'engine')
    .filter((t) => t in settings.features && featureOn(t, settings.features) !== (featureInfo(t).mode === 'on'));
}

/** «أنماط» تظهر فقط حين يكون في العائلة أكثر من نمط أو محور وزن — وإلا فلا شيء تقارنه */
export function useModes() {
  const { active, fonts } = useLab();
  const many = !!active && (fonts.filter((f) => f.family === active.family).length > 1 || active.axes.length > 0);
  return CANVAS_MODES.filter((m) => m.key !== 'styles' || many);
}

const MODE =
  'h-9 shrink-0 rounded-full px-3.5 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-card aria-pressed:font-medium aria-pressed:text-foreground aria-pressed:shadow-soft';

/**
 * لوحة الاختبار — قلب المختبر: سياق واحد في كل مرّة، وكل السياقات تتبع الإعدادات نفسها
 * (الحجم، السطر، المحاذاة، OpenType) فيظهر أثر كل تغيير حيث يهمّ:
 * اكتب (نصّك، يُحرَّر في مكانه) · اختبارات (عيوب الرسم والوصل) · فقرات (القراءة واللغات) ·
 * تخطيط (صفحة مقال) · أحجام (من 12 إلى 128) · أنماط (كل أوزان العائلة).
 */
export function TestCanvas({
  mode,
  onMode,
  compare,
  onCompare,
}: {
  mode: CanvasMode;
  onMode: (m: CanvasMode) => void;
  compare: boolean;
  onCompare: (v: boolean) => void;
}) {
  const { active, settings: s, set } = useLab();
  const changed = useChangedFeatures();
  const modes = useModes();
  if (!active) return null;
  const current = modes.some((m) => m.key === mode) ? mode : 'write';
  const names = new Map(analyzeOpenType(active).features.map((f) => [f.tag, f.name]));
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
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={m.key === current}
              title={m.hint}
              onClick={() => onMode(m.key)}
              className={MODE}
            >
              {m.label}
            </button>
          ))}
        </div>

        {current === 'write' && (
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {preset ? `نص جاهز: ${preset.split(' — ')[0]}` : 'نص جاهز'}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>ضع في اللوحة نصاً</DropdownMenuLabel>
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

      {/* الميزات المغيّرة تسري على كل السياقات — تُرى وتُزال من هنا */}
      {changed.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-1 text-caption text-tertiary">OpenType مفعّل:</span>
          {changed.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                set({ features: Object.fromEntries(Object.entries(s.features).filter(([k]) => k !== tag)) });
              }}
              aria-label={`إلغاء ${tag}`}
              title={names.get(tag) ?? featureInfo(tag).label}
              className="group/c inline-flex h-7 items-center gap-1 rounded-full bg-tint-brand ps-2.5 pe-1 text-caption text-primary"
            >
              <span dir="ltr" className="font-mono">
                {tag}
              </span>
              {!featureOn(tag, s.features) && <span>مطفأة</span>}
              <span className="grid size-5 place-items-center rounded-full transition-colors group-hover/c:bg-primary-fill group-hover/c:text-white">
                <CrossSmallIcon className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div key={current} className="animate-fade-up">
        {current === 'write' && <WriteContext compare={compare && changed.length > 0} />}
        {current === 'tests' && <TestsContext />}
        {current === 'paragraphs' && <ParagraphsContext />}
        {current === 'layout' && <LayoutContext />}
        <Suspense fallback={<LoadingState label="جارٍ التحضير…" />}>
          {current === 'sizes' && <Waterfall />}
          {current === 'styles' && <Weights />}
        </Suspense>
      </div>
    </section>
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
