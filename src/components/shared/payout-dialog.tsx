import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { ArrowRightIcon, BankIcon, MobileIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { cn } from '@/lib/cn';
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
  verifyOtp,
} from '@/lib/payout';

import { SecureNote } from './payout-card';

type Values = { method: PayoutMethod; holder: string; iban: string; phone: string; confirm: boolean };
const EMPTY: Values = { method: 'bank', holder: '', iban: '', phone: '', confirm: false };

/** تنسيق IBAN للعرض أثناء الكتابة: مجموعات من 4 */
const groupIban = (v: string) =>
  v
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/(.{4})/g, '$1 ')
    .trim();

function MethodChoice({ value, onChange }: { value: PayoutMethod; onChange: (m: PayoutMethod) => void }) {
  const opts = [
    { m: 'bank' as const, label: 'حساب بنكي', hint: 'تحويل إلى IBAN', Icon: BankIcon },
    { m: 'wallet' as const, label: 'زين كاش', hint: 'محفظة برقم الهاتف', Icon: MobileIcon },
  ];
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
            value === m ? 'border-foreground shadow-soft ring-1 ring-foreground' : 'hover:border-strong',
          )}
        >
          <span className="text-control font-medium">{label}</span>
          <span className="flex w-full items-end justify-between gap-2">
            <span className="text-caption text-muted-foreground">{hint}</span>
            <Icon className={cn('size-5', value === m ? 'text-foreground' : 'text-tertiary')} />
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
  onSaved: (p: MaskedPayout) => void;
};

/**
 * إضافة وسيلة استلام الأرباح أو تحديثها — خطوتان: البيانات، ثم رمز تأكيد إلى البريد.
 * لا يخرج من هذه النافذة إلا المقنّع (آخر 4 أرقام).
 * ⚠️ عرض: الرمز ثابت (DEMO_OTP). في المنتج يرسله الخادم ويتحقّق منه، ثم يحفظ الرقم الكامل مشفّراً.
 */
function PayoutDialogBody({
  open,
  onOpenChange,
  email,
  title = 'وسيلة استلام الأرباح',
  description = 'إلى أين نحوّل أرباحك؟ نتحقّق منك برمز قبل الحفظ.',
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  email: string;
  title?: string;
  description?: string;
  onSaved: (p: MaskedPayout) => void;
}) {
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
        : { method: 'wallet', holder: v.holder, phone: v.phone },
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
    const r = verifyOtp(code, `payout:${email}`);
    if (!r.ok) return setOtpError(r.error);
    onSaved(maskPayout(pending));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-md">
        {step === 'form' ? (
          <form noValidate onSubmit={next} className="flex flex-col gap-5">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1 text-meta leading-relaxed text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
            <MethodChoice
              value={v.method}
              onChange={(method) => {
                setV({ ...v, method });
                setErrors({});
              }}
            />
            <Field>
              <FieldLabel htmlFor={`${id}-h`} required>
                {v.method === 'bank' ? 'اسم صاحب الحساب' : 'الاسم في المحفظة'}
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
                <FieldLabel htmlFor={`${id}-p`} required>
                  رقم الهاتف المرتبط بالمحفظة
                </FieldLabel>
                <Input
                  id={`${id}-p`}
                  dir="ltr"
                  type="tel"
                  value={v.phone}
                  maxLength={16}
                  autoComplete="tel"
                  placeholder="0770 123 4567"
                  aria-invalid={!!errors.phone}
                  aria-describedby={`${id}-pe`}
                  onChange={(e) => setV({ ...v, phone: e.target.value })}
                  className="tabular-nums"
                />
                <FieldError id={`${id}-pe`}>{errors.phone}</FieldError>
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
            <Button type="submit" size="lg" variant="ink">
              متابعة
            </Button>
            <SecureNote />
          </form>
        ) : (
          <form noValidate onSubmit={confirm} className="flex flex-col gap-5">
            <div>
              <DialogTitle>تأكيد أنه أنت</DialogTitle>
              <DialogDescription className="mt-1 text-meta leading-relaxed text-muted-foreground">
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
              </DialogDescription>
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
              <Button type="submit" size="lg" variant="ink" disabled={!/^\d{6}$/.test(code)}>
                تأكيد وحفظ
              </Button>
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
            <Button type="button" variant="ghost" className="self-center" onClick={() => setStep('form')}>
              <ArrowRightIcon />
              رجوع
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** يُعاد تركيب النافذة عند الإغلاق: كل فتح يبدأ نظيفاً، ولا تبقى أرقام حسّاسة في الذاكرة */
export function PayoutDialog(props: PayoutDialogProps) {
  return <PayoutDialogBody key={props.open ? 'open' : 'closed'} {...props} />;
}
