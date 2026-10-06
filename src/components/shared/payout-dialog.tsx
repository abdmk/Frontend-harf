import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { ArrowRightIcon, BankIcon, CreditCardIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { cn } from '@/lib/utils';
import {
  DEMO_OTP,
  type MaskedPayout,
  maskEmail,
  maskPayout,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
  type PayoutInput,
  payoutInputSchema,
  type PayoutMethod,
  payoutMethodsFor,
  verifyOtp,
} from '@/utils/payout';

import { SecureNote } from './payout-card';

type Values = { method: PayoutMethod; holder: string; iban: string; card: string; confirm: boolean };
const EMPTY: Values = { method: 'bank', holder: '', iban: '', card: '', confirm: false };

/** رقم البطاقة للعرض أثناء الكتابة: 4 مجموعات من 4 أرقام */
const groupCard = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

/** تنسيق IBAN للعرض أثناء الكتابة: مجموعات من 4 */
const groupIban = (v: string) =>
  v
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/(.{4})/g, '$1 ')
    .trim();

const METHOD_OPTS = {
  bank: { label: 'حساب بنكي', hint: 'تحويل إلى IBAN', Icon: BankIcon },
  qicard: { label: 'كي كارد', hint: 'تحويل إلى رقم البطاقة', Icon: CreditCardIcon },
} as const satisfies Record<PayoutMethod, unknown>;

function MethodChoice({
  value,
  methods,
  onChange,
}: {
  value: PayoutMethod;
  methods: readonly PayoutMethod[];
  onChange: (m: PayoutMethod) => void;
}) {
  const opts = methods.map((m) => ({ m, ...METHOD_OPTS[m] }));
  return (
    <div role="radiogroup" aria-label="وسيلة الاستلام" className="grid grid-cols-2 gap-3">
      {opts.map(({ m, label, hint, Icon }) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={value === m}
          onClick={() => onChange(m)}
          className={cn(
            'flex flex-col items-start gap-3 rounded-lg border bg-card p-3.5 text-start transition-[border-color,box-shadow,background-color] duration-(--dur-fast) outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === m ? 'border-primary bg-tint-brand/40 ring-1 ring-primary' : 'hover:border-strong',
          )}
        >
          <span className="text-control font-medium">{label}</span>
          <span className="flex w-full items-end justify-between gap-2">
            <span className="text-caption text-muted-foreground">{hint}</span>
            <Icon className={cn('size-5', value === m ? 'text-primary' : 'text-tertiary')} />
          </span>
        </button>
      ))}
    </div>
  );
}

type PayoutDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  email: string;
  title?: string;
  description?: string;
  /** دولة الناشر — تحدّد الوسائل المتاحة (كي كارد للعراق فقط) */
  country?: string;
  onSaved: (p: MaskedPayout) => void;
};

/**
 * إضافة وسيلة استلام الأرباح أو تحديثها — خطوتان: البيانات، ثم رمز تأكيد إلى البريد.
 * لا يخرج من هذه النافذة إلا المقنّع (آخر 4 أرقام).
 * ⚠️ عرض: الرمز ثابت (DEMO_OTP). في المنتج يرسله الخادم ويتحقّق منه، ثم يحفظ الرقم الكامل مشفّراً.
 */
/**
 * نموذج وسيلة الاستلام نفسه (البيانات ← رمز التأكيد) — داخل نافذة في «المالية»، أو مباشرة في الصفحة
 * في خطوة التوثيق (inline) كي لا يكون الإدخال خطوتين: زرّ ثم نافذة.
 */
export function PayoutForm({
  email,
  inline = false,
  title = 'وسيلة استلام الأرباح',
  description = 'إلى أين نحوّل أرباحك؟ نتحقّق منك برمز قبل الحفظ.',
  country,
  onSaved,
  formId,
}: {
  email: string;
  title?: string;
  description?: string;
  country?: string;
  onSaved: (p: MaskedPayout) => void;
  /** داخل الصفحة: عنوان عادي بدل عنوان النافذة */
  inline?: boolean;
  /**
   * معرّف النموذج — حين يُعطى يُقدَّم النموذج من زرّ الصفحة الرئيسي (زرّ واحد للتقدّم)
   * فتُخفى أزرار «متابعة» و«تأكيد وحفظ» الداخلية.
   */
  formId?: string;
}) {
  const Title = inline ? InlineTitle : DialogTitle;
  const Desc = inline ? InlineDesc : DialogDescription;
  const methods = payoutMethodsFor(country);
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values | 'form', string>>>({});
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pending, setPending] = useState<PayoutInput | null>(null);
  const [code, setCode] = useState('');
  const [otpError, setOtpError] = useState<string>();
  const [wait, setWait] = useState(0);
  const id = useId();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  function next(e: React.FormEvent) {
    e.preventDefault();
    const r = payoutInputSchema.safeParse(
      v.method === 'bank'
        ? { method: 'bank', holder: v.holder, iban: v.iban }
        : { method: 'qicard', holder: v.holder, card: v.card },
    );
    const errs: typeof errors = {};
    if (!r.success) for (const i of r.error.issues) errs[i.path[0] as keyof Values] ??= i.message;
    if (!v.confirm) errs.confirm = 'أكّد أن الحساب باسمك أو باسم استوديوك.';
    setErrors(errs);
    if (!r.success || !v.confirm) return;
    setPending(r.data);
    setStep('otp');
    setWait(OTP_RESEND_SECONDS);
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!pending) return;
    // رمز ناقص لا يُحسب محاولةً (التقديم ممكن من زرّ الصفحة حتى قبل اكتماله)
    if (!/^\d{6}$/.test(code)) return setOtpError(`أدخل الأرقام ${OTP_LENGTH} كاملة.`);
    const r = verifyOtp(code, `payout:${email}`);
    if (!r.ok) return setOtpError(r.error);
    onSaved(maskPayout(pending));
  }

  return (
    <>
      {step === 'form' ? (
        <form id={formId} noValidate onSubmit={next} className="flex flex-col gap-5">
          <div>
            <Title>{title}</Title>
            <Desc className="mt-1 text-meta leading-relaxed text-muted-foreground">{description}</Desc>
          </div>
          {methods.length > 1 && (
            <MethodChoice
              value={v.method}
              methods={methods}
              onChange={(method) => {
                setV({ ...v, method });
                setErrors({});
              }}
            />
          )}
          <Field>
            <FieldLabel htmlFor={`${id}-h`} required>
              {v.method === 'bank' ? 'اسم صاحب الحساب' : 'الاسم على البطاقة'}
            </FieldLabel>
            <Input
              id={`${id}-h`}
              value={v.holder}
              maxLength={80}
              autoComplete="name"
              aria-invalid={!!errors.holder}
              aria-describedby={`${id}-he`}
              onChange={(e) => setV({ ...v, holder: e.target.value })}
            />
            <FieldError id={`${id}-he`}>{errors.holder}</FieldError>
          </Field>
          {v.method === 'bank' ? (
            <Field>
              <FieldLabel htmlFor={`${id}-i`} required>
                رقم الحساب الدولي (IBAN)
              </FieldLabel>
              <Input
                id={`${id}-i`}
                dir="ltr"
                value={groupIban(v.iban)}
                maxLength={42}
                autoComplete="off"
                spellCheck={false}
                placeholder="IQ98 NBIQ 8501 2345 6789 012"
                aria-invalid={!!errors.iban}
                aria-describedby={`${id}-ih ${id}-ie`}
                onChange={(e) => setV({ ...v, iban: e.target.value.replace(/\s+/g, '') })}
                className="tracking-wide tabular-nums"
              />
              <FieldHint id={`${id}-ih`}>تجده في تطبيق مصرفك أو على كشف الحساب.</FieldHint>
              <FieldError id={`${id}-ie`}>{errors.iban}</FieldError>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor={`${id}-c`} required>
                رقم بطاقة كي كارد
              </FieldLabel>
              <Input
                id={`${id}-c`}
                dir="ltr"
                inputMode="numeric"
                value={groupCard(v.card)}
                maxLength={19}
                autoComplete="off"
                spellCheck={false}
                placeholder="0000 0000 0000 0000"
                aria-invalid={!!errors.card}
                aria-describedby={`${id}-ch ${id}-ce`}
                onChange={(e) => setV({ ...v, card: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                className="tracking-wide tabular-nums"
              />
              <FieldHint id={`${id}-ch`}>
                الأرقام الـ16 على وجه البطاقة — لا نطلب رمز CVV أو تاريخ الانتهاء أبداً.
              </FieldHint>
              <FieldError id={`${id}-ce`}>{errors.card}</FieldError>
            </Field>
          )}
          <label className="flex items-start gap-3 rounded-lg border p-3.5 text-meta leading-relaxed">
            <Checkbox
              checked={v.confirm}
              onCheckedChange={(c) => setV({ ...v, confirm: c === true })}
              className="mt-0.5"
              aria-invalid={!!errors.confirm}
            />
            الحساب باسمي أو باسم استوديوي، وأنا مخوّل باستلام الأرباح عليه.
          </label>
          <FieldError>{errors.confirm}</FieldError>
          {!formId && (
            <Button type="submit" size="lg" variant="default">
              متابعة
            </Button>
          )}
          {/* في الصفحة تظهر الملاحظة مرّة واحدة تحت النموذج */}
          {!formId && <SecureNote />}
        </form>
      ) : (
        <form id={formId} noValidate onSubmit={confirm} className="flex flex-col gap-5">
          <div>
            <Title>تأكيد أنه أنت</Title>
            <Desc className="mt-1 text-meta leading-relaxed text-muted-foreground">
              أدخل الرمز المكوّن من {OTP_LENGTH} أرقام المرسل إلى بريدك{' '}
              <span dir="ltr" className="font-medium text-foreground">
                {maskEmail(email)}
              </span>{' '}
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-info-text underline underline-offset-4"
              >
                تعديل البيانات
              </button>
            </Desc>
          </div>
          <OtpInput
            value={code}
            onChange={(c) => {
              setCode(c);
              setOtpError(undefined);
            }}
            label="رمز التأكيد"
            invalid={!!otpError}
            describedBy={`${id}-oe`}
            autoFocus
          />
          <FieldError id={`${id}-oe`}>{otpError}</FieldError>
          <p className="rounded-md bg-tint-warn px-3 py-2 text-caption text-warn-text">
            نسخة تجريبية: الرمز{' '}
            <span dir="ltr" className="font-semibold tabular-nums">
              {DEMO_OTP}
            </span>
          </p>
          <div className="flex flex-col gap-3">
            {!formId && (
              <Button type="submit" size="lg" variant="default" disabled={!/^\d{6}$/.test(code)}>
                تأكيد وحفظ
              </Button>
            )}
            <p className="flex items-center justify-center gap-2 text-meta text-muted-foreground">
              {wait > 0 ? (
                <span aria-live="polite">إعادة الإرسال بعد {wait} ثانية</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setWait(OTP_RESEND_SECONDS);
                    setCode('');
                    setOtpError(undefined);
                  }}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  أرسل رمزاً جديداً
                </button>
              )}
            </p>
          </div>
          {/* في الصفحة: «تعديل البيانات» أعلاه يكفي — «رجوع» الصفحة في الأسفل يعود خطوة كاملة */}
          {!formId && (
            <Button type="button" variant="ghost" className="self-center" onClick={() => setStep('form')}>
              <ArrowRightIcon />
              رجوع
            </Button>
          )}
        </form>
      )}
    </>
  );
}

const InlineTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lead font-semibold">{children}</h2>
);
const InlineDesc = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={className}>{children}</p>
);

function PayoutDialogBody({ open, onOpenChange, onSaved, ...rest }: PayoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-md">
        <PayoutForm
          {...rest}
          onSaved={(p) => {
            onSaved(p);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/** يُعاد تركيب النافذة عند الإغلاق: كل فتح يبدأ نظيفاً، ولا تبقى أرقام حسّاسة في الذاكرة */
export function PayoutDialog(props: PayoutDialogProps) {
  return <PayoutDialogBody key={props.open ? 'open' : 'closed'} {...props} />;
}
