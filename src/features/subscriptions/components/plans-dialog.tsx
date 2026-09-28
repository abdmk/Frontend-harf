import { type ReactElement, type RefObject, useState, useTransition } from 'react';

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
  free: '',
  basic: 'border-gold-500 [--plan-badge:var(--color-gold-500)]',
  studio: 'border-trial-500 [--plan-badge:var(--color-trial-500)]',
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
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [step, setStep] = useState<Step>({ kind: 'plans' });
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const wide = step.kind === 'plans';

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
        // المقاس على قدر المحتوى: الخطط الثلاث عريضة، والدفع والنجاح نافذتان صغيرتان
        className={cn('gap-0 overflow-hidden p-0 sm:p-0', wide ? 'sm:max-w-page' : 'sm:max-w-dialog-sm')}
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
        <header className={cn('border-b text-center', wide ? 'px-6 pt-8 pb-6' : 'px-12 pt-6 pb-4')}>
          <DialogTitle className={cn('font-semibold', wide ? 'text-2xl' : 'text-lg')}>
            {step.kind === 'plans'
              ? 'اختر خطتك'
              : step.kind === 'pay'
                ? `الاشتراك في ${step.plan.name}`
                : 'تمّ الاشتراك'}
          </DialogTitle>
          <DialogDescription className={cn('text-muted-foreground', wide ? 'mt-2 text-control' : 'mt-1 text-meta')}>
            {step.kind === 'plans'
              ? 'ابدأ مجاناً، وارتقِ متى احتجت. تقدر تغيّر أو تلغي في أي وقت.'
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
                { value: 'yearly', label: 'سنوي · وفّر 30%' },
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
                      <span className="absolute start-5 -top-3 rounded-full bg-(--plan-badge) px-2.5 py-0.5 text-caption font-medium text-white">
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
                    <div className="rounded-md bg-sunken p-4">
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
                            <span className={cn(!f.included && 'line-through decoration-transparent')}>{f.label}</span>
                            <span className="sr-only">{f.included ? '(مشمول)' : '(غير مشمول)'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {isCurrent ? (
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
      </DialogContent>
    </Dialog>
  );
}
