import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { HarfLockup } from '@/components/shared/harf-logo';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import {
  BankIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentSignedIcon,
  FingerprintIcon,
  ShieldCheckIcon,
  SignOutIcon,
  UserIcon,
} from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { deleteDoc, storeDoc } from '@/lib/media-store';
import type { MaskedPayout } from '@/lib/payout';
import {
  AGREEMENT_VERSION,
  getVerification,
  missingOf,
  saveVerificationDraft,
  studioInfoSchema,
  submitVerification,
  type VerificationRecord,
} from '@/lib/studio-verification';
import type { User } from '@/types/domain/user';

import { SignatureDialog } from './signature-dialog';
import { VerificationStatusScreen } from './status-screen';
import {
  AgreementStep,
  DocsStep,
  type DocsValues,
  InfoStep,
  type InfoValues,
  PayoutStep,
  ReviewStep,
  type Signed,
} from './steps';

const STEPS = [
  { title: 'بيانات الاستوديو', lead: 'من أنت، وبأي اسم تنشر خطوطك.' },
  { title: 'وثائق الهوية', lead: 'نتحقّق أن الاستوديو يعود لشخص حقيقي — مرّة واحدة فقط.' },
  { title: 'استلام الأرباح', lead: 'أين تصلك أرباح مبيعاتك.' },
  { title: 'اتفاقية الناشر', lead: 'اقرأ الشروط ثم وقّعها.' },
  { title: 'مراجعة التفاصيل', lead: 'تأكّد من كل شيء قبل الإرسال إلى الإدارة.' },
] as const;
type Step = 0 | 1 | 2 | 3 | 4 | 5;

const WHAT_YOU_NEED = [
  { Icon: UserIcon, title: 'بيانات الاستوديو', text: 'الاسم القانوني، اسم الاستوديو، والدولة.' },
  { Icon: FingerprintIcon, title: 'وثيقة هوية سارية', text: 'البطاقة الوطنية أو الجواز أو الإقامة — صورة واضحة.' },
  { Icon: BankIcon, title: 'وسيلة استلام', text: 'حساب بنكي (IBAN) باسمك — أو بطاقة كي كارد في العراق.' },
  { Icon: DocumentSignedIcon, title: 'توقيع الاتفاقية', text: 'حصّة حرف وحقوقك على خطوطك، بوضوح.' },
];

function Welcome({ onStart, rejected }: { onStart: () => void; rejected?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid size-16 animate-pop-in place-items-center rounded-2xl bg-tint-brand text-primary [&_svg]:size-7">
        <ShieldCheckIcon />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">وثّق استوديوك</h1>
      <p className="mt-3 max-w-md text-lead leading-relaxed text-muted-foreground">
        قبل أوّل نشر، نتعرّف عليك ونتّفق على الشروط. خطوة واحدة تحمي خطوطك ومشتريها — وتفتح لك البيع.
      </p>
      {rejected && (
        <p role="alert" className="mt-6 w-full rounded-xl bg-tint-dgr p-4 text-start text-meta text-dgr-text">
          <span className="font-semibold">سبب عدم الاعتماد:</span> {rejected}
        </p>
      )}
      <ol className="mt-10 grid w-full gap-3 text-start sm:grid-cols-2">
        {WHAT_YOU_NEED.map(({ Icon, title, text }, i) => (
          <li
            key={title}
            className="flex animate-fade-up gap-3 rounded-xl border bg-card p-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint-brand text-primary [&_svg]:size-4.5">
              <Icon />
            </span>
            <span>
              <span className="block text-control font-semibold">{title}</span>
              <span className="mt-0.5 block text-meta leading-relaxed text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex items-center gap-2 text-meta text-muted-foreground">
        <ClockIcon className="size-4" />
        نحو 5 دقائق · نحفظ تقدّمك تلقائياً · المراجعة خلال يومي عمل عادةً
      </p>
      <Button size="xl" variant="primary" className="mt-8 w-full sm:w-80" onClick={onStart}>
        ابدأ التوثيق
        <ChevronLeftIcon />
      </Button>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-meta text-muted-foreground">
        الخطوة {step} من {STEPS.length}
      </p>
      <div aria-hidden className="flex w-40 gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s.title}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-(--dur-slow)',
              i < step ? 'bg-primary-fill' : 'bg-inset',
            )}
          />
        ))}
      </div>
    </div>
  );
}

const infoOf = (r: VerificationRecord, user: User): InfoValues => ({
  legalName: r.info.legalName ?? '',
  studioName: r.info.studioName ?? user.name,
  entity: r.info.entity ?? 'individual',
  companyName: r.info.companyName ?? '',
  country: r.info.country ?? '',
  city: r.info.city ?? '',
});

/**
 * مرحلة توثيق الاستوديو: ترحيب، خمس خطوات (الخطوة X من 5)، ثم شاشة الحالة.
 * كل «التالي» يتحقّق من الخطوة ويحفظها — يمكن الخروج والعودة دون فقدان شيء.
 */
export function VerifyFlow({ user, record }: { user: User; record: VerificationRecord | null }) {
  const rec = record ?? getVerification(user.id);
  const status = record?.status;
  const [step, setStep] = useState<Step>(() => (record && record.status === 'draft' && record.info.legalName ? 1 : 0));
  const [info, setInfo] = useState<InfoValues>(() => infoOf(rec, user));
  const [infoErrors, setInfoErrors] = useState<Partial<Record<keyof InfoValues, string>>>({});
  const [docs, setDocs] = useState<DocsValues>({ docType: rec.docType, ...rec.docs });
  const [payout, setPayout] = useState<MaskedPayout | undefined>(rec.payout);
  const [signed, setSigned] = useState<Signed>(
    rec.agreement?.version === AGREEMENT_VERSION ? rec.agreement : undefined,
  );
  const [acks, setAcks] = useState<[boolean, boolean]>([!!signed, !!signed]);
  const [signing, setSigning] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string>();
  const [editingRejected, setEditingRejected] = useState(false);
  // ملفّات استُبدلت أو حُذفت — تُمسح من التخزين بعد حفظ الخطوة، لا قبله
  const dropped = useRef<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  // قيد المراجعة / معتمد / مرفوض (ما لم يبدأ التعديل) ← شاشة الحالة
  if (status === 'pending' || status === 'approved' || (status === 'rejected' && !editingRejected))
    return (
      <VerificationStatusScreen
        record={rec}
        onEdit={() => {
          setEditingRejected(true);
          setStep(5);
        }}
      />
    );

  const go = (s: Step) => {
    setShowErrors(false);
    setError(undefined);
    setStep(s);
  };

  function save(patch: Parameters<typeof saveVerificationDraft>[0]) {
    const r = saveVerificationDraft(patch);
    if (!r.ok) {
      setError(r.error);
      return false;
    }
    for (const id of dropped.current) void deleteDoc(id);
    dropped.current = [];
    return true;
  }

  const drop = (prev: string | undefined, next: string | undefined) => {
    if (prev && prev !== next) dropped.current.push(prev);
  };

  function next() {
    setShowErrors(true);
    setError(undefined);
    if (step === 1) {
      const r = studioInfoSchema.safeParse(info);
      const errs: typeof infoErrors = {};
      if (!r.success) for (const i of r.error.issues) errs[i.path[0] as keyof InfoValues] ??= i.message;
      if (info.entity === 'company' && info.companyName.trim().length < 2) errs.companyName = 'اسم الشركة مطلوب.';
      setInfoErrors(errs);
      if (Object.keys(errs).length || !save({ info: r.data })) return;
    } else if (step === 2) {
      const ok =
        docs.front && (docs.docType === 'passport' || docs.back) && (info.entity !== 'company' || docs.company);
      if (!ok) return setError('ارفع الوثائق المطلوبة كلها.');
      const { docType, ...files } = docs;
      if (docType === 'passport') delete files.back;
      if (info.entity !== 'company') delete files.company;
      if (!save({ docType, docs: files })) return;
    } else if (step === 3) {
      if (!payout) return;
      if (!save({ payout: { ...payout, verifiedAt: rec.payout?.verifiedAt ?? new Date().toISOString() } })) return;
    } else if (step === 4) {
      if (!acks[0] || !acks[1] || !signed) return;
      if (!save({ agreement: signed })) return;
    }
    go(Math.min(5, step + 1) as Step);
  }

  function submit() {
    const r = submitVerification();
    if (!r.ok) return setError(r.error);
    setEditingRejected(false);
    toast({ tone: 'success', title: 'أُرسل طلب التوثيق', description: 'سنراسلك فور مراجعته.' });
  }

  async function onSigned(jpeg: string) {
    const stored = await storeDoc(jpeg);
    if (!stored.ok) return setError(stored.error);
    drop(signed?.signature, stored.id);
    setSigned({
      version: AGREEMENT_VERSION,
      signedAt: new Date().toISOString(),
      signer: info.legalName.trim() || user.name,
      signature: stored.id,
    });
    setSigning(false);
  }

  const current = getVerification(user.id);
  const missing = missingOf(current);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* شريط علوي ثابت بعرض الموقع: الشعار واسم الخطوة على جهة، والخروج على الأخرى — ظاهران دائماً */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={paths.home.getHref()}
              aria-label="حرف — الرئيسية"
              className="shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HarfLockup className="h-8 w-auto" />
            </Link>
            <span aria-hidden className="h-6 w-px bg-border max-sm:hidden" />
            <span className="truncate text-control font-medium text-muted-foreground max-sm:hidden">
              توثيق الاستوديو
            </span>
          </div>
          <Button asChild variant="outline" size="sm" shape="pill">
            <Link to={paths.studio.getHref()}>
              {step === 0 ? (
                'لاحقاً'
              ) : (
                <>
                  <SignOutIcon />
                  حفظ والخروج
                </>
              )}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-8 pb-36 sm:pt-12">
        {step === 0 ? (
          <Welcome onStart={() => go(1)} rejected={status === 'rejected' ? rec.reason : undefined} />
        ) : (
          <div key={step} className="animate-fade-up">
            <Progress step={step} />
            <h1
              ref={heading}
              tabIndex={-1}
              className="mt-3 text-center text-3xl font-bold tracking-tight outline-none sm:text-4xl"
            >
              {STEPS[step - 1]!.title}
            </h1>
            <p className="mt-2 text-center text-control text-muted-foreground">{STEPS[step - 1]!.lead}</p>
            <div className="mt-10">
              {step === 1 && <InfoStep v={info} onChange={setInfo} errors={infoErrors} />}
              {step === 2 && (
                <DocsStep
                  v={docs}
                  isCompany={info.entity === 'company'}
                  showErrors={showErrors}
                  onChange={(d) => {
                    drop(docs.front, d.front);
                    drop(docs.back, d.back);
                    drop(docs.company, d.company);
                    setDocs(d);
                  }}
                />
              )}
              {step === 3 && (
                <PayoutStep
                  payout={payout}
                  onChange={setPayout}
                  email={user.email}
                  country={info.country}
                  showErrors={showErrors}
                />
              )}
              {step === 4 && (
                <AgreementStep
                  signed={signed}
                  acks={acks}
                  onAcks={setAcks}
                  onSign={() => setSigning(true)}
                  showErrors={showErrors}
                />
              )}
              {step === 5 && <ReviewStep rec={current} missing={missing} goTo={(s) => go(s)} />}
            </div>
            {error && <FieldError className="mt-5 justify-center">{error}</FieldError>}
          </div>
        )}
      </main>

      {step > 0 && (
        <footer className="fixed inset-x-0 bottom-0 border-t bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-xl gap-3 px-4 py-4">
            <Button variant="secondary" size="lg" onClick={() => go((step - 1) as Step)}>
              <ChevronRightIcon />
              رجوع
            </Button>
            {step < 5 ? (
              <Button variant="primary" size="lg" className="flex-1" onClick={next}>
                {STEPS[step as number]!.title}
                <ChevronLeftIcon />
              </Button>
            ) : (
              <Button variant="primary" size="lg" className="flex-1" disabled={missing.length > 0} onClick={submit}>
                <ShieldCheckIcon />
                إرسال للمراجعة
              </Button>
            )}
          </div>
        </footer>
      )}

      <SignatureDialog
        open={signing}
        onOpenChange={setSigning}
        signer={info.legalName.trim() || user.name}
        onSigned={onSigned}
      />
    </div>
  );
}
