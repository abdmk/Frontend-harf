import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { Dropzone } from '@/components/shared/dropzone';
import { ToolTips } from '@/components/shared/tool-tips';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  AlignJustifyIcon,
  CheckIcon,
  CopyIcon,
  CrossIcon,
  ExpandIcon,
  MagicWandIcon,
  PictureIcon,
  RefreshIcon,
  TextIcon,
} from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

import { CompareView } from './compare-view';
import { CropImage } from './crop-image';
import { countCandidates } from '../api/candidates';
import { type Match, STEPS, type StepKey, useMatcher } from '../hooks/use-matcher';
import { ACCEPTED } from '../utils/browser';
import type { Polarity, Rect } from '../utils/image';

const LOW_CONFIDENCE = 55;
const MAX_TEXT = 40;
const POLARITY = [
  { value: 'auto', label: 'تلقائي' },
  { value: 'dark-on-light', label: 'داكن على فاتح' },
  { value: 'light-on-dark', label: 'فاتح على داكن' },
] as const satisfies readonly { value: Polarity; label: string }[];

const STAGES = ['الصورة', 'النص والتحديد', 'النتائج'] as const;

/** نصائح ما قبل الرفع — كل واحدة تعالج سبباً حقيقياً لضعف المطابقة في المحرّك */
const TIPS = [
  { icon: PictureIcon, title: 'صورة أوضح، نتيجة أدق', text: 'صورة عالية الدقة يظهر فيها النص بوضوح ومن دون تشويش.' },
  { icon: TextIcon, title: 'ركّز على خط واحد', text: 'إذا احتوت الصورة أكثر من خط، حدّد الجزء الذي تبحث عنه فقط.' },
  { icon: MagicWandIcon, title: 'تجنّب المؤثرات القوية', text: 'الظلال والزخارف والخلفيات المعقّدة تربك المقارنة.' },
  { icon: ExpandIcon, title: 'حجم نص مناسب', text: 'كلما زادت الحروف وكبر حجمها في الصورة كانت النتيجة أدق.' },
  { icon: AlignJustifyIcon, title: 'صورة غير مائلة', text: 'التقط الكتابة مستقيمة قدر الإمكان، لا بزاوية أو منظور.' },
] as const;

export type ResultCardProps = { match: Match; text: string; selected: boolean; onCompare: () => void; rank: number };

/**
 * «عين» (مطابقة الخطوط): ارفع صورة ← حدّد الكتابة واكتب نصّها ← نقارن شكلها بخطوط المكتبة.
 * بطاقة النتيجة تأتي من طبقة التطبيق (بطاقة الخط نفسها بالمفضّلة والشراء).
 */
export function FontMatchingTool({ renderResult }: { renderResult: (p: ResultCardProps) => ReactNode }) {
  const { state, open, reset, cancel, match } = useMatcher();
  const [text, setText] = useState('');
  // التحديد والاختيار مربوطان بالصورة/النتائج التي صُنعا لها — صورة جديدة تعيدهما تلقائياً
  const [crop, setCrop] = useState<{ for: unknown; rect: Rect | null }>({ for: null, rect: null });
  const [includePaid, setIncludePaid] = useState(true);
  const [polarity, setPolarity] = useState<Polarity>('auto');
  const [pick, setPick] = useState<{ for: unknown; id: string | null }>({ for: null, id: null });
  const fileInput = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLElement>(null);
  const textId = useId();

  // لصق صورة من الحافظة في أي وقت — يستبدل الصورة الحالية
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
      if (!file) return;
      e.preventDefault();
      void open(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [open]);

  const image = state.phase === 'empty' ? null : state.image;
  const rect = crop.for === image ? crop.rect : null;
  const setRect = (r: Rect | null) => setCrop({ for: image, rect: r });
  const matches = state.phase === 'done' ? state.matches : null;
  const selected = pick.for === matches ? pick.id : (matches?.[0]?.font.id ?? null);
  const setSelected = (id: string) => setPick({ for: matches, id });

  // نتائج جديدة ← انتقال هادئ إليها
  useEffect(() => {
    if (matches) results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [matches]);

  const stage = state.phase === 'empty' ? 0 : state.phase === 'done' ? 2 : 1;
  const clean = text.trim();
  const activeRect = rect ?? (state.phase === 'empty' ? null : state.auto);
  const onFiles = (files: FileList) => files[0] && void open(files[0]);

  // زرّ «لصق من الحافظة»: يقرأ أول صورة في الحافظة؛ والمتصفّحات التي لا تتيح القراءة تُرشد إلى Ctrl+V
  const pasteImage = async () => {
    const fallback = 'اضغط Ctrl+V (أو ⌘V) للصق الصورة';
    if (!navigator.clipboard?.read) return toast({ title: fallback });
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (!type) continue;
        const blob = await item.getType(type);
        return void open(new File([blob], `clipboard.${type.split('/')[1] ?? 'png'}`, { type }));
      }
      toast({ title: 'لا توجد صورة في الحافظة', description: 'انسخ صورة أولاً ثم جرّب مرة أخرى.' });
    } catch {
      toast({ title: fallback });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-label="أداة المطابقة"
        // قبل الرفع: بطاقة الرفع ونصائحها وحدها بلا إطار حولها؛ بعده تصير الأداة بطاقة واحدة
        className={stage === 0 ? undefined : 'rounded-xl border bg-card p-5 sm:p-8'}
      >
        {/* المراحل تظهر بعد الرفع — قبله بطاقة الرفع وحدها، فالخطوة الأولى واضحة بلا شرح */}
        {stage > 0 && (
          <nav aria-label="مراحل المطابقة">
            <ol className="grid grid-cols-3 gap-1.5">
              {STAGES.map((label, i) => (
                <li key={label} aria-current={stage === i ? 'step' : undefined} className="flex flex-col gap-2">
                  <span
                    className={cn(
                      'h-1 rounded-full transition-colors duration-(--dur-slow)',
                      stage === i ? 'bg-primary-fill' : i < stage ? 'bg-foreground/70' : 'bg-inset',
                    )}
                  />
                  <span
                    className={cn(
                      'flex items-center gap-1 text-caption',
                      stage === i ? 'font-medium text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {i < stage && <CheckIcon className="size-3 text-ok-text" />}
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {state.phase === 'empty' ? (
          <div className="flex flex-col gap-6">
            <Dropzone
              feature
              onFiles={onFiles}
              accept={ACCEPTED.join(',')}
              title="ارفع صورة الخط"
              hint="أو اسحب الصورة وأفلتها هنا — حتى 10 ميغابايت"
              browseLabel="تصفّح الملفات"
              formats={['PNG', 'JPG', 'WEBP']}
              actions={
                <Button variant="outline" size="lg" shape="pill" onClick={() => void pasteImage()}>
                  <CopyIcon />
                  لصق من الحافظة
                </Button>
              }
            />
            {state.error && <Alert tone="danger" title={state.error} />}
            <ToolTips id={`${textId}-tips`} title="نصائح لنتيجة أدق" tips={TIPS} />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
            <div className="flex min-w-0 flex-col gap-3">
              <CropImage
                url={state.image.url}
                width={state.image.width}
                height={state.image.height}
                rect={activeRect}
                onRect={setRect}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                  <PictureIcon />
                  تغيير الصورة
                </Button>
                <Button variant="ghost" size="sm" disabled={!rect} onClick={() => setRect(null)}>
                  <RefreshIcon />
                  التحديد التلقائي
                </Button>
                <span className="text-caption text-tertiary max-sm:hidden">اسحب على الصورة لتحديد الكتابة فقط</span>
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  accept={ACCEPTED.join(',')}
                  onChange={(e) => {
                    if (e.target.files?.length) onFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            {state.phase === 'running' ? (
              <Progress done={state.done} progress={state.progress} onCancel={cancel} />
            ) : (
              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (clean) void match(clean, activeRect, { includePaid, polarity });
                }}
              >
                <Field>
                  <FieldLabel htmlFor={textId} required>
                    النص في الصورة
                  </FieldLabel>
                  <Input
                    id={textId}
                    dir="rtl"
                    value={text}
                    maxLength={MAX_TEXT}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
                    placeholder="مثال: طلع النور"
                    autoComplete="off"
                    spellCheck={false}
                    className="text-lead"
                  />
                  <FieldHint>اكتبه كما يظهر تماماً — كلّما طابق النص الصورة كانت النتيجة أدق.</FieldHint>
                </Field>

                <div className="flex flex-col gap-2">
                  <span className="text-meta font-medium text-muted-foreground">لون الكتابة</span>
                  <SegmentedControl
                    label="لون الكتابة"
                    value={polarity}
                    onChange={setPolarity}
                    options={POLARITY}
                    className="w-fit"
                  />
                  {polarity === 'auto' && (
                    <span className="text-caption text-tertiary">
                      اكتشفنا: {state.lightInk ? 'كتابة فاتحة على خلفية داكنة' : 'كتابة داكنة على خلفية فاتحة'}
                    </span>
                  )}
                </div>

                <label className="flex items-center justify-between gap-4 rounded-md bg-sunken px-4 py-3">
                  <span>
                    <span className="block text-control font-medium">تضمين الخطوط المدفوعة</span>
                    <span className="block text-caption text-muted-foreground">
                      {countCandidates()} خطاً في المكتبة قابلة للمقارنة
                    </span>
                  </span>
                  <Switch checked={includePaid} onCheckedChange={setIncludePaid} />
                </label>

                {state.phase === 'ready' && state.error && <Alert tone="warning" title={state.error} />}

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button type="submit" size="lg" className="flex-1" disabled={!clean}>
                    <MagicWandIcon />
                    طابِق
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={reset}>
                    صورة جديدة
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>

      {state.phase === 'done' && (
        <section ref={results} aria-labelledby="res-title" className="flex scroll-mt-24 flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="res-title" className="text-xl font-semibold">
                أقرب الخطوط
              </h2>
              <p className="mt-1 text-meta text-muted-foreground">
                أقرب {state.matches.length} من {state.total} خطاً في مكتبة حرف، مرتّبة حسب التشابه
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <RefreshIcon />
              صورة جديدة
            </Button>
          </div>

          {(state.matches[0]?.score ?? 0) < LOW_CONFIDENCE && (
            <Alert
              tone="info"
              title="لم نجد خطاً قريباً بثقة في مكتبة حرف"
              description="هذه أقرب الخطوط شكلاً. تأكّد أن النص مكتوب كما في الصورة، وأن التحديد يحيط بالكتابة وحدها."
            />
          )}

          {selected && state.matches.find((m) => m.font.id === selected) && (
            <CompareView source={state.source} match={state.matches.find((m) => m.font.id === selected)!} />
          )}

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.matches.map((m, i) => (
              <li key={m.font.id} className="flex [&>*]:w-full">
                {renderResult({
                  match: m,
                  text: clean,
                  rank: i,
                  selected: selected === m.font.id,
                  onCompare: () => setSelected(m.font.id),
                })}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** تقدّم حقيقي: كل خطوة تُعلَّم حين تنتهي فعلاً، وشريط بنسبة الخطوط التي قورنت */
function Progress({ done, progress, onCancel }: { done: StepKey[]; progress: number; onCancel: () => void }) {
  const keys = Object.keys(STEPS) as StepKey[];
  const current = keys.find((k) => !done.includes(k));
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5 rounded-lg bg-sunken p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-control font-semibold">جارٍ المطابقة…</p>
        <span dir="ltr" className="text-meta font-medium tabular-nums">
          {Math.round(progress * 100)}٪
        </span>
      </div>
      {/* transform لا width: المطابقة تشغل الخيط الرئيسي، وتحريك العرض يتقطّع معها؛ scaleX يتحرّك على
          طبقة التركيب منفصلاً عنه فيبقى سلساً. البداية من اليمين (RTL) */}
      <div className="h-1.5 overflow-hidden rounded-full bg-inset">
        <div
          className="h-full origin-right rounded-full bg-primary-fill transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
          style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }}
        />
      </div>
      <ol className="flex flex-col gap-3">
        {keys.map((k) => {
          const isDone = done.includes(k);
          return (
            <li
              key={k}
              className={cn(
                'flex items-center gap-2.5 text-control',
                isDone ? 'text-foreground' : k === current ? 'font-medium' : 'text-tertiary',
              )}
            >
              <span
                className={cn(
                  'grid size-5 place-items-center rounded-full',
                  isDone ? 'bg-ok-700 text-white' : k === current ? 'border-2 border-primary' : 'border',
                )}
              >
                {isDone && <CheckIcon className="size-3" />}
              </span>
              {STEPS[k]}
            </li>
          );
        })}
      </ol>
      <Button variant="ghost" size="sm" className="self-start" onClick={onCancel}>
        <CrossIcon />
        إلغاء
      </Button>
    </div>
  );
}
