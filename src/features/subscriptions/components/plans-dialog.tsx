import { type ReactElement, type RefObject, useCallback, useRef, useState, useTransition } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckIcon, CrossSmallIcon, CrownIcon, DiamondIcon, LockIcon, UserIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { BillingCycle, PlanOffer } from '@/types/domain/subscription';
import type { Plan } from '@/types/domain/user';

import type { ChangePlanResult } from '../api/actions';

const PLAN_ICON = { free: UserIcon, basic: DiamondIcon, studio: CrownIcon } as const;
const PLAN_RING: Record<Plan, string> = {
  free: '[--plan-grad:var(--grad-plan-free)]',
  basic:
    '[--plan-grad:var(--grad-plan-basic)] border-gold-500 [--plan-badge:var(--color-gold-500)] [--plan-badge-fg:var(--color-gold-foreground)]',
  studio:
    '[--plan-grad:var(--grad-plan-studio)] border-trial-500 [--plan-badge:var(--color-trial-600)] [--plan-badge-fg:var(--color-paper)]',
};

type Step = { kind: 'plans' } | { kind: 'pay'; plan: PlanOffer } | { kind: 'done'; plan: PlanOffer };

/**
 * نافذة «اختر خطتك» (تصميم 21-09): شهري/سنوي، ثلاث بطاقات، ثم خطوة الدفع داخل النافذة ثم النجاح.
 * الأسعار والمزايا بيانات تجريبية من الخادم.
 */
export function PlansDialog({
  plans,
  current,
  trigger,
  onChange,
  open: openProp,
  onOpenChange,
  returnFocusTo,
  welcome = false,
  startWith,
}: {
  plans: PlanOffer[];
  current: Plan;
  /** زرّ الفتح — اختياري حين تُفتح النافذة من الخارج عبر open/onOpenChange */
  trigger?: ReactElement;
  onChange: (input: { plan: Plan; cycle: BillingCycle }) => ChangePlanResult | Promise<ChangePlanResult>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** بلا trigger: أين يعود التركيز عند الإغلاق (وإلا يضيع إلى body) */
  returnFocusTo?: RefObject<HTMLElement | null>;
  /** أول دخول بعد إنشاء الحساب: المجانية زرّها «تابع مجاناً» (يغلق النافذة) بدل «خطتك الحالية» */
  welcome?: boolean;
  /** يُفتح مباشرةً على خطوة الاشتراك في هذه الخطة («تحويل إلى استوديو») — «رجوع» يعرض الخطط كلها */
  startWith?: Plan;
}) {
  // أكبر توفير سنوي فعلي بين الخطط المدفوعة — الأسعار تعدّلها الإدارة، فلا رقم ثابت هنا
  const maxSaving = Math.max(
    0,
    ...plans
      .filter((p) => p.monthly.cents > 0)
      .map((p) => Math.round((1 - p.yearlyPerMonth.cents / p.monthly.cents) * 100)),
  );
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [step, setStep] = useState<Step>({ kind: 'plans' });
  // عند الفتح بخطة محدّدة (ليست الحالية): خطوة الاشتراك فيها مباشرةً —
  // تعديل الحالة أثناء العرض عند تغيّر «مفتوحة» (نمط React الموصى به بدل effect)
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    const plan = open && startWith && startWith !== current ? plans.find((p) => p.id === startWith) : undefined;
    if (plan) setStep({ kind: 'pay', plan });
  }
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const wide = step.kind === 'plans';
  // ارتفاع المحتوى المقاس — يُعطى للنافذة صراحةً كي ينتقل ارتفاعها بنعومة بين الخطوات
  const [height, setHeight] = useState<number>();
  const observer = useRef<ResizeObserver | null>(null);
  const measure = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!el) return;
    observer.current = new ResizeObserver(([e]) => setHeight(Math.ceil(e!.borderBoxSize[0]!.blockSize)));
    observer.current.observe(el);
  }, []);

  const confirm = (plan: PlanOffer) =>
    start(async () => {
      setError(undefined);
      const res = await onChange({ plan: plan.id, cycle });
      if (res.ok) setStep({ kind: 'done', plan });
      else setError(res.error);
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(() => setStep({ kind: 'plans' }), 300);
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        // المقاس على قدر المحتوى: الخطط الثلاث عريضة، والدفع والنجاح نافذتان صغيرتان — والانتقال بينها
        // تغيّرٌ متدرّج في العرض والارتفاع (لا قفزة)، والمحتوى الجديد يظهر بتلاشٍ ناعم
        className={cn(
          'block gap-0 overflow-x-hidden p-0 transition-[width,height] duration-(--dur-slow) ease-out-quint sm:max-w-none sm:p-0',
          wide ? 'w-[min(var(--container-page),calc(100vw-2rem))]' : 'w-[min(22.5rem,calc(100vw-2rem))]',
        )}
        style={height ? { height } : undefined}
        // نافذة عرض لا تأكيد: التركيز على النافذة نفسها بدل حلقة على «شهري»
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
        }}
        onCloseAutoFocus={
          returnFocusTo
            ? (e) => {
                e.preventDefault();
                returnFocusTo.current?.focus();
              }
            : undefined
        }
      >
        <div ref={measure} key={step.kind} className="animate-page-in">
          <header className={cn('border-b text-center', wide ? 'px-6 pt-8 pb-6' : 'px-12 pt-6 pb-4')}>
            <DialogTitle className={cn('font-semibold', wide ? 'text-2xl' : 'text-lg')}>
              {step.kind === 'plans'
                ? welcome
                  ? 'أهلاً بك في حرف — اختر خطتك'
                  : 'اختر خطتك'
                : step.kind === 'pay'
                  ? `الاشتراك في ${step.plan.name}`
                  : 'تمّ الاشتراك'}
            </DialogTitle>
            <DialogDescription className={cn('text-muted-foreground', wide ? 'mt-2 text-control' : 'mt-1 text-meta')}>
              {step.kind === 'plans'
                ? welcome
                  ? 'حسابك جاهز. ابدأ مجاناً الآن، أو اختر خطة تناسب عملك — وتقدر تغيّرها في أي وقت.'
                  : 'ابدأ مجاناً، وارتقِ متى احتجت. تقدر تغيّر أو تلغي في أي وقت.'
                : 'بيانات تجريبية — لا يُخصم أي مبلغ.'}
            </DialogDescription>
          </header>

          {step.kind === 'plans' && (
            <div className="flex flex-col items-center gap-6 px-4 pt-6 pb-8 sm:px-8">
              <SegmentedControl
                label="دورة الفوترة"
                value={cycle}
                onChange={setCycle}
                options={[
                  { value: 'monthly', label: 'شهري' },
                  { value: 'yearly', label: maxSaving > 0 ? `سنوي · وفّر ${maxSaving}%` : 'سنوي' },
                ]}
              />
              <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                {plans.map((p) => {
                  const Icon = PLAN_ICON[p.id];
                  const isCurrent = p.id === current;
                  const price = cycle === 'monthly' ? p.monthly : p.yearlyPerMonth;
                  const free = p.monthly.cents === 0;
                  return (
                    <li
                      key={p.id}
                      className={cn(
                        'relative flex flex-col gap-5 rounded-lg border-[1.5px] bg-card p-5',
                        PLAN_RING[p.id],
                      )}
                    >
                      {p.badge && (
                        <span className="absolute start-5 -top-3 rounded-full bg-(--plan-badge) px-2.5 py-0.5 text-caption font-medium text-(--plan-badge-fg)">
                          {p.badge}
                        </span>
                      )}
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                          <Icon className="size-4.5" />
                          {p.name}
                        </h3>
                        <p className="mt-1 text-caption text-muted-foreground">{p.tagline}</p>
                      </div>
                      <div className="rounded-md p-4 [background:var(--plan-grad)]">
                        <p className="flex items-baseline gap-1.5">
                          <span dir="ltr" className="text-4xl font-semibold tracking-tight">
                            {formatMoney(price)}
                          </span>
                          <span className="text-caption text-muted-foreground">{free ? 'دائماً' : '/ شهرياً'}</span>
                        </p>
                        <p className="mt-3 rounded-xs bg-card/80 px-3 py-1.5 text-caption text-muted-foreground">
                          {free
                            ? 'بلا بطاقة ولا التزام'
                            : cycle === 'monthly'
                              ? `${formatMoney({ ...p.monthly, cents: p.monthly.cents * 12 })} سنوياً بالفوترة الشهرية`
                              : `${formatMoney(p.yearlyTotal)} تُدفع سنوياً`}
                        </p>
                      </div>
                      <div className="flex-1">
                        {p.inherits && <p className="mb-3 text-caption text-tertiary">{p.inherits}</p>}
                        <ul className="flex flex-col gap-2.5">
                          {p.features.map((f) => (
                            <li
                              key={f.label}
                              className={cn('flex items-center gap-2 text-meta', !f.included && 'text-tertiary')}
                            >
                              {f.included ? (
                                <CheckIcon className="size-3.5 text-ok-text" />
                              ) : (
                                <CrossSmallIcon className="size-3.5" />
                              )}
                              <span className={cn(!f.included && 'line-through decoration-transparent')}>
                                {f.label}
                              </span>
                              <span className="sr-only">{f.included ? '(مشمول)' : '(غير مشمول)'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {isCurrent && welcome && free ? (
                        <Button size="lg" variant="outline" block onClick={() => setOpen(false)}>
                          تابع مجاناً
                        </Button>
                      ) : isCurrent ? (
                        <Button size="lg" variant="secondary" disabled block>
                          خطتك الحالية
                        </Button>
                      ) : free ? (
                        <Button size="lg" variant="secondary" block loading={pending} onClick={() => confirm(p)}>
                          الرجوع إلى المجانية
                        </Button>
                      ) : (
                        <Button size="lg" block onClick={() => setStep({ kind: 'pay', plan: p })}>
                          ابدأ {p.name}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
              {error && (
                <p role="alert" className="text-meta text-dgr-text">
                  {error}
                </p>
              )}
            </div>
          )}

          {step.kind === 'pay' && (
            <div className="flex flex-col gap-3 p-5">
              <dl className="flex flex-col gap-2 rounded-md border px-4 py-3 text-control">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">الخطة</dt>
                  <dd className="font-medium">
                    {step.plan.name} — {cycle === 'monthly' ? 'شهري' : 'سنوي'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">يُدفع الآن</dt>
                  <dd dir="ltr" className="font-semibold">
                    {formatMoney(cycle === 'monthly' ? step.plan.monthly : step.plan.yearlyTotal)}
                  </dd>
                </div>
              </dl>
              <p className="flex items-start gap-2 rounded-md bg-sunken px-4 py-3 text-caption leading-relaxed text-muted-foreground">
                <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                في المنتج تُفتح هنا خطوة الدفع الآمنة من Stripe، ويُفعَّل الاشتراك بعد تأكيدها.
              </p>
              {error && (
                <p role="alert" className="text-meta text-dgr-text">
                  {error}
                </p>
              )}
              <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
                <Button loading={pending} onClick={() => confirm(step.plan)}>
                  <LockIcon />
                  اشترك الآن
                </Button>
                <Button variant="secondary" onClick={() => setStep({ kind: 'plans' })}>
                  رجوع
                </Button>
              </div>
            </div>
          )}

          {step.kind === 'done' && (
            <div role="status" className="flex animate-fade-up flex-col items-center gap-2 p-5 pt-6 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-tint-ok text-ok-text">
                <CheckIcon className="size-5 animate-pop-in" />
              </span>
              <p className="mt-1 text-lead font-semibold">أنت الآن على خطة {step.plan.name}</p>
              <Badge tone="success">نشطة</Badge>
              <Button block className="mt-3" onClick={() => setOpen(false)}>
                تمّ
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
