import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { type ReactNode, useActionState, useState } from 'react';
import { Link } from 'react-router';

import { Avatar } from '@/components/shared/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  CartIcon,
  CheckIcon,
  CreditCardIcon,
  CrossIcon,
  DocumentIcon,
  DownloadIcon,
  GlobeIcon,
  LockIcon,
  UserIcon,
} from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { COUNTRIES } from '@/config/countries';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { Money, PaymentMethod } from '@/types/domain/commerce';

import type { PayState } from '../api/pay';

const METHODS: [PaymentMethod, string, ReactNode][] = [
  ['card', 'بطاقة', <CreditCardIcon key="c" filled="auto" className="size-5" />],
  [
    'apple_pay',
    'Apple Pay',
    <span key="a" className="rounded-[4px] border px-1 text-micro font-medium">
      Apple Pay
    </span>,
  ],
  [
    'google_pay',
    'Google Pay',
    <span key="g" className="rounded-[4px] border px-1 text-micro font-medium">
      G Pay
    </span>,
  ],
];

type Props = {
  user: { id: string; name: string; email: string; initials: string };
  total: Money;
  /** السلة فارغة: يعرض دعوة للتصفّح — إلا بعد دفع ناجح (فالسلة تُفرَّغ عمداً) */
  empty?: boolean;
  action: (prev: PayState, form: FormData) => PayState | Promise<PayState>;
};

/**
 * نموذج الدفع (دليل التصميم 5.7): الحساب ← صاحب الترخيص ← الدفع، ثم حالات ما بعد الدفع.
 * حقول البطاقة هنا شكلية: لا تحمل name ولا تُرسل — في المنتج يحلّ محلّها Stripe Elements.
 */
export function CheckoutForm({ user, total, empty, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: 'idle' });
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [country, setCountry] = useState('IQ');
  const [attempt, setAttempt] = useState(0);

  if (pending) return <PaymentResult kind="processing" total={total} />;
  if (state.status === 'paid')
    return (
      <PaymentResult kind="paid" total={state.order.total}>
        <dl className="my-5 flex flex-col divide-y text-control">
          <div className="flex justify-between py-2.5">
            <dt className="text-muted-foreground">رقم الطلب</dt>
            <dd dir="ltr" className="tabular-nums">
              {state.order.id}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-muted-foreground">طريقة الدفع</dt>
            <dd dir="ltr" className="tabular-nums">
              {state.order.last4
                ? `Visa •••• ${state.order.last4}`
                : METHODS.find(([m]) => m === state.order.method)?.[1]}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" block>
            <Link to={paths.account.getHref('purchases')}>
              <DownloadIcon />
              حمّل الخطوط
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" block>
            <Link to={paths.account.getHref('purchases')}>
              <DocumentIcon />
              عرض الإيصال
            </Link>
          </Button>
        </div>
      </PaymentResult>
    );
  if (state.status === 'declined' && attempt === 0)
    return (
      <PaymentResult kind="declined" total={total} message={state.message}>
        <div className="mt-5 flex flex-col gap-2">
          <Button size="lg" block onClick={() => setAttempt(1)}>
            أعد المحاولة
          </Button>
          <Button
            size="lg"
            variant="secondary"
            block
            onClick={() => {
              setMethod('apple_pay');
              setAttempt(1);
            }}
          >
            غيّر طريقة الدفع
          </Button>
        </div>
      </PaymentResult>
    );

  if (empty)
    return (
      <EmptyState
        icon={<CartIcon />}
        title="لا شيء للدفع بعد"
        description="أضف ترخيص خط إلى السلة أوّلاً."
        action={
          <Button asChild>
            <Link to={paths.home.getHref()}>تصفّح الخطوط</Link>
          </Button>
        }
      />
    );

  const errors = state.status === 'invalid' ? state.errors : {};

  return (
    <form
      action={(fd) => {
        setAttempt(0);
        formAction(fd);
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      <Block n={1} title="الحساب">
        <div className="flex items-center gap-4 rounded-md bg-sunken p-4">
          <Avatar initials={user.initials} seed={user.id} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-control font-medium">{user.name}</p>
            <p dir="ltr" className="truncate text-right text-caption text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Link
            to={paths.login.getHref(paths.checkout.getHref())}
            className="text-caption text-muted-foreground hover:text-foreground"
          >
            تغيير
          </Link>
        </div>
        <p className="mt-2 text-caption text-tertiary">
          يصلك الإيصال وروابط التحميل على هذا البريد، وتبقى الملفات في «مشترياتي».
        </p>
      </Block>

      <Block n={2} title="صاحب الترخيص" hint="الاسم الذي يُكتب على ملف الترخيص — فرداً كان أو شركة.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="holder" required>
              الاسم الكامل أو اسم الشركة
            </FieldLabel>
            <InputGroup
              id="holder"
              name="holder"
              start={<UserIcon />}
              defaultValue={(state.status === 'invalid' && state.holder) || user.name}
              maxLength={80}
              autoComplete="name"
              aria-invalid={!!errors.holder}
              aria-describedby="holder-err"
            />
            <FieldError id="holder-err">{errors.holder}</FieldError>
          </Field>
          <Field>
            <FieldLabel id="country-label">البلد</FieldLabel>
            <input type="hidden" name="country" value={country} />
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger aria-labelledby="country-label" start={<GlobeIcon />} aria-invalid={!!errors.country}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.country}</FieldError>
          </Field>
        </div>
      </Block>

      <Block n={3} title="الدفع">
        <RadioGroupPrimitive.Root
          name="method"
          aria-label="طريقة الدفع"
          value={method}
          onValueChange={(v) => setMethod(v as PaymentMethod)}
          className="grid grid-cols-3 gap-3"
        >
          {METHODS.map(([m, label, icon]) => (
            <RadioGroupPrimitive.Item
              key={m}
              value={m}
              className="flex h-19 flex-col items-start justify-between rounded-md border p-3 text-meta transition-colors hover:border-strong data-[state=checked]:border-2 data-[state=checked]:border-foreground"
            >
              {icon}
              {label}
            </RadioGroupPrimitive.Item>
          ))}
        </RadioGroupPrimitive.Root>

        {method === 'card' ? (
          <div className="mt-5 flex flex-col gap-4" aria-describedby="card-note">
            <Field>
              <FieldLabel htmlFor="cc-number">رقم البطاقة</FieldLabel>
              <InputGroup
                id="cc-number"
                inputMode="numeric"
                dir="ltr"
                placeholder="1234 1234 1234 1234"
                autoComplete="off"
                start={<CreditCardIcon />}
                end={<span className="text-micro font-medium">VISA · MC · AMEX</span>}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field className="col-span-3 sm:col-span-1">
                <FieldLabel htmlFor="cc-name">الاسم على البطاقة</FieldLabel>
                <InputGroup id="cc-name" dir="ltr" placeholder="ABDULMALIK JASSIM" autoComplete="off" />
              </Field>
              <Field className="col-span-3 sm:col-span-1">
                <FieldLabel htmlFor="cc-exp">الانتهاء</FieldLabel>
                <InputGroup id="cc-exp" dir="ltr" placeholder="MM / YY" autoComplete="off" />
              </Field>
              <Field className="col-span-3 sm:col-span-1">
                <FieldLabel htmlFor="cc-cvc">CVC</FieldLabel>
                <InputGroup id="cc-cvc" dir="ltr" placeholder="123" autoComplete="off" inputMode="numeric" />
              </Field>
            </div>
            <p id="card-note" className="flex items-center gap-1.5 text-caption text-tertiary">
              <LockIcon className="size-3.5" />
              بيئة تجريبية: لا تُدخل بطاقة حقيقية. في المنتج تُعرض حقول البطاقة من Stripe مباشرة ولا تمرّ بخوادم حرف.
            </p>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-sunken p-4 text-meta text-muted-foreground">
            سيظهر زرّ {method === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} من Stripe هنا على الأجهزة التي تدعمه.
          </p>
        )}
      </Block>

      {errors.cart && <FieldError>{errors.cart}</FieldError>}

      <Button type="submit" size="xl" block>
        <LockIcon />
        ادفع <span dir="ltr">{formatMoney(total)}</span>
      </Button>
      <label className="flex items-center justify-center gap-2 text-caption text-tertiary">
        <Checkbox name="simulateDecline" value="on" />
        محاكاة رفض البطاقة (للعرض فقط)
      </label>
      <p className="text-center text-caption text-tertiary">بالدفع توافق على شروط الترخيص وسياسة الاسترداد.</p>
    </form>
  );
}

function Block({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`co-${n}`} className="rounded-lg border bg-card p-6">
      <h2 id={`co-${n}`} className="flex items-center gap-2 text-base font-semibold">
        <span
          dir="ltr"
          className="grid size-6 place-items-center rounded-full bg-sunken text-caption text-muted-foreground"
        >
          {n}
        </span>
        {title}
      </h2>
      {hint && <p className="mt-1 text-caption text-tertiary">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const RESULT = {
  processing: { title: 'جارٍ الدفع…', text: 'لا تغلق الصفحة — نؤكّد العملية مع مصرفك.' },
  paid: { title: 'تمّ الدفع', text: 'وصلك إيصال على بريدك، والتحميل متاح الآن.' },
  declined: { title: 'تعذّر إتمام الدفع', text: '' },
} as const;

export function PaymentResult({
  kind,
  total,
  message,
  children,
}: {
  kind: keyof typeof RESULT;
  total: Money;
  message?: string;
  children?: ReactNode;
}) {
  const r = RESULT[kind];
  return (
    <div
      role={kind === 'declined' ? 'alert' : 'status'}
      aria-live="polite"
      className="mx-auto w-full max-w-md animate-fade-up rounded-xl border bg-card p-8 text-center shadow-soft"
    >
      <span
        className={cn(
          'mx-auto mb-5 grid size-15 place-items-center rounded-full',
          kind === 'paid' && 'bg-tint-ok text-ok-text',
          kind === 'declined' && 'bg-tint-dgr text-dgr-text',
          kind === 'processing' && 'text-primary',
        )}
      >
        {kind === 'processing' ? (
          <Spinner className="size-12 border-[3px]" />
        ) : kind === 'paid' ? (
          <CheckIcon className="size-7 animate-pop-in" />
        ) : (
          <CrossIcon className="size-6 animate-pop-in" />
        )}
      </span>
      <h2 className="text-xl font-semibold">{r.title}</h2>
      <p dir="ltr" className="my-3 text-5xl font-semibold tracking-tight">
        <span className="me-1 align-baseline text-lead font-normal text-tertiary">USD</span>
        {formatMoney(total)}
      </p>
      <p className="text-control text-muted-foreground">{message ?? r.text}</p>
      {children}
    </div>
  );
}
