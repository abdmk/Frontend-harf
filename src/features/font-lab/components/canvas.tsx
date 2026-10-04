import { CrossSmallIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { OT_SPECIMENS } from './tools/features';
import { PRESETS } from './tools/sample';
import { featureInfo, featureOn } from '../data/features';
import { useLab } from '../hooks/lab-context';
import { analyzeOpenType } from '../utils/opentype';

/** الميزات التي غيّرها المستخدم عن افتراضي الخط — تظهر شرائح فوق النص */
export function useChangedFeatures() {
  const { active, settings } = useLab();
  if (!active) return [];
  return active.features
    .map((f) => f.tag)
    .filter((t, i, a) => a.indexOf(t) === i && featureInfo(t).mode !== 'engine')
    .filter((t) => t in settings.features && featureOn(t, settings.features) !== (featureInfo(t).mode === 'on'));
}

const CHIP =
  'h-8 shrink-0 rounded-full px-3 text-caption whitespace-nowrap text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background';

/**
 * لوحة الاختبار — العنصر الرئيسي في المختبر: نصّك بالخط، يُحرَّر في مكانه.
 * فوقه: نصوص جاهزة وزرّ «قبل / بعد» حين تُغيّر ميزات OpenType. تحته: الميزات المفعّلة شرائح تُزال بنقرة.
 * «قبل / بعد» يقسم اللوحة: افتراضي الخط بجانب ميزاتك — المقارنة في مكانها لا في صفحة أخرى.
 */
export function TestCanvas({ compare, onCompare }: { compare: boolean; onCompare: (v: boolean) => void }) {
  const { active, settings: s, set, specimen } = useLab();
  const changed = useChangedFeatures();
  if (!active) return null;
  const names = new Map(analyzeOpenType(active).features.map((f) => [f.tag, f.name]));
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
  const split = compare && changed.length > 0;

  return (
    <section
      id="lab-canvas"
      aria-label="لوحة الاختبار"
      className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card"
    >
      {/* نصوص جاهزة — قصيرة الأسماء، ونصوص OpenType في الآخر */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <div
          role="group"
          aria-label="نصوص جاهزة"
          className="flex min-w-0 flex-1 [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {[...PRESETS, ...OT_SPECIMENS.slice(1, 4)].map(([label, text]) => (
            <button
              key={label}
              type="button"
              aria-pressed={s.text === text}
              onClick={() => set({ text })}
              className={CHIP}
            >
              {label.split(' — ')[0]}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={split}
          disabled={!changed.length}
          onClick={() => onCompare(!compare)}
          title={changed.length ? 'قارن افتراضي الخط بميزاتك' : 'فعّل ميزة OpenType لتقارن'}
          className={cn(CHIP, 'border disabled:cursor-not-allowed disabled:opacity-40')}
        >
          قبل / بعد
        </button>
      </div>

      <div
        className={cn('grid', split && 'max-lg:divide-y lg:grid-cols-2 lg:divide-x')}
        style={{ background: s.background || undefined }}
      >
        {split && (
          <div className="min-w-0 p-6 sm:p-10">
            <p className="mb-3 text-caption text-tertiary">افتراضي الخط</p>
            <p
              lang={s.lang || undefined}
              dir="auto"
              className="break-words whitespace-pre-wrap"
              style={style('default')}
            >
              {s.text}
            </p>
          </div>
        )}
        <div className="min-w-0 p-6 sm:p-10">
          {split && <p className="mb-3 text-caption text-primary">بميزاتك</p>}
          <textarea
            aria-label="نص العيّنة — قابل للتحرير"
            value={s.text}
            onChange={(e) => set({ text: e.target.value.slice(0, 2000) })}
            spellCheck={false}
            dir="auto"
            lang={s.lang || undefined}
            className="block [field-sizing:content] min-h-[min(40vh,22rem)] w-full resize-none bg-transparent outline-none focus-visible:outline-none"
            style={style()}
          />
        </div>
      </div>

      {changed.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2.5">
          <span className="px-1 text-caption text-tertiary">مفعّل:</span>
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
    </section>
  );
}
