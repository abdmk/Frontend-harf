import { Badge } from '@/components/ui/badge';
import { CheckIcon, ClockIcon, CrossIcon, PencilIcon } from '@/components/ui/icons';
import {
  type ManuscriptSubmission,
  SUBMISSION_STATUS_LABEL,
  type SubmissionStatus,
  useMySubmissions,
} from '@/lib/manuscript-submissions';
import { useManuscriptUrl } from '@/lib/media-store';
import { MANUSCRIPT_CATEGORY_LABEL } from '@/types/domain/manuscript';

const TONE: Record<SubmissionStatus, { tone: 'info' | 'success' | 'warning' | 'danger'; Icon: typeof CheckIcon }> = {
  pending: { tone: 'info', Icon: ClockIcon },
  approved: { tone: 'success', Icon: CheckIcon },
  changes: { tone: 'warning', Icon: PencilIcon },
  rejected: { tone: 'danger', Icon: CrossIcon },
};

const dateAr = (iso: string) => new Date(iso).toLocaleDateString('ar', { day: 'numeric', month: 'long' });

function Row({ s }: { s: ManuscriptSubmission }) {
  const url = useManuscriptUrl(s.file.id);
  const st = TONE[s.status];
  return (
    <li className="flex items-start gap-4 px-4 py-4 sm:px-5">
      <span className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-sunken p-1.5">
        {url ? <img src={url} alt="" className="max-h-full max-w-full object-contain" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-control font-semibold">{s.title}</p>
          <Badge tone={st.tone} icon={<st.Icon />}>
            {SUBMISSION_STATUS_LABEL[s.status]}
          </Badge>
        </div>
        <p className="mt-1 text-meta text-muted-foreground">
          {MANUSCRIPT_CATEGORY_LABEL[s.category]} · <bdi>{s.reference}</bdi> · {dateAr(s.createdAt)}
        </p>
        {s.reason && (s.status === 'changes' || s.status === 'rejected') && (
          <p className="mt-2 rounded-md bg-sunken px-3 py-2 text-meta leading-relaxed">
            <span className="font-medium">ملاحظة المراجعة: </span>
            {s.reason}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * «طلباتك» تحت نموذج الرفع: حالة كل مخطوطة أُرسلت، وسبب الرفض أو التعديل كما كتبه المراجع —
 * فيعرف صاحبها ما يصلحه قبل أن يعيد الرفع.
 */
export function MyManuscripts({ userId }: { userId: string }) {
  const items = useMySubmissions(userId);
  if (!items.length) return null;
  return (
    <section aria-labelledby="my-ms-title" className="mt-12 flex flex-col gap-4">
      <h2 id="my-ms-title" className="text-lg font-semibold">
        طلباتك
      </h2>
      <ul className="divide-y rounded-xl border bg-card">
        {items.map((s) => (
          <Row key={s.reference} s={s} />
        ))}
      </ul>
    </section>
  );
}
