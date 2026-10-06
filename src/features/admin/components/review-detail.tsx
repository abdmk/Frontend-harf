import { useState } from 'react';
import { useNavigate } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { CheckIcon, DocumentSignedIcon, ExclamationIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';
import { faceStyle } from '@/utils/font-weight';
import { formatBytesAr } from '@/utils/format';
import { CATEGORY_LABEL, LANG_LABEL } from '@/utils/labels';

import { AdminPageHeader } from './admin-nav';
import { DecisionPanel } from './decision-panel';
import { decide, REJECT_PRESETS, type ReviewItem, undoDecision, useReviewItems } from '../api/review';
import { timeAgo } from '../utils';

const SAMPLE = 'الخط العربي فنّ يجمع الجمال والوضوح';

function Specimen({ s }: { s: ReviewItem }) {
  const [text, setText] = useState(SAMPLE);
  const weights = s.preview.weights;
  return (
    <SectionCard title="المعاينة" description={`اكتب لتجرّب الخط · ${s.weights.join(' · ')}`} bodyClassName="p-0">
      <label className="sr-only" htmlFor="rev-sample">
        نصّ المعاينة
      </label>
      <input
        id="rev-sample"
        value={text}
        maxLength={80}
        onChange={(e) => setText(e.target.value)}
        className="w-full border-b bg-transparent px-6 py-3 text-control outline-none placeholder:text-tertiary focus:bg-sunken/50"
        placeholder="اكتب نصّاً للمعاينة"
      />
      <ul className="flex flex-col divide-y">
        {[weights[0]!, weights.at(-1)!].map((w, i) => (
          <li key={i} className="overflow-hidden px-6 py-5">
            <p className="text-caption text-tertiary" dir="ltr">
              {i ? s.weights.at(-1) : s.weights[0]}
            </p>
            <p className="mt-1 truncate text-3xl leading-normal sm:text-4xl" style={faceStyle(s.preview, w)}>
              {text || SAMPLE}
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/** صفحة طلب واحد: معاينة حيّة، البيانات والملفات، الفحوص الآلية، ثم القرار */
export function ReviewDetail({ id }: { id: string }) {
  const items = useReviewItems();
  const navigate = useNavigate();
  const s = items.find((i) => i.id === id);
  if (!s)
    return (
      <EmptyState
        icon={<DocumentSignedIcon />}
        title="الطلب غير موجود"
        description="ربما حُذف أو تغيّر رقمه."
        action={
          <Button variant="outline" onClick={() => navigate(paths.admin.getHref('requests'))}>
            العودة إلى المراجعة
          </Button>
        }
      />
    );

  // بعد القرار: الطلب التالي في الطابور (الأقدم أولاً)، وإلا العودة للطابور
  const next = items
    .filter((i) => i.state === 'pending' && i.id !== s.id)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))[0];
  const onDone = () => navigate(next ? paths.admin.review.getHref(next.id) : paths.admin.getHref('requests'));

  const meta: [string, React.ReactNode][] = [
    ['المسبك', s.foundry.name],
    ['أرسله', s.submittedBy],
    ['وصل', timeAgo(s.submittedAt)],
    ['التصنيف', `${CATEGORY_LABEL[s.category]}${s.styles.length ? ` · ${s.styles.join('، ')}` : ''}`],
    ['اللغات', s.langs.map((l) => LANG_LABEL[l]).join('، ')],
    [
      'النوع',
      s.type === 'paid' ? (
        <>
          مدفوع · <bdi dir="ltr">${s.price}</bdi>
        </>
      ) : (
        'مجاني'
      ),
    ],
    ['الترخيص', s.license],
    ['رقم الطلب', <bdi key="id">{s.id}</bdi>],
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        back={{ to: paths.admin.getHref('requests'), label: 'الطلبات' }}
        title={s.nameAr ? `${s.nameLatin} · ${s.nameAr}` : s.nameLatin}
        description={s.description}
      />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Specimen s={s} />
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
          <SectionCard title="الملفات" description={`${s.files.length} ملفات مرفوعة`} bodyClassName="p-0">
            <ul className="divide-y">
              {s.files.map((f) => (
                <li key={f.name} className="flex items-center justify-between gap-3 px-6 py-3 text-control">
                  <bdi dir="ltr" className="truncate font-mono text-meta">
                    {f.name}
                  </bdi>
                  <span className="shrink-0 text-caption text-muted-foreground">{formatBytesAr(f.bytes)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
        <div className="flex flex-col gap-5 xl:sticky xl:top-26 xl:self-start">
          <SectionCard title="الفحوص الآلية">
            <ul className="flex flex-col gap-3">
              {s.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 text-control">
                  <span
                    className={cn(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                      c.ok ? 'bg-tint-ok text-ok-text' : 'bg-tint-warn text-warn-text',
                    )}
                  >
                    {c.ok ? <CheckIcon className="size-3" /> : <ExclamationIcon className="size-3" />}
                    <span className="sr-only">{c.ok ? 'نجح' : 'لم ينجح'}</span>
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
            key={s.id}
            record={s.record && { state: s.record.decision, by: s.record.by, at: s.record.at, reason: s.record.reason }}
            hints={{
              approved: 'يُنشر الخط في المكتبة ويُبلَّغ الاستوديو.',
              changes: 'يعود للاستوديو ليصلح ويعيد الإرسال.',
              rejected: 'لا يُنشر. السبب يصل للاستوديو كما تكتبه.',
            }}
            presets={REJECT_PRESETS}
            onDecide={(decision, reason) => decide({ id: s.id, decision, reason })}
            onUndo={() => undoDecision(s.id)}
            subject={s.nameLatin}
            onDone={onDone}
          />
        </div>
      </div>
    </div>
  );
}
