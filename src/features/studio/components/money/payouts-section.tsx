import { useActionState, useEffect, useRef, useState } from 'react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PayoutCard, SecureNote } from '@/components/shared/payout-card';
import { PayoutDialog } from '@/components/shared/payout-dialog';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { CheckIcon, ClockIcon, CrossIcon, DollarIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { getCurrentUser } from '@/lib/auth';
import { formatDateAr, formatMoney } from '@/lib/format';
import type { MaskedPayout } from '@/lib/payout';
import { PUBLISHER_TERMS } from '@/lib/publisher-terms';
import { cents } from '@/types/domain/commerce';

import {
  type FormState,
  type Payout,
  type PayoutAccount,
  removePayoutAccount,
  requestPayout,
  savePayoutAccount,
  useEarnings,
} from '../../api/earnings';

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

/** حساب التحويل: بطاقة مقنّعة مع «تحديث» و«إزالة»، والتغيير يمرّ برمز تأكيد */
function PayoutAccountPanel({ account, holdUntil }: { account: PayoutAccount | null; holdUntil?: string }) {
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const email = getCurrentUser()?.email ?? '';

  function saved(p: MaskedPayout) {
    const r = savePayoutAccount(p);
    if (!r.ok) return toast({ tone: 'danger', title: r.error });
    toast({
      tone: 'success',
      title: 'حُفظت وسيلة الاستلام',
      description: `للحماية تُعلَّق التحويلات ${PUBLISHER_TERMS.accountChangeHoldHours} ساعة.`,
    });
  }

  return (
    <section className="flex animate-fade-up flex-col gap-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lead font-semibold">وسيلة الاستلام</h2>
        <p className="mt-1 text-meta text-muted-foreground">إلى أين نحوّل أرباحك.</p>
      </div>
      {account ? (
        <PayoutCard
          payout={account}
          actions={
            <>
              <Button variant="secondary" size="lg" onClick={() => setEditing(true)}>
                تحديث
              </Button>
              <Button variant="danger" size="lg" onClick={() => setRemoving(true)}>
                إزالة
              </Button>
            </>
          }
        />
      ) : (
        <Button variant="outline" size="lg" onClick={() => setEditing(true)}>
          <PlusIcon />
          أضف وسيلة استلام
        </Button>
      )}
      {holdUntil ? (
        <p className="flex gap-2 rounded-md bg-tint-warn px-3 py-2.5 text-meta text-warn-text">
          <ClockIcon className="mt-0.5 size-4 shrink-0" />
          غُيّرت الوسيلة مؤخراً — التحويلات معلّقة حتى {formatDateAr(holdUntil.slice(0, 10))}.
        </p>
      ) : (
        <SecureNote className="justify-start" />
      )}
      <PayoutDialog open={editing} onOpenChange={setEditing} email={email} onSaved={saved} />
      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title="إزالة وسيلة الاستلام؟"
        description="تتوقّف التحويلات حتى تضيف وسيلة جديدة. يبقى رصيدك محفوظاً."
        confirmLabel="إزالة"
        icon={<TrashIcon />}
        onConfirm={() => {
          setRemoving(false);
          removePayoutAccount();
          toast({ title: 'أُزيلت وسيلة الاستلام' });
        }}
      />
    </section>
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
            <RequestPayoutDialog available={e.available} disabled={!!e.holdUntil || !e.account} />
          </div>
        </section>

        <PayoutAccountPanel account={e.account} holdUntil={e.holdUntil} />
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
