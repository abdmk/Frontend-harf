import { useId, useState } from 'react';

import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import { CheckIcon, ClockIcon, CrossIcon, PencilIcon } from '@/components/ui/icons';
import { Textarea } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

import { type AdminResult } from '../api/guard';
import { REASON_MAX, REASON_MIN } from '../api/review';
import { timeAgo } from '../utils';

export type Decision = 'approved' | 'changes' | 'rejected';
export type DecisionState = 'pending' | Decision;

export const STATE: Record<
  DecisionState,
  { label: string; tone: 'info' | 'success' | 'warning' | 'danger'; Icon: typeof CheckIcon }
> = {
  pending: { label: 'بانتظار المراجعة', tone: 'info', Icon: ClockIcon },
  approved: { label: 'مقبول', tone: 'success', Icon: CheckIcon },
  changes: { label: 'طُلبت تعديلات', tone: 'warning', Icon: PencilIcon },
  rejected: { label: 'مرفوض', tone: 'danger', Icon: CrossIcon },
};

/**
 * لكل قرار لونه الدلالي: القبول أخضر، التعديلات كهرماني، الرفض أحمر — الأيقونة في دائرة بلونه،
 * والاختيار يلوّن البطاقة وزرّ التأكيد. اللون ليس وحده: الأيقونة والنص يحملان المعنى أيضاً.
 */
const DECISIONS: {
  value: Decision;
  label: string;
  Icon: typeof CheckIcon;
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
    dot: 'bg-tint-ok text-ok-text',
    on: 'border-ok-500 bg-tint-ok/60 shadow-[0_0_0_1px_var(--color-ok-500)]',
    cta: 'bg-ok-700 text-white hover:bg-ok-600',
  },
  {
    value: 'changes',
    label: 'طلب تعديلات',
    Icon: PencilIcon,
    dot: 'bg-tint-warn text-warn-text',
    on: 'border-warn-500 bg-tint-warn/60 shadow-[0_0_0_1px_var(--color-warn-500)]',
    cta: 'bg-warn-700 text-white hover:bg-warn-600',
  },
  {
    value: 'rejected',
    label: 'رفض',
    Icon: CrossIcon,
    dot: 'bg-tint-dgr text-dgr-text',
    on: 'border-dgr-500 bg-tint-dgr/60 shadow-[0_0_0_1px_var(--color-dgr-500)]',
    cta: 'bg-dgr-600 text-white hover:bg-dgr-700',
  },
];

export type DecisionRecordView = { state: Decision; by?: string; at?: string; reason?: string };

/**
 * لوحة القرار المشتركة بين مراجعة الخطوط والمخطوطات: اختر ← (السبب إن لم يكن قبولاً) ← أكّد.
 * بعد القرار تعرضه مع زرّ التراجع. الإجراء نفسه (decide/undo) يأتي من الـAPI ويتحقّق من الدور.
 */
export function DecisionPanel({
  record,
  hints,
  presets,
  onDecide,
  onUndo,
  subject,
  disabledApprove,
  onDone,
}: {
  record?: DecisionRecordView;
  /** سطر يشرح أثر كل قرار */
  hints: Record<Decision, string>;
  presets: readonly string[];
  onDecide: (decision: Decision, reason: string) => AdminResult;
  onUndo: () => AdminResult;
  /** اسم العمل في رسائل التأكيد */
  subject: string;
  /** سبب تعطيل القبول (ملف ناقص مثلاً) */
  disabledApprove?: string;
  onDone: () => void;
}) {
  const [choice, setChoice] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const ids = useId();

  if (record) {
    const st = STATE[record.state];
    return (
      <SectionCard title="القرار">
        <div className="flex flex-col gap-3">
          <Badge tone={st.tone} icon={<st.Icon />} size="md">
            {st.label}
          </Badge>
          {record.by && (
            <p className="text-meta text-muted-foreground">
              {record.by}
              {record.at && ` · ${timeAgo(record.at)}`}
            </p>
          )}
          {record.reason && (
            <blockquote className="rounded-md bg-sunken p-4 text-control leading-relaxed">{record.reason}</blockquote>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              const r = onUndo();
              if (r.ok) toast({ tone: 'info', title: 'أُعيد الطلب إلى الطابور' });
              else toast({ tone: 'danger', title: r.error });
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
    const r = onDecide(choice, reason);
    if (!r.ok) return setError(r.error);
    toast({
      tone: choice === 'approved' ? 'success' : 'info',
      title:
        choice === 'approved'
          ? `قُبل «${subject}»`
          : choice === 'changes'
            ? `طُلبت تعديلات على «${subject}»`
            : `رُفض «${subject}»`,
      description: 'أُبلغ صاحب الطلب بالقرار.',
    });
    onDone();
  }

  const needsReason = choice === 'changes' || choice === 'rejected';
  const picked = choice ? DECISIONS.find((d) => d.value === choice)! : null;
  return (
    <SectionCard title="القرار" description="اختر، ثم أكّد.">
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="القرار" className="flex flex-col gap-2">
          {DECISIONS.map((d) => {
            const on = choice === d.value;
            const off = d.value === 'approved' && !!disabledApprove;
            return (
              <button
                key={d.value}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={off}
                onClick={() => {
                  setChoice(d.value);
                  setError(undefined);
                }}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border bg-card p-3.5 text-start transition-[border-color,background-color,box-shadow] duration-(--dur-base) hover:border-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
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
                  <span className="block text-caption text-muted-foreground">
                    {off ? disabledApprove : hints[d.value]}
                  </span>
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
            <FieldLabel htmlFor={`${ids}-reason`} required>
              السبب
            </FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
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
              id={`${ids}-reason`}
              value={reason}
              maxLength={REASON_MAX}
              onChange={(e) => {
                setReason(e.target.value);
                setError(undefined);
              }}
              aria-invalid={!!error}
              aria-describedby={`${ids}-err`}
              placeholder="ما الذي يجب إصلاحه تحديداً؟"
            />
            <FieldHint>
              {REASON_MIN}–{REASON_MAX} حرفاً · يُرسل لصاحب الطلب كما هو
            </FieldHint>
          </Field>
        )}
        <FieldError id={`${ids}-err`}>{error}</FieldError>

        <Button
          disabled={!picked}
          variant={picked ? undefined : 'secondary'}
          onClick={submit}
          className={cn('w-full', picked?.cta)}
        >
          {picked ? `تأكيد: ${picked.label}` : 'اختر قراراً'}
        </Button>
      </div>
    </SectionCard>
  );
}
