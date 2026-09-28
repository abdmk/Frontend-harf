import { useEffect, useMemo, useState, useTransition } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';

import { ConsentField, FilesStep, ImagesStep, InfoStep, PricingStep } from './publish-steps';
import type { SubmitResult } from '../api/submit';
import { draftSchema, EMPTY_DRAFT, STEP_OF_FIELD, type WorkDraft } from '../types/draft';

const STEPS = [
  ['الملفات', 'ملفات الخط', 'ارفع كل أوزان العائلة. نقرأ من كل ملف اسمه ووزنه وصيغته، فلا تكتبها بيدك.'],
  ['الصور', 'صور الخط', 'الصورة الأولى غلاف البطاقة في المكتبة.'],
  ['المعلومات', 'معلومات الخط', 'ما يظهر في بطاقة الخط وصفحته.'],
  ['الإتاحة والتسعير', 'الإتاحة والتسعير', 'التراخيص والأسعار التي تحدّدها هنا هي ما يراه المشتري في لوحة الترخيص.'],
  ['المراجعة', 'المراجعة والإرسال', 'راجع كل قسم قبل الإرسال. يراجع المشرفون الخط قبل ظهوره في المكتبة.'],
] as const;

const STORAGE = 'harf-publish-draft';

/**
 * مساحة النشر (دليل التصميم 6.6): خطوات يمكن القفز بينها، مسودّة تُحفظ تلقائياً في المتصفّح،
 * ومراجعة تسمّي النواقص بدل زرّ معطّل صامت. وضع المشرف يبدّل خطوة التسعير بالمصدر.
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
  const [saved, setSaved] = useState<'idle' | 'saved'>('idle');
  const [showErrors, setShowErrors] = useState(false);
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
  const errors: Record<string, string | undefined> = showErrors
    ? Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]))
    : {};
  const stepDone = (i: number) => !issues.some((x) => STEP_OF_FIELD[String(x.path[0])] === i);
  const set = (patch: Partial<WorkDraft>) => {
    setSaved('idle');
    setDraft((d) => ({ ...d, ...patch }));
  };

  function submit() {
    setShowErrors(true);
    if (!check.success) {
      setStep(4);
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
          <span dir="ltr" className="font-mono">
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
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to={paths.studio.getHref()}
            className="inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-foreground"
          >
            <ChevronRightIcon className="size-4" />
            الاستوديو
          </Link>
          <h1 className="text-lg font-semibold">{draft.nameAr || 'خط جديد'}</h1>
          <span role="status" className="flex items-center gap-1.5 text-caption text-tertiary">
            <span className={cn('size-1.5 rounded-full', saved === 'saved' ? 'bg-ok-500' : 'bg-strong')} />
            {saved === 'saved' ? 'حُفظت المسودّة' : 'جارٍ الحفظ…'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => toast({ tone: 'success', title: 'حُفظت المسودّة في هذا المتصفّح' })}
          >
            حفظ كمسودّة
          </Button>
          <Button onClick={submit} loading={pending}>
            إرسال للمراجعة
          </Button>
        </div>
      </header>

      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-sunken/60 px-5 py-3 sm:px-6">
          <p className="text-caption text-muted-foreground">
            من ينشر؟ — حساب الاستوديو ينشر خطوطه ويسعّرها، والمشرف ينشر خطوطاً خارجية بمصدرها.
          </p>
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

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-6 lg:grid-cols-[200px_minmax(0,1fr)_260px]">
        <nav aria-label="خطوات النشر">
          <p className="mb-2 text-caption text-tertiary">الخطوات</p>
          <ol className="flex gap-1 overflow-x-auto lg:flex-col">
            {STEPS.map(([label], i) => (
              <li key={label} className="shrink-0">
                <button
                  type="button"
                  aria-current={step === i ? 'step' : undefined}
                  onClick={() => setStep(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-start text-control transition-colors',
                    step === i ? 'bg-sunken font-medium' : 'text-muted-foreground hover:bg-sunken/60',
                  )}
                >
                  <span
                    dir="ltr"
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full border text-caption',
                      step === i && 'border-primary text-primary',
                      showErrors && !stepDone(i) && 'border-dgr-500 text-dgr-text',
                      showErrors && stepDone(i) && 'border-ok-500 bg-ok-500 text-white',
                    )}
                  >
                    {showErrors && stepDone(i) ? <CheckIcon className="size-3" /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section aria-labelledby="step-title" key={step} className="min-w-0 animate-fade-up">
          <h2 id="step-title" className="text-xl font-semibold">
            {title}
          </h2>
          <p className="mt-1 mb-6 text-meta text-muted-foreground">{lead}</p>
          {step === 0 && <FilesStep draft={draft} set={set} errors={errors} />}
          {step === 1 && <ImagesStep images={images} setImages={setImages} errors={errors} />}
          {step === 2 && <InfoStep draft={draft} set={set} errors={errors} />}
          {step === 3 && <PricingStep draft={draft} set={set} errors={errors} />}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <ul className="flex flex-col gap-2">
                {STEPS.slice(0, 4).map(([label], i) => {
                  const missing = issues.filter((x) => STEP_OF_FIELD[String(x.path[0])] === i);
                  return (
                    <li key={label} className="flex items-start justify-between gap-4 rounded-md border p-4">
                      <div>
                        <p className="text-control font-medium">{label}</p>
                        {missing.length > 0 && (
                          <ul className="mt-1 flex flex-col gap-0.5 text-caption text-dgr-text">
                            {missing.map((m) => (
                              <li key={m.message}>{m.message}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {missing.length ? (
                        <Button size="sm" variant="ghost" onClick={() => setStep(i)}>
                          <ExclamationIcon />
                          أكمل
                        </Button>
                      ) : (
                        <Badge tone="success" icon={<CheckIcon />}>
                          مكتمل
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
              <ConsentField draft={draft} set={set} errors={errors} />
            </div>
          )}
          <div className="mt-8 flex justify-between gap-3">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ChevronRightIcon />
              السابق
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                التالي
                <ChevronLeftIcon />
              </Button>
            ) : (
              <Button onClick={submit} loading={pending}>
                إرسال للمراجعة
              </Button>
            )}
          </div>
        </section>

        <aside className="max-lg:hidden">
          <p className="mb-2 text-caption text-tertiary">كما سيظهر في المكتبة</p>
          <div className="overflow-hidden rounded-lg border">
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-(image:--grad-ink) text-3xl font-semibold text-white">
              {images[0] ? (
                <img src={images[0].url} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                draft.nameAr || 'خطّك'
              )}
              <span className="absolute end-3 top-3">
                <Badge
                  appearance="solid"
                  tone={draft.mode === 'admin' ? 'neutral' : draft.availability === 'paid' ? 'studio' : 'success'}
                >
                  {draft.mode === 'admin' ? 'خارجي' : draft.availability === 'paid' ? 'مدفوع' : 'مجاني'}
                </Badge>
              </span>
            </div>
            <div className="p-4">
              <p className="font-semibold">{draft.nameAr || 'اسم الخط'}</p>
              <p className="text-caption text-muted-foreground">
                {draft.designers || 'المصمّم'} · {draft.files.length} أوزان
              </p>
            </div>
          </div>
          <ul className="mt-4 flex flex-col gap-1.5 text-caption">
            {STEPS.slice(0, 4).map(([label], i) => (
              <li key={label} className={cn('flex items-center gap-2', stepDone(i) ? 'text-ok-text' : 'text-tertiary')}>
                {stepDone(i) ? <CheckIcon className="size-3.5" /> : <span className="h-px w-3.5 bg-current" />}
                {label}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
