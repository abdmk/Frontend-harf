import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckIcon,
  ClockIcon,
  CrossIcon,
  CrownIcon,
  DocumentSignedIcon,
  ExclamationIcon,
  PencilIcon,
  RefreshIcon,
} from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import { faceStyle } from '@/lib/font-weight';
import { CATEGORY_LABEL } from '@/lib/labels';

import { AdminPageHeader } from './admin-nav';
import { type ReviewItem, type ReviewState, useReviewItems } from '../api/review';
import { isOverdue, timeAgo } from '../utils';

export const STATE: Record<
  ReviewState,
  { label: string; tone: 'info' | 'success' | 'warning' | 'danger'; Icon: typeof CheckIcon }
> = {
  pending: { label: 'بانتظار المراجعة', tone: 'info', Icon: ClockIcon },
  approved: { label: 'مقبول', tone: 'success', Icon: CheckIcon },
  changes: { label: 'طُلبت تعديلات', tone: 'warning', Icon: PencilIcon },
  rejected: { label: 'مرفوض', tone: 'danger', Icon: CrossIcon },
};

export const failedChecks = (s: ReviewItem) => s.checks.filter((c) => !c.ok).length;

export function ReviewCard({ s, compact }: { s: ReviewItem; compact?: boolean }) {
  const st = STATE[s.state];
  const failed = failedChecks(s);
  const late = s.state === 'pending' && isOverdue(s.submittedAt);
  return (
    <li className="flex animate-fade-up flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center">
      <p
        aria-hidden
        className="grid h-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-sunken px-4 text-3xl sm:w-40"
        style={faceStyle(s.preview, 700)}
      >
        {s.nameAr ?? 'أبجد'}
      </p>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={paths.admin.review.getHref(s.id)}
            className="text-lead font-semibold underline-offset-4 hover:text-primary hover:underline"
          >
            <bdi>{s.nameLatin}</bdi>
            {s.nameAr && <span className="font-normal text-muted-foreground"> · {s.nameAr}</span>}
          </Link>
          <Badge tone={st.tone} icon={<st.Icon />}>
            {st.label}
          </Badge>
          {s.resubmission && (
            <Badge tone="neutral" icon={<RefreshIcon />}>
              إعادة إرسال
            </Badge>
          )}
        </div>
        <p className="mt-1 text-caption text-muted-foreground">
          {s.foundry.name} · {CATEGORY_LABEL[s.category]} · {s.weights.length} أوزان ·{' '}
          <span className={late ? 'font-medium text-warn-text' : undefined}>{timeAgo(s.submittedAt)}</span>
        </p>
        {!compact && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {s.type === 'paid' ? (
              <Badge tone="studio" icon={<CrownIcon />}>
                مدفوع · <bdi dir="ltr">${s.price}</bdi>
              </Badge>
            ) : (
              <Badge tone="neutral">مجاني · {s.license}</Badge>
            )}
            {failed ? (
              <Badge tone="warning" icon={<ExclamationIcon />}>
                {failed === 1 ? 'فحص واحد لم يمرّ' : `${failed} فحوص لم تمرّ`}
              </Badge>
            ) : (
              <Badge tone="success" icon={<CheckIcon />}>
                الفحوص الآلية سليمة
              </Badge>
            )}
          </div>
        )}
      </div>
      <Button
        asChild
        size="sm"
        variant={s.state === 'pending' ? 'primary' : 'outline'}
        className="self-start sm:self-center"
      >
        <Link to={paths.admin.review.getHref(s.id)}>{s.state === 'pending' ? 'راجِع' : 'التفاصيل'}</Link>
      </Button>
    </li>
  );
}

type Filter = ReviewState | 'all';

/** طابور المراجعة: الأقدم أولاً (من انتظر أكثر يُراجَع أولاً)، والقرارات السابقة في تبويباتها */
export function ReviewQueue() {
  const items = useReviewItems();
  const [filter, setFilter] = useState<Filter>('pending');
  const count = (st: ReviewState) => items.filter((i) => i.state === st).length;
  const rows = items
    .filter((i) => filter === 'all' || i.state === filter)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const pending = count('pending');

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="المراجعة"
        description={
          pending ? `${pending} خطوط بانتظار قرار · الأقدم أولاً · هدف المراجعة 3 أيام عمل` : 'لا خطوط بانتظار المراجعة'
        }
      />
      <SegmentedControl
        label="حالة الطلب"
        value={filter}
        onChange={setFilter}
        className="max-w-full self-start overflow-x-auto"
        options={[
          { value: 'pending', label: `بانتظار ${count('pending')}` },
          { value: 'changes', label: `تعديلات ${count('changes')}` },
          { value: 'rejected', label: `مرفوضة ${count('rejected')}` },
          { value: 'approved', label: `مقبولة ${count('approved')}` },
          { value: 'all', label: 'الكل' },
        ]}
      />
      {rows.length ? (
        <ul aria-label="طلبات المراجعة" className="flex flex-col gap-3">
          {rows.map((s) => (
            <ReviewCard key={s.id} s={s} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<DocumentSignedIcon />}
          title={filter === 'pending' ? 'الطابور فارغ' : 'لا طلبات هنا'}
          description={
            filter === 'pending' ? 'راجعت كل ما وصل. ستظهر هنا الخطوط الجديدة فور إرسالها.' : 'جرّب حالة أخرى.'
          }
        />
      )}
    </div>
  );
}
