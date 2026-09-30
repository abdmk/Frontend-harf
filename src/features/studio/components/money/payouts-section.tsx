import { useActionState, useEffect, useRef, useState } from 'react';

import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { BankIcon, CheckIcon, ClockIcon, CrossIcon, DollarIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { formatDateAr, formatMoney } from '@/lib/format';
import { cents } from '@/types/domain/commerce';

import { changePayoutAccount, type FormState, type Payout, requestPayout, useEarnings } from '../../api/earnings';
import { PUBLISHER_TERMS } from '../../config/publisher-terms';

const STATUS: Record<
  Payout['status'],
  { label: string; tone: 'success' | 'warning' | 'danger'; Icon: typeof CheckIcon }
> = {
  paid: { label: 'مكتمل', tone: 'success', Icon: CheckIcon },
  processing: { label: 'قيد المعالجة', tone: 'warning', Icon: ClockIcon },
  failed: { label: 'فشل — أُعيد للرصيد', tone: 'danger', Icon: CrossIcon },
};

/** يغلق النافذة ويُظهر إشعاراً عند نجاح جديد (مرّة لكل حالة) */
function useOnSuccess(state: FormState, done: () => void) {
  const handled = useRef<FormState>(null);
  useEffect(() => {
    if (!state?.ok || handled.current === state) return;
    handled.current = state;
    const t = window.setTimeout(done);
    return () => window.clearTimeout(t);
  }, [state, done]);
}

function RequestPayoutDialog({ available, disabled }: { available: number; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(requestPayout, null);
  useOnSuccess(state, () => {
    setOpen(false);
    toast({ tone: 'success', title: 'أُرسل طلب السحب', description: 'يصل خلال 3–5 أيام عمل.' });
  });
  const f = state?.fields ?? {};
  const enough = available >= PUBLISHER_TERMS.minPayout.cents;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} disabled={disabled || !enough}>
        <DollarIcon />
        اطلب سحباً
      </Button>
      <DialogContent>
        <div>
          <DialogTitle>اطلب سحباً</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            المتاح{' '}
            <strong dir="ltr" className="text-foreground">
              {formatMoney(cents(available))}
            </strong>{' '}
            · الحدّ الأدنى {formatMoney(PUBLISHER_TERMS.minPayout)}
          </DialogDescription>
        </div>
        <form key={JSON.stringify(state?.values ?? {})} action={action} noValidate className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="po-amount" required>
              المبلغ (دولار)
            </FieldLabel>
            <Input
              id="po-amount"
              name="amount"
              inputMode="decimal"
              dir="ltr"
              maxLength={10}
              defaultValue={state?.values?.amount ?? (available / 100).toFixed(2)}
              aria-invalid={!!f.amount}
              aria-describedby="po-amount-err"
            />
            <FieldError id="po-amount-err">{f.amount}</FieldError>
          </Field>
          {state?.message && !state.ok && <FieldError>{state.message}</FieldError>}
          <Button type="submit" loading={pending}>
            تأكيد السحب
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangeAccountDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(changePayoutAccount, null);
  useOnSuccess(state, () => {
    setOpen(false);
    toast({
      tone: 'success',
      title: 'غُيّر حساب التحويل',
      description: `أرسلنا تأكيداً إلى بريدك. التحويلات معلّقة ${PUBLISHER_TERMS.accountChangeHoldHours} ساعة للحماية.`,
    });
  });
  const f = state?.fields ?? {};
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        تغيير
      </Button>
      <DialogContent className="sm:max-w-dialog-md">
        <div>
          <DialogTitle>تغيير حساب التحويل</DialogTitle>
          <DialogDescription className="mt-1 text-meta leading-relaxed text-muted-foreground">
            للحماية: نرسل تأكيداً إلى بريدك، وتُعلَّق التحويلات {PUBLISHER_TERMS.accountChangeHoldHours} ساعة بعد
            التغيير.
          </DialogDescription>
        </div>
        <form key={JSON.stringify(state?.values ?? {})} action={action} noValidate className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="po-holder" required>
              اسم صاحب الحساب
            </FieldLabel>
            <Input
              id="po-holder"
              name="holder"
              defaultValue={state?.values?.holder}
              maxLength={80}
              autoComplete="name"
              aria-invalid={!!f.holder}
              aria-describedby="po-holder-err"
            />
            <FieldError id="po-holder-err">{f.holder}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="po-iban" required>
              رقم الحساب الدولي (IBAN)
            </FieldLabel>
            <Input
              id="po-iban"
              name="iban"
              defaultValue={state?.values?.iban}
              dir="ltr"
              maxLength={42}
              autoComplete="off"
              spellCheck={false}
              placeholder="IQ98 NBIQ 8501 2345 6789 012"
              aria-invalid={!!f.iban}
              aria-describedby="po-iban-hint po-iban-err"
            />
            <FieldHint id="po-iban-hint">
              نحفظ آخر 4 أرقام فقط للعرض؛ الرقم الكامل يُرسل مشفّراً إلى مزوّد الدفع.
            </FieldHint>
            <FieldError id="po-iban-err">{f.iban}</FieldError>
          </Field>
          <label className="flex items-start gap-3 text-meta leading-relaxed">
            <Checkbox
              name="confirm"
              defaultChecked={state?.values?.confirm === 'on'}
              className="mt-0.5"
              aria-invalid={!!f.confirm}
            />
            الحساب باسمي أو باسم مسبكي، وأنا مخوّل باستلام الأرباح عليه.
          </label>
          {f.confirm && <FieldError>{f.confirm}</FieldError>}
          {state?.message && !state.ok && <FieldError>{state.message}</FieldError>}
          <Button type="submit" loading={pending}>
            حفظ الحساب
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** «السحب»: حساب التحويل، طلب سحب يدوي، وسجلّ التحويلات */
export function PayoutsSection() {
  const e = useEarnings();
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <section className="flex animate-fade-up flex-col justify-between gap-5 rounded-xl border bg-card p-6">
          <div>
            <p className="text-control text-muted-foreground">الرصيد المتاح</p>
            <p dir="ltr" className="mt-2 text-right text-4xl font-semibold tracking-tight tabular-nums">
              {formatMoney(cents(e.available))}
            </p>
            <p className="mt-2 text-meta text-muted-foreground">
              يُحوَّل تلقائياً كل {PUBLISHER_TERMS.payoutEveryDays} يوماً متى تجاوز{' '}
              {formatMoney(PUBLISHER_TERMS.minPayout)} — أو اسحبه الآن.
            </p>
          </div>
          <div>
            <RequestPayoutDialog available={e.available} disabled={!!e.holdUntil} />
          </div>
        </section>

        <section className="flex animate-fade-up flex-col gap-4 rounded-xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="text-control text-muted-foreground">حساب التحويل</p>
            <ChangeAccountDialog />
          </div>
          <div className="flex items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-sunken">
              <BankIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{e.account.holder}</p>
              <p dir="ltr" className="text-right text-meta text-muted-foreground tabular-nums">
                {e.account.country}•• •••• {e.account.last4}
              </p>
            </div>
          </div>
          {e.holdUntil ? (
            <p className="flex gap-2 rounded-md bg-tint-warn px-3 py-2.5 text-meta text-warn-text">
              <ClockIcon className="mt-0.5 size-4 shrink-0" />
              غُيّر الحساب مؤخراً — التحويلات معلّقة حتى {formatDateAr(e.holdUntil.slice(0, 10))}.
            </p>
          ) : (
            <p className="flex gap-2 text-caption text-tertiary">
              <ShieldCheckIcon className="size-3.5 shrink-0" />
              تغيير الحساب يتطلّب تأكيداً من بريدك.
            </p>
          )}
        </section>
      </div>

      <SectionCard title="سجلّ التحويلات" bodyClassName="p-4 sm:p-6">
        <Table aria-label="سجلّ التحويلات">
          <TableHeader>
            <TableRow>
              <TableHead>المرجع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحساب</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-end">المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {e.payouts.map((p) => {
              const st = STATUS[p.status];
              return (
                <TableRow key={p.id}>
                  <TableCell dir="ltr" className="text-right text-caption tabular-nums">
                    {p.id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateAr(p.date)}</TableCell>
                  <TableCell dir="ltr" className="text-right text-muted-foreground tabular-nums">
                    •••• {p.last4}
                  </TableCell>
                  <TableCell>
                    <Badge tone={st.tone} icon={<st.Icon />}>
                      {st.label}
                    </Badge>
                  </TableCell>
                  <TableCell dir="ltr" className="text-start font-semibold tabular-nums">
                    {formatMoney(cents(p.amountCents))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
