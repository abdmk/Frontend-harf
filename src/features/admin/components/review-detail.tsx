import { useId, useState } from 'react';
import { useNavigate } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { CheckIcon, CrossIcon, DocumentSignedIcon, ExclamationIcon, PencilIcon } from '@/components/ui/icons';
import { Textarea } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { faceStyle } from '@/lib/font-weight';
import { formatBytesAr } from '@/lib/format';
import { CATEGORY_LABEL, LANG_LABEL } from '@/lib/labels';

import { AdminPageHeader } from './admin-nav';
import { STATE } from './review-queue';
import {
  type Decision,
  decide,
  REASON_MAX,
  REASON_MIN,
  REJECT_PRESETS,
  type ReviewItem,
  undoDecision,
  useReviewItems,
} from '../api/review';
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

/**
 * لكل قرار لونه الدلالي: القبول أخضر، التعديلات كهرماني، الرفض أحمر — الأيقونة في دائرة بلونه،
 * والاختيار يلوّن البطاقة وزرّ التأكيد. اللون ليس وحده: الأيقونة والنص يحملان المعنى أيضاً.
 */
const DECISIONS: {
  value: Decision;
  label: string;
  Icon: typeof CheckIcon;
  hint: string;
  /** دائرة الأيقونة */
  dot: string;
  /** البطاقة حين تُختار */
  on: string;
  /** زرّ التأكيد */
  cta: string;
}[] = [
  {
    value: 'approved',
    label: 'قبول ونشر',
    Icon: CheckIcon,
    hint: 'يُنشر الخط في المكتبة ويُبلَّغ الاستوديو.',
    dot: 'bg-tint-ok text-ok-text',
    on: 'border-ok-500 bg-tint-ok/60 shadow-[0_0_0_1px_var(--color-ok-500)]',
    cta: 'bg-ok-700 text-white hover:bg-ok-600',
  },
  {
    value: 'changes',
    label: 'طلب تعديلات',
    Icon: PencilIcon,
    hint: 'يعود للاستوديو ليصلح ويعيد الإرسال.',
    dot: 'bg-tint-warn text-warn-text',
    on: 'border-warn-500 bg-tint-warn/60 shadow-[0_0_0_1px_var(--color-warn-500)]',
    cta: 'bg-warn-700 text-white hover:bg-warn-600',
  },
  {
    value: 'rejected',
    label: 'رفض',
    Icon: CrossIcon,
    hint: 'لا يُنشر. السبب يصل للاستوديو كما تكتبه.',
    dot: 'bg-tint-dgr text-dgr-text',
    on: 'border-dgr-500 bg-tint-dgr/60 shadow-[0_0_0_1px_var(--color-dgr-500)]',
    cta: 'bg-dgr-600 text-white hover:bg-dgr-700',
  },
];

function DecisionPanel({ s, onDone }: { s: ReviewItem; onDone: () => void }) {
  const [choice, setChoice] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const errId = useId();

  if (s.record) {
    const st = STATE[s.state];
    return (
      <SectionCard title="القرار">
        <div className="flex flex-col gap-3">
          <Badge tone={st.tone} icon={<st.Icon />} size="md">
            {st.label}
          </Badge>
          <p className="text-meta text-muted-foreground">
            {s.record.by} · {timeAgo(s.record.at)}
          </p>
          {s.record.reason && (
            <blockquote className="rounded-md bg-sunken p-4 text-control leading-relaxed">{s.record.reason}</blockquote>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              const r = undoDecision(s.id);
              if (r.ok) toast({ tone: 'info', title: 'أُعيد الطلب إلى الطابور' });
            }}
          >
            تراجع عن القرار
          </Button>
        </div>
      </SectionCard>
    );
  }

  function submit() {
    if (!choice) return;
    const r = decide({ id: s.id, decision: choice, reason });
    if (!r.ok) return setError(r.error);
    toast({
      tone: choice === 'approved' ? 'success' : 'info',
      title:
        choice === 'approved'
          ? `قُبل «${s.nameLatin}»`
          : choice === 'changes'
            ? `طُلبت تعديلات على «${s.nameLatin}»`
            : `رُفض «${s.nameLatin}»`,
      description: 'أُبلغ الاستوديو بالقرار.',
    });
    onDone();
  }

  const needsReason = choice === 'changes' || choice === 'rejected';
  return (
    <SectionCard title="القرار" description="اختر، ثم أكّد.">
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="القرار" className="flex flex-col gap-2">
          {DECISIONS.map((d) => {
            const on = choice === d.value;
            return (
              <button
                key={d.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setChoice(d.value);
                  setError(undefined);
                }}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border bg-card p-3.5 text-start transition-[border-color,background-color,box-shadow] duration-(--dur-base) hover:border-strong',
                  on && d.on,
                )}
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full transition-transform duration-(--dur-base) ease-pop group-hover:scale-105',
                    d.dot,
                  )}
                >
                  <d.Icon filled={on} className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-control font-semibold">{d.label}</span>
                  <span className="block text-caption text-muted-foreground">{d.hint}</span>
                </span>
                {/* مؤشّر الاختيار كزرّ راديو */}
                <span
                  aria-hidden
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-strong transition-colors',
                    on && 'border-transparent',
                    on && d.cta.split(' ')[0],
                  )}
                >
                  {on && <CheckIcon className="size-3 animate-pop-in text-white" />}
                </span>
              </button>
            );
          })}
        </div>

        {needsReason && (
          <Field className="animate-fade-up">
            <FieldLabel htmlFor="rev-reason" required>
              السبب
            </FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {REJECT_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="rounded-full border bg-card px-3 py-1 text-caption text-muted-foreground transition-colors hover:border-strong hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
            <Textarea
              id="rev-reason"
              value={reason}
              maxLength={REASON_MAX}
              onChange={(e) => {
                setReason(e.target.value);
                setError(undefined);
              }}
              aria-invalid={!!error}
              aria-describedby={errId}
              placeholder="ما الذي يجب إصلاحه تحديداً؟"
            />
            <FieldHint>
              {REASON_MIN}–{REASON_MAX} حرفاً · يُرسل للاستوديو كما هو
            </FieldHint>
          </Field>
        )}
        <FieldError id={errId}>{error}</FieldError>

        <Button
          disabled={!choice}
          variant={choice ? undefined : 'secondary'}
          onClick={submit}
          className={cn('w-full', choice && DECISIONS.find((d) => d.value === choice)!.cta)}
        >
          {choice ? `تأكيد: ${DECISIONS.find((d) => d.value === choice)!.label}` : 'اختر قراراً'}
        </Button>
      </div>
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
          <DecisionPanel key={s.id} s={s} onDone={onDone} />
        </div>
      </div>
    </div>
  );
}
