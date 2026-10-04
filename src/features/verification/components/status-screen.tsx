import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { CheckIcon, ClockIcon, ExclamationIcon, ShieldCheckIcon, UploadIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { formatDateAr } from '@/lib/format';
import type { VerificationRecord } from '@/lib/studio-verification';

type Stage = { title: string; text: string; state: 'done' | 'current' | 'todo' | 'failed' };

function Timeline({ stages }: { stages: Stage[] }) {
  return (
    <ol className="flex flex-col text-start">
      {stages.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
          {i < stages.length - 1 && (
            <span
              aria-hidden
              className={cn('absolute start-3.5 top-8 bottom-0 w-px', s.state === 'done' ? 'bg-ok-500' : 'bg-inset')}
            />
          )}
          <span
            className={cn(
              'relative grid size-7 shrink-0 place-items-center rounded-full border-2 [&_svg]:size-3.5',
              s.state === 'done' && 'border-ok-500 bg-ok-500 text-white',
              s.state === 'current' && 'border-warn-500 bg-tint-warn text-warn-text',
              s.state === 'failed' && 'border-dgr-500 bg-dgr-500 text-white',
              s.state === 'todo' && 'border-dashed border-strong',
            )}
          >
            {s.state === 'done' && <CheckIcon />}
            {s.state === 'current' && <ClockIcon />}
            {s.state === 'failed' && <ExclamationIcon />}
          </span>
          <div className="pt-0.5">
            <p className={cn('text-control font-semibold', s.state === 'todo' && 'text-tertiary')}>{s.title}</p>
            <p className="mt-0.5 text-meta text-muted-foreground">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** ما بعد الإرسال: قيد المراجعة، معتمد، أو لم يُعتمد (مع السبب وزرّ التعديل) */
export function VerificationStatusScreen({ record, onEdit }: { record: VerificationRecord; onEdit: () => void }) {
  const sent = record.submittedAt ? formatDateAr(record.submittedAt) : '';
  const decided = record.decidedAt ? formatDateAr(record.decidedAt) : '';
  const view = {
    pending: {
      tone: 'bg-tint-warn text-warn-text',
      Icon: ClockIcon,
      title: 'طلبك قيد المراجعة',
      lead: 'يراجع فريق حرف الطلبات عادةً خلال يومي عمل، وسنراسلك فور صدور القرار.',
      stages: [
        { title: 'أُرسل الطلب', text: sent, state: 'done' },
        { title: 'مراجعة الإدارة', text: 'التحقّق من الهوية ووسيلة الاستلام', state: 'current' },
        { title: 'اعتماد الاستوديو', text: 'يُفتح نشر الخطوط المدفوعة والبيع', state: 'todo' },
      ] as Stage[],
    },
    approved: {
      tone: 'bg-tint-ok text-ok-text',
      Icon: ShieldCheckIcon,
      title: 'حسابك موثّق',
      lead: 'يمكنك الآن نشر الخطوط المدفوعة واستقبال المبيعات. أرباحك تُحوَّل إلى الوسيلة التي اخترتها.',
      stages: [
        { title: 'أُرسل الطلب', text: sent, state: 'done' },
        { title: 'مراجعة الإدارة', text: 'اكتملت', state: 'done' },
        { title: 'اعتماد الاستوديو', text: decided, state: 'done' },
      ] as Stage[],
    },
    rejected: {
      tone: 'bg-tint-dgr text-dgr-text',
      Icon: ExclamationIcon,
      title: 'لم يُعتمد الطلب بعد',
      lead: 'راجع السبب أدناه، عدّل ما يلزم، ثم أعد الإرسال.',
      stages: [
        { title: 'أُرسل الطلب', text: sent, state: 'done' },
        { title: 'مراجعة الإدارة', text: decided, state: 'failed' },
        { title: 'اعتماد الاستوديو', text: 'بعد إعادة الإرسال', state: 'todo' },
      ] as Stage[],
    },
    draft: null,
  }[record.status];
  if (!view) return null;
  const { Icon } = view;

  return (
    <div className="flex flex-col">
      <main
        id="main"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 pt-10 pb-16 text-center sm:pt-16"
      >
        <span className={cn('grid size-16 animate-pop-in place-items-center rounded-2xl [&_svg]:size-7', view.tone)}>
          <Icon />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">{view.title}</h1>
        <p className="mt-3 text-lead leading-relaxed text-muted-foreground">{view.lead}</p>

        {record.status === 'rejected' && record.reason && (
          <div role="alert" className="border-dgr-200 mt-6 w-full rounded-xl border bg-tint-dgr p-4 text-start">
            <p className="text-meta font-semibold text-dgr-text">ملاحظة فريق التوثيق</p>
            <p className="mt-1 text-control leading-relaxed">{record.reason}</p>
          </div>
        )}

        <div className="mt-8 w-full rounded-xl border bg-card p-5">
          <Timeline stages={view.stages} />
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          {record.status === 'rejected' ? (
            <Button size="lg" variant="primary" className="flex-1" onClick={onEdit}>
              عدّل وأعد الإرسال
            </Button>
          ) : (
            <Button asChild size="lg" variant="primary" className="flex-1">
              <Link to={paths.studio.getHref('publish')}>
                <UploadIcon />
                {record.status === 'approved' ? 'انشر خطاً' : 'جهّز خطاً مجانياً'}
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="secondary" className="flex-1">
            <Link to={paths.studio.getHref()}>العودة إلى الاستوديو</Link>
          </Button>
        </div>
        {record.status === 'pending' && (
          <p className="mt-4 text-meta text-muted-foreground">
            في الأثناء يمكنك إرسال خطوطك المجانية للمراجعة — المدفوعة تنتظر الاعتماد.
          </p>
        )}
      </main>
    </div>
  );
}
