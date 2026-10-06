import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PayoutCard } from '@/components/shared/payout-card';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  CrossIcon,
  DocumentSignedIcon,
  LockIcon,
  PictureIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Textarea } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { useDocUrl } from '@/lib/media-store';
import { cn } from '@/lib/utils';
import {
  AGREEMENT_VERSION,
  DOC_TYPE_LABEL,
  ENTITY_LABEL,
  needsBack,
  type VerificationRecord,
  type VerificationStatus,
} from '@/stores/studio-verification';
import { formatDateAr } from '@/utils/format';

import { AdminPageHeader } from './admin-nav';
import { approveStudio, logDocsViewed, rejectStudio, useStudioRequests } from '../api/studios';
import { isOverdue, timeAgo } from '../utils';

const STATE: Record<
  Exclude<VerificationStatus, 'draft'>,
  { label: string; tone: 'info' | 'success' | 'danger'; Icon: typeof CheckIcon }
> = {
  pending: { label: 'بانتظار المراجعة', tone: 'info', Icon: ClockIcon },
  approved: { label: 'معتمد', tone: 'success', Icon: CheckIcon },
  rejected: { label: 'مرفوض', tone: 'danger', Icon: CrossIcon },
};

function StateBadge({ r }: { r: VerificationRecord }) {
  if (r.status === 'draft') return null;
  const s = STATE[r.status];
  return (
    <Badge tone={s.tone} icon={<s.Icon />}>
      {s.label}
    </Badge>
  );
}

/* ══ القائمة ══════════════════════════════════════════════════════════════ */

export function StudioRequests({ embedded = false }: { embedded?: boolean }) {
  const all = useStudioRequests();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const list = filter === 'pending' ? all.filter((r) => r.status === 'pending') : all;
  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <AdminPageHeader
          title="توثيق الحسابات"
          description="طلبات الناشرين قبل البيع: الهوية، وسيلة الاستلام، والاتفاقية الموقّعة. لا مبيعات قبل اعتمادك."
        />
      )}
      <SegmentedControl
        label="عرض الطلبات"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'pending', label: `بانتظار المراجعة (${all.filter((r) => r.status === 'pending').length})` },
          { value: 'all', label: 'الكل' },
        ]}
        className="self-start"
      />
      {list.length ? (
        <ul aria-label="طلبات التوثيق" className="divide-y rounded-xl border bg-card">
          {list.map((r) => {
            const late = r.status === 'pending' && r.submittedAt && isOverdue(r.submittedAt);
            const Icon = r.info.entity === 'company' ? BuildingIcon : UserIcon;
            return (
              <li key={r.userId} className="flex animate-fade-up items-center gap-4 px-4 py-4 sm:px-5">
                <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-sunken text-muted-foreground sm:grid [&_svg]:size-5">
                  <Icon />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={paths.admin.studio.getHref(r.userId)}
                      className="text-control font-semibold underline-offset-4 hover:text-primary hover:underline"
                    >
                      <bdi>{r.info.studioName}</bdi>
                    </Link>
                    {r.status !== 'pending' && <StateBadge r={r} />}
                    {late && <Badge tone="warning">متأخّر</Badge>}
                  </div>
                  <p className="mt-1 text-meta text-muted-foreground">
                    {r.info.entity ? ENTITY_LABEL[r.info.entity] : ''} · {DOC_TYPE_LABEL[r.docType]} · أُرسل{' '}
                    {r.submittedAt ? timeAgo(r.submittedAt) : ''}
                  </p>
                </div>
                <Button asChild size="sm" variant={r.status === 'pending' ? 'secondary' : 'outline'}>
                  <Link to={paths.admin.studio.getHref(r.userId)}>{r.status === 'pending' ? 'راجِع' : 'التفاصيل'}</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<ShieldCheckIcon />}
          title="لا طلبات بانتظارك"
          description="ستظهر هنا طلبات توثيق الحسابات الجديدة فور إرسالها."
        />
      )}
    </div>
  );
}

/* ══ التفاصيل ═════════════════════════════════════════════════════════════ */

function DocView({ id, label }: { id: string | undefined; label: string }) {
  const url = useDocUrl(id);
  return (
    <figure className="flex flex-col gap-1.5">
      <div className="grid aspect-[1.586] place-items-center overflow-hidden rounded-xl border bg-sunken">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="size-full"
            aria-label={`فتح ${label} بالحجم الكامل`}
          >
            <img src={url} alt={label} className="size-full object-cover" />
          </a>
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center text-caption text-tertiary">
            <PictureIcon className="size-6" />
            {id ? 'ملف تجريبي — غير محفوظ في هذا المتصفّح' : 'لم يُرفع'}
          </span>
        )}
      </div>
      <figcaption className="text-caption text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-meta text-tertiary">{label}</dt>
      <dd className="text-control sm:text-end">{children}</dd>
    </div>
  );
}

export function StudioRequestDetail({ id }: { id: string }) {
  const r = useStudioRequests().find((x) => x.userId === id);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const rid = useId();

  // الاطّلاع على وثائق الهوية يُسجَّل مرّة لكل فتح للصفحة
  useEffect(() => {
    if (r) logDocsViewed(r.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- مرّة لكل طلب
  }, [r?.userId]);

  if (!r)
    return (
      <EmptyState
        icon={<ShieldCheckIcon />}
        title="الطلب غير موجود"
        description="ربما سُحب أو لم يُرسل بعد."
        action={
          <Button asChild variant="outline">
            <Link to={`${paths.admin.getHref('requests')}?type=studios`}>كل الطلبات</Link>
          </Button>
        }
      />
    );

  function approve() {
    const res = approveStudio(r!.userId);
    if (!res.ok) return setError(res.error);
    toast({ tone: 'success', title: `اعتُمد «${r!.info.studioName}»`, description: 'يستطيع الآن نشر خطوط مدفوعة.' });
  }

  function reject() {
    const res = rejectStudio(r!.userId, reason);
    if (!res.ok) return setError(res.error);
    setRejecting(false);
    toast({ title: 'رُفض الطلب', description: 'يصل السبب إلى الناشر ليعدّل ويعيد الإرسال.' });
  }

  const pending = r.status === 'pending';
  const outdated = r.agreement && r.agreement.version !== AGREEMENT_VERSION;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`${paths.admin.getHref('requests')}?type=studios`}
        className="inline-flex items-center gap-1.5 self-start text-meta text-muted-foreground hover:text-foreground"
      >
        <ArrowRightIcon className="size-4" />
        كل الطلبات
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">
              <bdi>{r.info.studioName}</bdi>
            </h1>
            <StateBadge r={r} />
          </div>
          <p className="mt-2 text-control text-muted-foreground">
            أُرسل {r.submittedAt ? formatDateAr(r.submittedAt) : ''}
            {r.decidedAt && ` · القرار ${formatDateAr(r.decidedAt)}`}
          </p>
        </div>
        {pending && (
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => setRejecting(true)}>
              <CrossIcon />
              رفض
            </Button>
            <Button className="bg-ok-700 text-white hover:bg-ok-600" onClick={approve}>
              <CheckIcon />
              اعتماد الاستوديو
            </Button>
          </div>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
      {r.status === 'rejected' && r.reason && (
        <p className="rounded-xl bg-tint-dgr p-4 text-control text-dgr-text">
          <span className="font-semibold">سبب الرفض:</span> {r.reason}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="الاستوديو والهوية" description="طابِق الاسم القانوني مع الوثيقة.">
          <dl className="divide-y">
            <Row label="الاسم القانوني">{r.info.legalName}</Row>
            <Row label="نوع الحساب">{r.info.entity ? ENTITY_LABEL[r.info.entity] : '—'}</Row>
            {r.info.entity === 'company' && <Row label="الشركة">{r.info.companyName}</Row>}
            <Row label="الموقع">
              {r.info.city}، <bdi>{r.info.country}</bdi>
            </Row>
            <Row label="الوثيقة">{DOC_TYPE_LABEL[r.docType]}</Row>
          </dl>
        </SectionCard>

        <SectionCard title="الوثائق" description="سرّية — لا تُنزَّل ولا تُشارك خارج فريق التوثيق.">
          <div className="grid grid-cols-2 gap-4">
            <DocView id={r.docs.front} label={needsBack(r.docType) ? 'الوجه الأمامي' : 'صفحة البيانات'} />
            {needsBack(r.docType) && <DocView id={r.docs.back} label="الوجه الخلفي" />}
            {r.info.entity === 'company' && <DocView id={r.docs.company} label="شهادة تسجيل الشركة" />}
          </div>
          <p className="mt-4 flex items-center gap-2 text-caption text-tertiary">
            <LockIcon className="size-3.5" />
            يُسجَّل اطّلاعك على هذه الوثائق في سجلّ النشاط.
          </p>
        </SectionCard>

        <SectionCard title="استلام الأرباح" description="مقنّع — الرقم الكامل لدى مزوّد الدفع فقط.">
          {r.payout ? (
            <PayoutCard
              payout={r.payout}
              note={
                <p className="text-meta text-muted-foreground">
                  تحقّق الناشر منه برمز في {formatDateAr(r.payout.verifiedAt)}. طابِق اسم صاحب الحساب مع الهوية.
                </p>
              }
            />
          ) : (
            <p className="text-control text-tertiary">لا وسيلة استلام.</p>
          )}
        </SectionCard>

        <SectionCard title="الاتفاقية" description="اتفاقية الناشر الموقّعة.">
          {r.agreement ? (
            <AgreementView agreement={r.agreement} outdated={!!outdated} />
          ) : (
            <p className="text-control text-tertiary">لم تُوقَّع.</p>
          )}
        </SectionCard>
      </div>

      <ConfirmDialog
        open={rejecting}
        onOpenChange={(o) => {
          setRejecting(o);
          setError(undefined);
        }}
        title={`رفض توثيق «${r.info.studioName}»؟`}
        description="يصل السبب إلى الناشر كما تكتبه، ويستطيع التعديل وإعادة الإرسال."
        confirmLabel="رفض الطلب"
        icon={<CrossIcon />}
        disabled={reason.trim().length < 10}
        onConfirm={reject}
      >
        <Field>
          <FieldLabel htmlFor={`${rid}-r`} required>
            السبب
          </FieldLabel>
          <Textarea
            id={`${rid}-r`}
            value={reason}
            maxLength={400}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: صورة الوجه الخلفي غير واضحة — أعد تصويرها في إضاءة أفضل."
            className="min-h-24"
          />
          <FieldHint>10 أحرف على الأقل — كن محدّداً ليعرف ما يصلحه.</FieldHint>
        </Field>
      </ConfirmDialog>
    </div>
  );
}

function AgreementView({
  agreement,
  outdated,
}: {
  agreement: NonNullable<VerificationRecord['agreement']>;
  outdated: boolean;
}) {
  const url = useDocUrl(agreement.signature);
  return (
    <div className="flex flex-col gap-4">
      <div className={cn('grid h-28 place-items-center rounded-lg border', url ? 'bg-white' : 'bg-sunken')}>
        {url ? (
          <img src={url} alt={`توقيع ${agreement.signer}`} className="h-full object-contain" />
        ) : (
          <DocumentSignedIcon className="size-6 text-tertiary" />
        )}
      </div>
      <dl className="divide-y">
        <Row label="الموقّع">{agreement.signer}</Row>
        <Row label="التاريخ">{formatDateAr(agreement.signedAt)}</Row>
        <Row label="الإصدار">
          {agreement.version}
          {outdated && (
            <Badge tone="warning" className="ms-2">
              إصدار قديم
            </Badge>
          )}
        </Row>
      </dl>
    </div>
  );
}
