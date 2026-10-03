import { useId, useState, type ReactNode } from 'react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PayoutCard, SecureNote } from '@/components/shared/payout-card';
import { PayoutDialog } from '@/components/shared/payout-dialog';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  BankIcon,
  BuildingIcon,
  CheckIcon,
  DocumentSignedIcon,
  ExclamationIcon,
  FingerprintIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { formatDateAr } from '@/lib/format';
import { useDocUrl } from '@/lib/media-store';
import { type MaskedPayout, PAYOUT_METHOD_LABEL, payoutLabel, payoutMethodsFor } from '@/lib/payout';
import { PUBLISHER_TERMS } from '@/lib/publisher-terms';
import {
  DOC_TYPE_LABEL,
  DOC_TYPES,
  type DocType,
  ENTITY_LABEL,
  type Missing,
  MISSING_LABEL,
  needsBack,
  type VerificationRecord,
} from '@/lib/studio-verification';

import { DocSlot } from './doc-slot';
import { AGREEMENT_CLAUSES, AGREEMENT_HIGHLIGHTS, AGREEMENT_TITLE, AGREEMENT_VERSION } from '../config/agreement';
import { COUNTRIES, countryName } from '../config/countries';

/** صندوق شرح رمادي تحت الحقل — كما في مراجع التسجيل: لماذا نطلب هذا وأين يظهر */
export function Explain({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg bg-sunken px-4 py-3 text-meta leading-relaxed text-muted-foreground', className)}>
      {children}
    </div>
  );
}

/* ══ 1. بيانات الاستوديو ═════════════════════════════════════════════════ */

export type InfoValues = {
  legalName: string;
  studioName: string;
  entity: 'individual' | 'company';
  companyName: string;
  country: string;
  city: string;
};

export function InfoStep({
  v,
  onChange,
  errors,
}: {
  v: InfoValues;
  onChange: (v: InfoValues) => void;
  errors: Partial<Record<keyof InfoValues, string>>;
}) {
  const id = useId();
  const set = (p: Partial<InfoValues>) => onChange({ ...v, ...p });
  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel id={`${id}-el`}>نوع الحساب</FieldLabel>
        <div role="radiogroup" aria-labelledby={`${id}-el`} className="grid grid-cols-2 gap-3">
          {(['individual', 'company'] as const).map((e) => {
            const Icon = e === 'individual' ? UserIcon : BuildingIcon;
            return (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={v.entity === e}
                onClick={() => set({ entity: e })}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-card p-3.5 text-start text-control transition-[border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  v.entity === e
                    ? 'border-primary bg-tint-brand/40 font-medium ring-1 ring-primary'
                    : 'hover:border-strong',
                )}
              >
                <Icon className={cn('size-5 shrink-0', v.entity === e ? 'text-foreground' : 'text-tertiary')} />
                {ENTITY_LABEL[e]}
              </button>
            );
          })}
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${id}-ln`} required>
          الاسم القانوني الكامل
        </FieldLabel>
        <Input
          id={`${id}-ln`}
          value={v.legalName}
          maxLength={80}
          autoComplete="name"
          placeholder="مثال: علي حسين جاسم"
          aria-invalid={!!errors.legalName}
          aria-describedby={`${id}-lne`}
          onChange={(e) => set({ legalName: e.target.value })}
        />
        <FieldError id={`${id}-lne`}>{errors.legalName}</FieldError>
        <Explain>
          كما هو مكتوب في وثيقة الهوية التي سترفعها — نطابق بينهما. لا يظهر للزوّار؛ يظهر لهم اسم الاستوديو.
        </Explain>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${id}-sn`} required>
          اسم الاستوديو
        </FieldLabel>
        <Input
          id={`${id}-sn`}
          value={v.studioName}
          maxLength={60}
          placeholder="مثال: مسبك تجاريب"
          aria-invalid={!!errors.studioName}
          aria-describedby={`${id}-sne`}
          onChange={(e) => set({ studioName: e.target.value })}
        />
        <FieldError id={`${id}-sne`}>{errors.studioName}</FieldError>
        <Explain>الاسم الذي يعرفك به الناس — يظهر على خطوطك وصفحة الاستوديو وإيصالات المشترين.</Explain>
      </Field>

      {v.entity === 'company' && (
        <Field className="animate-fade-up">
          <FieldLabel htmlFor={`${id}-cn`} required>
            اسم الشركة المسجّل
          </FieldLabel>
          <Input
            id={`${id}-cn`}
            value={v.companyName}
            maxLength={80}
            aria-invalid={!!errors.companyName}
            aria-describedby={`${id}-cne`}
            onChange={(e) => set({ companyName: e.target.value })}
          />
          <FieldError id={`${id}-cne`}>{errors.companyName}</FieldError>
        </Field>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-co`} required>
            الدولة
          </FieldLabel>
          <Select value={v.country || undefined} onValueChange={(country) => set({ country })}>
            <SelectTrigger id={`${id}-co`} aria-invalid={!!errors.country} aria-describedby={`${id}-coe`}>
              <SelectValue placeholder="اختر الدولة" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id={`${id}-coe`}>{errors.country}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-ci`} required>
            المدينة
          </FieldLabel>
          <Input
            id={`${id}-ci`}
            value={v.city}
            maxLength={40}
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            aria-describedby={`${id}-cie`}
            onChange={(e) => set({ city: e.target.value })}
          />
          <FieldError id={`${id}-cie`}>{errors.city}</FieldError>
        </Field>
      </div>
    </div>
  );
}

/* ══ 2. وثائق الهوية ═════════════════════════════════════════════════════ */

export type DocsValues = { docType: DocType; front?: string; back?: string; company?: string };

export function DocsStep({
  v,
  onChange,
  isCompany,
  showErrors,
}: {
  v: DocsValues;
  onChange: (v: DocsValues) => void;
  isCompany: boolean;
  showErrors: boolean;
}) {
  const id = useId();
  const back = needsBack(v.docType);
  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel id={`${id}-t`}>نوع الوثيقة</FieldLabel>
        <div role="radiogroup" aria-labelledby={`${id}-t`} className="flex flex-wrap gap-2">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={v.docType === t}
              onClick={() => onChange({ ...v, docType: t })}
              className={cn(
                'rounded-full border px-4 py-2 text-control transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                v.docType === t
                  ? 'border-primary bg-primary-fill font-medium text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:border-strong hover:text-foreground',
              )}
            >
              {DOC_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </Field>

      <section aria-label={DOC_TYPE_LABEL[v.docType]} className="flex flex-col gap-2">
        <h2 className="text-meta font-medium text-muted-foreground">{DOC_TYPE_LABEL[v.docType]}</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <DocSlot
            label={back ? 'الوجه الأمامي' : 'صفحة البيانات'}
            side="front"
            value={v.front}
            onChange={(front) => onChange({ ...v, front })}
            invalid={showErrors && !v.front}
          />
          {back && (
            <DocSlot
              label="الوجه الخلفي"
              side="back"
              value={v.back}
              onChange={(b) => onChange({ ...v, back: b })}
              invalid={showErrors && !v.back}
            />
          )}
        </div>
      </section>

      {isCompany && (
        <section aria-label="إثبات الشركة" className="flex flex-col gap-2">
          <h2 className="text-meta font-medium text-muted-foreground">إثبات الشركة</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <DocSlot
              label="شهادة التسجيل"
              side="doc"
              value={v.company}
              onChange={(company) => onChange({ ...v, company })}
              invalid={showErrors && !v.company}
            />
          </div>
        </section>
      )}

      <Explain>
        نفضّل صورة ممسوحة ضوئياً. إن صوّرتها بالهاتف: ضعها على سطح داكن، في إضاءة جيّدة بلا انعكاس، وكل الزوايا ظاهرة.
      </Explain>
      <div className="flex items-start gap-3 rounded-lg border p-4 text-meta leading-relaxed">
        <ShieldCheckIcon className="mt-0.5 size-4.5 shrink-0 text-ok-text" />
        <p>
          <span className="font-medium text-foreground">من يرى وثائقك؟</span>{' '}
          <span className="text-muted-foreground">
            فريق التوثيق في حرف فقط، ولغرض التحقّق وحده. تُزال البيانات الوصفية من الصورة (مثل الموقع) قبل الرفع، وتُحفظ
            مشفّرة.
          </span>
        </p>
      </div>
    </div>
  );
}

/* ══ 3. استلام الأرباح ═══════════════════════════════════════════════════ */

export function PayoutStep({
  payout,
  onChange,
  email,
  country,
  showErrors,
}: {
  payout: MaskedPayout | undefined;
  onChange: (p: MaskedPayout | undefined) => void;
  email: string;
  /** دولة الناشر من الخطوة الأولى — كي كارد للعراق فقط */
  country: string;
  showErrors: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const iraq = country === 'IQ';
  // كي كارد أُضيفت ثم تغيّرت الدولة إلى غير العراق ← لا تصلح، ويُطلب حساب بنكي
  const unsupported = !!payout && !payoutMethodsFor(country).includes(payout.method);
  const [removing, setRemoving] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <div>
          <h2 className="text-lead font-semibold">وسيلة الاستلام</h2>
          <p className="mt-1 text-meta text-muted-foreground">إلى أين نحوّل أرباحك من المبيعات.</p>
        </div>
        {unsupported && (
          <Alert
            tone="warning"
            title="كي كارد متاحة في العراق فقط"
            description="غيّرت الدولة في بياناتك — حدّث وسيلة الاستلام إلى حساب بنكي."
          />
        )}
        {payout ? (
          <PayoutCard
            payout={payout}
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
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              'flex items-center gap-4 rounded-lg border-2 border-dashed p-4 text-start transition-colors outline-none hover:border-strong focus-visible:ring-2 focus-visible:ring-ring',
              showErrors && 'border-dgr-300 bg-tint-dgr/40',
            )}
          >
            <span className="grid h-11 w-14 shrink-0 place-items-center rounded-md bg-sunken text-muted-foreground">
              <PlusIcon className="size-5" />
            </span>
            <span>
              <span className="block text-control font-medium">أضف وسيلة استلام</span>
              <span className="block text-meta text-muted-foreground">
                {iraq ? 'حساب بنكي (IBAN) أو بطاقة كي كارد' : 'حساب بنكي (IBAN) باسمك'}
              </span>
            </span>
          </button>
        )}
        {showErrors && !payout && <FieldError>أضف وسيلة استلام لتتابع.</FieldError>}
      </section>

      <Explain>
        تصبح أرباح كل بيع قابلة للسحب بعد {PUBLISHER_TERMS.holdDays} يوماً (مدّة الاسترجاع)، ونحوّلها تلقائياً كل{' '}
        {PUBLISHER_TERMS.payoutEveryDays} يوماً. يمكنك تغيير الوسيلة لاحقاً من «المالية».
      </Explain>
      <SecureNote />

      <PayoutDialog open={editing} onOpenChange={setEditing} email={email} country={country} onSaved={onChange} />
      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title="إزالة وسيلة الاستلام؟"
        description="لن تستطيع إرسال طلب التوثيق قبل إضافة وسيلة أخرى."
        confirmLabel="إزالة"
        icon={<TrashIcon />}
        onConfirm={() => {
          setRemoving(false);
          onChange(undefined);
        }}
      />
    </div>
  );
}

/* ══ 4. الاتفاقية والتوقيع ═══════════════════════════════════════════════ */

export type Signed = VerificationRecord['agreement'];

function SignaturePreview({ signed, onResign }: { signed: NonNullable<Signed>; onResign: () => void }) {
  const url = useDocUrl(signed.signature);
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="grid h-28 place-items-center rounded-lg bg-white">
        {url ? (
          <img src={url} alt={`توقيع ${signed.signer}`} className="h-full object-contain" />
        ) : (
          <DocumentSignedIcon className="size-6 text-tertiary" />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-meta">
          <CheckIcon className="size-4 text-ok-text" />
          وقّعها {signed.signer} · {formatDateAr(signed.signedAt)} · الإصدار {signed.version}
        </p>
        <Button variant="ghost" size="sm" onClick={onResign}>
          <PencilIcon className="size-3.5" />
          إعادة التوقيع
        </Button>
      </div>
    </div>
  );
}

/** دائرة الإقرار — متقطّعة فارغة، ممتلئة بعلامة عند التفعيل (كما في المرجع) */
function Ack({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (c: boolean) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 rounded-xl border bg-card p-4 text-start text-control leading-relaxed transition-colors outline-none hover:border-strong focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-full border-2 transition-colors',
          checked ? 'border-ok-500 bg-ok-500 text-white' : 'border-dashed border-strong',
        )}
      >
        {checked && <CheckIcon className="size-3" />}
      </span>
      {children}
    </button>
  );
}

export function AgreementStep({
  signed,
  acks,
  onAcks,
  onSign,
  showErrors,
}: {
  signed: Signed;
  acks: [boolean, boolean];
  onAcks: (a: [boolean, boolean]) => void;
  onSign: () => void;
  showErrors: boolean;
}) {
  const ready = acks[0] && acks[1];
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-3 sm:grid-cols-3">
        {AGREEMENT_HIGHLIGHTS.map((h, i) => (
          <li key={h.title} className="rounded-xl border bg-card p-4">
            <span
              className={cn(
                'mb-3 grid size-8 place-items-center rounded-full [&_svg]:size-4',
                ['bg-tint-brand text-primary', 'bg-tint-ok text-ok-text', 'bg-tint-info text-info-text'][i],
              )}
            >
              {[<BankIcon key="b" />, <FingerprintIcon key="f" />, <DocumentSignedIcon key="d" />][i]}
            </span>
            <p className="text-control font-semibold">{h.title}</p>
            <p className="mt-1 text-meta leading-relaxed text-muted-foreground">{h.text}</p>
          </li>
        ))}
      </ul>

      <section
        aria-label={AGREEMENT_TITLE}
        tabIndex={0}
        className="max-h-96 overflow-y-auto rounded-xl border bg-card p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <h2 className="text-lead font-semibold">{AGREEMENT_TITLE}</h2>
        <p className="mt-1 text-caption text-tertiary">الإصدار {AGREEMENT_VERSION}</p>
        <ol className="mt-5 flex flex-col gap-5">
          {AGREEMENT_CLAUSES.map((c, i) => (
            <li key={c.title}>
              <h3 className="text-control font-semibold">
                {i + 1}. {c.title}
              </h3>
              {c.body.map((p) => (
                <p key={p} className="mt-1.5 text-meta leading-loose text-muted-foreground">
                  {p}
                </p>
              ))}
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3">
        <Ack checked={acks[0]} onChange={(c) => onAcks([c, acks[1]])}>
          أقرّ بأن المعلومات والوثائق التي قدّمتها صحيحة وكاملة.
        </Ack>
        <Ack checked={acks[1]} onChange={(c) => onAcks([acks[0], c])}>
          قرأت اتفاقية الناشر، وأوافق على بنودها ومنها حصّة حرف من المبيعات وحقّها في عرض خطوطي وتسويقها وبيعها وفق
          التراخيص المتّفق عليها.
        </Ack>
        {showErrors && !ready && <FieldError>فعّل الإقرارين أولاً.</FieldError>}
      </div>

      {signed ? (
        <SignaturePreview signed={signed} onResign={onSign} />
      ) : (
        <div className="flex flex-col gap-2">
          <Button size="lg" variant="primary" disabled={!ready} onClick={onSign}>
            <DocumentSignedIcon />
            وقّع الاتفاقية
          </Button>
          {showErrors && ready && <FieldError>وقّع الاتفاقية لتتابع.</FieldError>}
        </div>
      )}
    </div>
  );
}

/* ══ 5. مراجعة التفاصيل ══════════════════════════════════════════════════ */

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-meta text-tertiary">{label}</dt>
      <dd className="text-control sm:text-end">{children}</dd>
    </div>
  );
}

function ReviewCard({
  title,
  done,
  onEdit,
  children,
}: {
  title: string;
  done: boolean;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <header className="mb-2 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lead font-semibold">
          {done ? (
            <CheckIcon aria-label="مكتمل" className="size-4.5 text-ok-text" />
          ) : (
            <ExclamationIcon aria-label="غير مكتمل" className="size-4.5 text-warn-text" />
          )}
          {title}
        </h2>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`تعديل ${title}`}>
          <PencilIcon className="size-3.5" />
          تعديل
        </Button>
      </header>
      <dl className="divide-y">{children}</dl>
    </section>
  );
}

export function ReviewStep({
  rec,
  missing,
  goTo,
}: {
  rec: VerificationRecord;
  missing: Missing[];
  goTo: (step: 1 | 2 | 3 | 4) => void;
}) {
  // الملفّات المطلوبة لهذا النوع وحده: الخلفي للبطاقات، وشهادة التسجيل للشركات
  const needed = [rec.docs.front];
  if (needsBack(rec.docType)) needed.push(rec.docs.back);
  if (rec.info.entity === 'company') needed.push(rec.docs.company);
  const count = needed.filter(Boolean).length;
  const empty = <span className="text-tertiary">—</span>;
  return (
    <div className="flex flex-col gap-4">
      {missing.length > 0 && (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-tint-warn p-5">
          <ExclamationIcon className="mt-0.5 size-5 shrink-0 text-warn-text" />
          <div>
            <p className="text-control font-semibold">
              {missing.length === 1 ? 'عنصر واحد غير مكتمل' : `${missing.length} عناصر غير مكتملة`}
            </p>
            <p className="mt-1 text-meta leading-relaxed text-muted-foreground">
              أكمل {missing.map((m) => MISSING_LABEL[m]).join('، ')} لتتمكّن من إرسال الطلب.
            </p>
          </div>
        </div>
      )}
      <ReviewCard title="الاستوديو" done={!missing.includes('info')} onEdit={() => goTo(1)}>
        <Row label="الاسم القانوني">{rec.info.legalName || empty}</Row>
        <Row label="اسم الاستوديو">{rec.info.studioName || empty}</Row>
        <Row label="نوع الحساب">{rec.info.entity ? ENTITY_LABEL[rec.info.entity] : empty}</Row>
        {rec.info.entity === 'company' && <Row label="الشركة">{rec.info.companyName || empty}</Row>}
        <Row label="الموقع">
          {rec.info.country ? `${rec.info.city ?? ''}، ${countryName(rec.info.country)}` : empty}
        </Row>
      </ReviewCard>
      <ReviewCard title="وثائق الهوية" done={!missing.includes('docs')} onEdit={() => goTo(2)}>
        <Row label="نوع الوثيقة">{DOC_TYPE_LABEL[rec.docType]}</Row>
        <Row label="الملفّات المرفوعة">{count ? `${count} من ${needed.length}` : empty}</Row>
      </ReviewCard>
      <ReviewCard title="استلام الأرباح" done={!missing.includes('payout')} onEdit={() => goTo(3)}>
        {rec.payout ? (
          <>
            <Row label="الوسيلة">{PAYOUT_METHOD_LABEL[rec.payout.method]}</Row>
            <Row label="الحساب">
              <span dir="ltr" className="tabular-nums">
                {payoutLabel(rec.payout)}
              </span>
            </Row>
            <Row label="باسم">{rec.payout.holder}</Row>
          </>
        ) : (
          <Row label="الوسيلة">{empty}</Row>
        )}
      </ReviewCard>
      <ReviewCard title="الاتفاقية" done={!missing.includes('agreement')} onEdit={() => goTo(4)}>
        {rec.agreement ? (
          <>
            <Row label="الإصدار">{rec.agreement.version}</Row>
            <Row label="تاريخ التوقيع">{formatDateAr(rec.agreement.signedAt)}</Row>
          </>
        ) : (
          <Row label="التوقيع">{empty}</Row>
        )}
      </ReviewCard>
      <FieldHint className="text-center">
        بإرسال الطلب يصل إلى فريق حرف للمراجعة، ولا يمكن تعديله حتى يصدر القرار.
      </FieldHint>
    </div>
  );
}
