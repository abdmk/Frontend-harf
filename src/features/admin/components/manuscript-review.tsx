import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { CheckIcon, ClockIcon, ExclamationIcon, PictureIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import { readManuscriptSvg, useManuscriptUrl } from '@/lib/media-store';
import { cn } from '@/lib/utils';
import type { ManuscriptSubmission } from '@/stores/manuscript-submissions';
import { MANUSCRIPT_CATEGORY_LABEL } from '@/types/domain/manuscript';
import { formatBytesAr } from '@/utils/format';
import { checkSvgText, MAX_SVG_BYTES } from '@/utils/svg-check';

import { AdminPageHeader } from './admin-nav';
import { DecisionPanel } from './decision-panel';
import {
  decideManuscript,
  MANUSCRIPT_REASON_PRESETS,
  undoManuscriptDecision,
  useManuscriptRequests,
} from '../api/manuscripts';
import { timeAgo } from '../utils';

const requestsHref = `${paths.admin.getHref('requests')}?type=manuscripts`;

/** المعاينة كما ستظهر في المكتبة، بخلفيتين: ورق، وشفاف (لكشف ما خلف الرسم) */
function Preview({ m }: { m: ManuscriptSubmission }) {
  const url = useManuscriptUrl(m.file.id);
  const [bg, setBg] = useState<'paper' | 'grid'>('paper');
  return (
    <SectionCard
      title="المعاينة"
      description={`${m.file.width}×${m.file.height} · ${formatBytesAr(m.file.bytes)}`}
      action={
        <SegmentedControl
          label="خلفية المعاينة"
          value={bg}
          onChange={setBg}
          className="h-9"
          options={[
            { value: 'paper', label: 'ورق' },
            { value: 'grid', label: 'شفاف' },
          ]}
        />
      }
    >
      <div
        className={cn(
          'grid min-h-72 place-items-center overflow-hidden rounded-lg border p-6 sm:p-10',
          bg === 'paper'
            ? 'bg-card'
            : '[background-image:repeating-conic-gradient(var(--sunken)_0_25%,var(--card)_0_50%)] bg-[length:20px_20px]',
        )}
      >
        {url ? (
          <img
            src={url}
            alt={`معاينة ${m.title}`}
            className="max-h-[28rem] w-auto max-w-full object-contain"
            style={{ aspectRatio: `${m.file.width} / ${m.file.height}` }}
          />
        ) : (
          <p className="text-meta text-muted-foreground">
            {m.file.id ? 'جارٍ تحميل الملف…' : 'ملف العمل غير متاح في هذا المتصفّح.'}
          </p>
        )}
      </div>
    </SectionCard>
  );
}

type Check = { label: string; ok: boolean | null; note?: string };

/** الفحوص تُعاد عند فتح الطلب على الملف المحفوظ نفسه — لا يُعتمد على فحص لحظة الرفع وحده */
function useChecks(m: ManuscriptSubmission): Check[] {
  const [svg, setSvg] = useState<{ id?: string; result: ReturnType<typeof checkSvgText> | null }>({
    result: null,
  });
  useEffect(() => {
    if (!m.file.id) return;
    let alive = true;
    void readManuscriptSvg(m.file.id).then((text) => {
      if (alive)
        setSvg({
          id: m.file.id,
          result: text === null ? { ok: false, error: 'تعذّر قراءة الملف.' } : checkSvgText(text),
        });
    });
    return () => {
      alive = false;
    };
  }, [m.file.id]);

  const result = m.file.id ? (svg.id === m.file.id ? svg.result : null) : { ok: false as const, error: 'لا ملف.' };
  return [
    {
      label: 'رسم متجه آمن: بلا سكربت ولا روابط خارجية',
      ok: result ? result.ok : null,
      note: result && !result.ok ? result.error : undefined,
    },
    { label: 'الحجم ضمن 5 ميغابايت', ok: m.file.bytes <= MAX_SVG_BYTES },
    { label: 'خطوط من مكتبة حرف', ok: m.fonts.length > 0 },
    { label: 'أقرّ صاحبه بحقّ النشر', ok: true },
  ];
}

/** صفحة طلب مخطوطة: المعاينة والبيانات، الفحوص المُعادة، ثم القرار */
export function ManuscriptReview({ reference }: { reference: string }) {
  const items = useManuscriptRequests();
  const navigate = useNavigate();
  const m = items.find((i) => i.reference === reference);
  if (!m)
    return (
      <EmptyState
        icon={<PictureIcon />}
        title="الطلب غير موجود"
        description="ربما أُرسل من متصفّح آخر أو تغيّر رقمه."
        action={
          <Button variant="outline" onClick={() => navigate(requestsHref)}>
            العودة إلى الطلبات
          </Button>
        }
      />
    );
  return <ReviewBody m={m} items={items} />;
}

function ReviewBody({ m, items }: { m: ManuscriptSubmission; items: ManuscriptSubmission[] }) {
  const navigate = useNavigate();
  const checks = useChecks(m);
  const unsafe = checks[0]!.ok === false;

  // بعد القرار: الطلب التالي في الطابور (الأقدم أولاً)، وإلا العودة للطابور
  const next = items
    .filter((i) => i.status === 'pending' && i.reference !== m.reference)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  const onDone = () => navigate(next ? paths.admin.manuscript.getHref(next.reference) : requestsHref);

  const meta: [string, React.ReactNode][] = [
    ['الاستوديو', m.studioName],
    ['وصل', timeAgo(m.createdAt)],
    ['التصنيف', MANUSCRIPT_CATEGORY_LABEL[m.category]],
    [
      'الخطوط',
      m.fonts.length
        ? m.fonts.map((f, i) => (
            <span key={f.id}>
              {i > 0 && '، '}
              <Link to={paths.font.getHref(f.id)} className="underline-offset-4 hover:text-primary hover:underline">
                {f.name}
              </Link>
            </span>
          ))
        : '—',
    ],
    ['الترخيص', m.license === 'commercial' ? 'تجاري وشخصي' : 'شخصي فقط'],
    [
      'الملف',
      <bdi key="f" dir="ltr" className="font-mono text-meta">
        {m.file.name}
      </bdi>,
    ],
    ['رقم الطلب', <bdi key="r">{m.reference}</bdi>],
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        back={{ to: requestsHref, label: 'الطلبات' }}
        title={m.title}
        description={m.note || undefined}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Preview m={m} />
          <SectionCard title="البيانات">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-caption text-tertiary">{k}</dt>
                  <dd className="mt-0.5 text-control">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        </div>
        <div className="flex flex-col gap-5 xl:sticky xl:top-26 xl:self-start">
          <SectionCard title="الفحوص الآلية">
            <ul className="flex flex-col gap-3">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 text-control">
                  <span
                    className={cn(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                      c.ok === null
                        ? 'bg-sunken text-muted-foreground'
                        : c.ok
                          ? 'bg-tint-ok text-ok-text'
                          : 'bg-tint-warn text-warn-text',
                    )}
                  >
                    {c.ok === null ? (
                      <ClockIcon className="size-3" />
                    ) : c.ok ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <ExclamationIcon className="size-3" />
                    )}
                    <span className="sr-only">{c.ok === null ? 'جارٍ الفحص' : c.ok ? 'نجح' : 'لم ينجح'}</span>
                  </span>
                  <span>
                    {c.label}
                    {c.note && <span className="block text-caption text-warn-text">{c.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <DecisionPanel
            key={m.reference}
            record={
              m.status === 'pending' ? undefined : { state: m.status, by: m.by, at: m.decidedAt, reason: m.reason }
            }
            hints={{
              approved: 'يظهر في مكتبة المخطوطات باسم الاستوديو.',
              changes: 'يعود لصاحبه ليصلح ويعيد الرفع.',
              rejected: 'لا يُنشر. السبب يصل لصاحبه كما تكتبه.',
            }}
            presets={MANUSCRIPT_REASON_PRESETS}
            onDecide={(decision, reason) => decideManuscript({ reference: m.reference, decision, reason })}
            onUndo={() => undoManuscriptDecision(m.reference)}
            subject={m.title}
            disabledApprove={
              !m.file.id ? 'الملف غير متاح — لا يمكن نشره.' : unsafe ? 'الملف لم يجتز فحص الأمان.' : undefined
            }
            onDone={onDone}
          />
        </div>
      </div>
    </div>
  );
}
