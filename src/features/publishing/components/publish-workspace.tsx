import { useEffect, useMemo, useState, useTransition } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

import { FilesStep, ImagesStep, InfoStep, PricingStep } from './publish-steps';
import { ReviewStep } from './review-step';
import type { SubmitResult } from '../api/submit';
import { draftSchema, EMPTY_DRAFT, STEP_OF_FIELD, type WorkDraft } from '../types/draft';

const STEPS = [
  ['الملفات', 'ارفع ملفات الخط', 'كل أوزان العائلة دفعة واحدة — OTF أو TTF أو WOFF2.'],
  ['الصور', 'أضف صور الخط', 'صور تعرض حروف الخط وأوزانه، بنسبة 4:3.'],
  ['المعلومات', 'عرّف بخطّك', 'ما يظهر في بطاقة الخط وصفحته ونتائج البحث.'],
  ['الإتاحة', 'الإتاحة والتسعير', 'ما تحدّده هنا هو ما يراه المشتري في لوحة الترخيص.'],
  ['المراجعة', 'راجع وأرسل', 'يراجع فريق حرف الخط قبل ظهوره في المكتبة، عادةً خلال يوم.'],
] as const;
const LAST = STEPS.length - 1;
const LABELS = STEPS.map(([l]) => l);

const STORAGE = 'harf-publish-draft';

/**
 * مساحة النشر (دليل التصميم 6.6، بترتيب مراجع Wayl): عمود واحد مركّز، «الخطوة 2 من 5» وشريط تقدّم
 * يُنقر للقفز بين الخطوات، عنوان كبير لكل خطوة، وشريط سفلي ثابت فيه «رجوع» و«التالي: اسم الخطوة».
 * «التالي» يُظهر نواقص الخطوة الحالية ولا يتقدّم حتى تكتمل؛ الشريط العلوي يسمح بالقفز الحرّ.
 * المسودّة تُحفظ تلقائياً في المتصفّح، والمراجعة تعرض ما أُدخل وتسمّي النواقص.
 */
export function PublishWorkspace({
  isAdmin,
  onSubmit,
}: {
  isAdmin: boolean;
  onSubmit: (d: unknown) => SubmitResult | Promise<SubmitResult>;
}) {
  const [draft, setDraft] = useState<WorkDraft>(EMPTY_DRAFT);
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<'idle' | 'saved'>('saved');
  // الخطوات التي طُلب إظهار نواقصها (بعد «التالي» عليها، أو كلّها عند الإرسال)
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // استرجاع المسودّة (الملفات والصور لا تُحفظ في المتصفّح — تُرفع للخادم في المنتج)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const saved = { ...EMPTY_DRAFT, ...JSON.parse(raw), files: [], consent: false } as WorkDraft;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- قراءة التخزين بعد الترطيب
        setDraft(isAdmin ? saved : { ...saved, mode: 'studio' });
      }
    } catch {
      /* مسودّة تالفة ← نبدأ من جديد */
    }
  }, [isAdmin]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE, JSON.stringify({ ...draft, files: [], consent: false }));
        setSaved('saved');
      } catch {
        /* التخزين غير متاح */
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [draft]);

  const full = useMemo(() => ({ ...draft, images: images.length }), [draft, images.length]);
  const check = useMemo(() => draftSchema.safeParse(full), [full]);
  const issues = check.success ? [] : check.error.issues;
  const stepIssues = issues.map((i) => ({ step: STEP_OF_FIELD[String(i.path[0])] ?? LAST, message: i.message }));
  const errors: Record<string, string | undefined> = Object.fromEntries(
    issues.filter((_, k) => checked.has(stepIssues[k]!.step)).map((i) => [String(i.path[0]), i.message]),
  );
  const stepDone = (i: number) => !stepIssues.some((x) => x.step === i);
  const markChecked = (...steps: number[]) => setChecked((c) => new Set([...c, ...steps]));
  const go = (i: number) => {
    setStep(i);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const next = () => {
    markChecked(step);
    if (stepDone(step)) go(step + 1);
  };
  const set = (patch: Partial<WorkDraft>) => {
    setSaved('idle');
    setDraft((d) => ({ ...d, ...patch }));
  };

  function submit() {
    markChecked(0, 1, 2, 3, 4);
    if (!check.success) {
      if (step !== LAST) go(LAST);
      return;
    }
    start(async () => {
      const res = await onSubmit(full);
      if (res.ok) {
        setDone(res.reference);
        try {
          localStorage.removeItem(STORAGE);
        } catch {
          /* لا شيء */
        }
      } else toast({ tone: 'danger', title: 'لم يُرسل الخط', description: res.errors[0]?.message });
    });
  }

  if (done)
    return (
      <div
        role="status"
        className="mx-auto flex max-w-md animate-fade-up flex-col items-center gap-3 rounded-xl border bg-card p-10 text-center"
      >
        <span className="grid size-14 place-items-center rounded-full bg-tint-ok text-ok-text">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="text-xl font-semibold">أُرسل الخط للمراجعة</h2>
        <p className="text-control text-muted-foreground">
          رقم المراجعة{' '}
          <span dir="ltr" className="tabular-nums">
            {done}
          </span>
          . تصلك رسالة خلال 24 ساعة.
        </p>
        <Button asChild className="mt-2">
          <Link to={paths.studio.getHref()}>العودة إلى لوحة المسبك</Link>
        </Button>
      </div>
    );

  const [, title, lead] = STEPS[step]!;
  const nextLabel = step < LAST ? STEPS[step + 1]![0] : null;
  return (
    <div className="mx-auto flex max-w-170 flex-col">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={paths.studio.getHref()}
          className="inline-flex items-center gap-1 rounded-full py-1.5 ps-1 pe-3 text-meta text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          <ChevronRightIcon className="size-4" />
          لوحة المسبك
        </Link>
        <span role="status" className="flex items-center gap-1.5 text-caption text-tertiary">
          <span
            className={cn(
              'size-1.5 rounded-full transition-colors',
              saved === 'saved' ? 'bg-ok-500' : 'animate-pulse bg-strong',
            )}
          />
          {saved === 'saved' ? 'المسودّة محفوظة' : 'جارٍ الحفظ…'}
        </span>
      </div>

      <nav aria-label="خطوات النشر" className="mt-6">
        <ol className="grid grid-cols-5 gap-1.5">
          {STEPS.map(([label], i) => {
            const flagged = checked.has(i) && !stepDone(i);
            const complete = i !== step && stepDone(i) && (checked.has(i) || i < step);
            return (
              <li key={label}>
                <button
                  type="button"
                  aria-current={step === i ? 'step' : undefined}
                  aria-label={`${i + 1}. ${label}${complete ? ' — مكتملة' : flagged ? ' — ناقصة' : ''}`}
                  onClick={() => go(i)}
                  className="group/st flex w-full flex-col gap-2 pt-1 text-start"
                >
                  <span
                    className={cn(
                      'h-1 w-full rounded-full transition-colors duration-(--dur-slow)',
                      step === i
                        ? 'bg-primary-fill'
                        : flagged
                          ? 'bg-warn-500'
                          : complete
                            ? 'bg-foreground/70'
                            : 'bg-inset',
                      'group-hover/st:opacity-80',
                    )}
                  />
                  <span
                    className={cn(
                      'flex items-center gap-1 text-caption max-sm:sr-only',
                      step === i ? 'font-medium text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {complete && <CheckIcon className="size-3 text-ok-text" />}
                    {flagged && <ExclamationIcon className="size-3 text-warn-text" />}
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <header key={`h${step}`} className="mt-10 animate-fade-up text-center">
        <p className="text-caption text-tertiary">
          الخطوة {step + 1} من {STEPS.length}
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-[46ch] text-control text-muted-foreground">{lead}</p>
      </header>

      {isAdmin && step === 3 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 ps-4">
          <p className="text-caption text-muted-foreground">من ينشر؟</p>
          <SegmentedControl
            label="وضع النشر"
            value={draft.mode}
            onChange={(mode) => set({ mode })}
            options={[
              { value: 'studio', label: 'حساب الاستوديو' },
              { value: 'admin', label: 'حساب المشرف' },
            ]}
          />
        </div>
      )}

      <section aria-label={title} key={step} className="mt-8 min-w-0 animate-fade-up">
        {step === 0 && <FilesStep draft={draft} set={set} errors={errors} />}
        {step === 1 && <ImagesStep images={images} setImages={setImages} errors={errors} />}
        {step === 2 && <InfoStep draft={draft} set={set} errors={errors} />}
        {step === 3 && <PricingStep draft={draft} set={set} errors={errors} />}
        {step === LAST && (
          <ReviewStep
            draft={draft}
            set={set}
            errors={errors}
            images={images}
            issues={stepIssues}
            labels={LABELS}
            onEdit={go}
          />
        )}
      </section>

      {/* شريط الإجراءات: يلتصق بأسفل الشاشة أثناء التمرير، ويستقرّ فوق التذييل في النهاية */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-10 bg-background/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:px-0">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="border-transparent"
            disabled={step === 0}
            onClick={() => go(step - 1)}
          >
            <ChevronRightIcon />
            رجوع
          </Button>
          {nextLabel ? (
            <Button size="lg" className="flex-1" onClick={next}>
              التالي: {nextLabel}
              <ChevronLeftIcon />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={submit} loading={pending}>
              إرسال للمراجعة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
