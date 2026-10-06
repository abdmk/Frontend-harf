import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentSignedIcon, ExclamationIcon, RefreshIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import { faceStyle } from '@/utils/font-weight';
import { CATEGORY_LABEL } from '@/utils/labels';

import { AdminPageHeader } from './admin-nav';
import { STATE } from './decision-panel';
import { type ReviewItem, type ReviewState, useReviewItems } from '../api/review';
import { isOverdue, timeAgo } from '../utils';

export const failedChecks = (s: ReviewItem) => s.checks.filter((c) => !c.ok).length;

/**
 * صفّ طلب في قائمة واحدة (لا بطاقة لكل طلب): معاينة الخط، الاسم، سطر وصفي، وشارة فقط لما يستحق
 * الانتباه (فحص لم يمرّ، تأخّر، إعادة إرسال). الإجراء زرّ هادئ — لا أزرار حمراء متكرّرة.
 */
export function ReviewCard({ s }: { s: ReviewItem; compact?: boolean }) {
  const st = STATE[s.state];
  const failed = failedChecks(s);
  const late = s.state === 'pending' && isOverdue(s.submittedAt);
  return (
    <li className="flex animate-fade-up items-center gap-4 px-4 py-4 sm:px-5">
      <p
        aria-hidden
        className="hidden h-14 w-24 shrink-0 place-items-center overflow-hidden rounded-md bg-sunken px-2 text-xl whitespace-nowrap sm:grid"
        style={faceStyle(s.preview, 700)}
      >
        {s.nameAr ?? 'أبجد'}
      </p>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to={paths.admin.review.getHref(s.id)}
            className="text-control font-semibold underline-offset-4 hover:text-primary hover:underline"
          >
            <bdi>{s.nameLatin}</bdi>
            {s.nameAr && <span className="font-normal text-muted-foreground"> · {s.nameAr}</span>}
          </Link>
          {s.state !== 'pending' && (
            <Badge tone={st.tone} icon={<st.Icon />}>
              {st.label}
            </Badge>
          )}
          {failed > 0 && (
            <Badge tone="warning" icon={<ExclamationIcon />}>
              {failed === 1 ? 'فحص لم يمرّ' : `${failed} فحوص لم تمرّ`}
            </Badge>
          )}
          {s.resubmission && (
            <Badge tone="neutral" icon={<RefreshIcon />}>
              إعادة إرسال
            </Badge>
          )}
        </div>
        <p className="mt-1 text-meta text-muted-foreground">
          {s.foundry.name} · {CATEGORY_LABEL[s.category]} · {s.weights.length} أوزان ·{' '}
          {s.type === 'paid' ? (
            <>
              مدفوع <bdi dir="ltr">${s.price}</bdi>
            </>
          ) : (
            'مجاني'
          )}{' '}
          · <span className={late ? 'font-medium text-warn-text' : undefined}>{timeAgo(s.submittedAt)}</span>
        </p>
      </div>
      <Button asChild size="sm" variant={s.state === 'pending' ? 'secondary' : 'outline'}>
        <Link to={paths.admin.review.getHref(s.id)}>{s.state === 'pending' ? 'راجِع' : 'التفاصيل'}</Link>
      </Button>
    </li>
  );
}

type Filter = ReviewState | 'all';

/** طابور المراجعة: الأقدم أولاً (من انتظر أكثر يُراجَع أولاً)، والقرارات السابقة في تبويباتها */
export function ReviewQueue({ embedded = false }: { embedded?: boolean }) {
  const items = useReviewItems();
  const [filter, setFilter] = useState<Filter>('pending');
  const count = (st: ReviewState) => items.filter((i) => i.state === st).length;
  const rows = items
    .filter((i) => filter === 'all' || i.state === filter)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const pending = count('pending');

  return (
    <div className="flex flex-col gap-5">
      {!embedded && (
        <AdminPageHeader
          title="المراجعة"
          description={
            pending
              ? `${pending} خطوط بانتظار قرار · الأقدم أولاً · هدف المراجعة 3 أيام عمل`
              : 'لا خطوط بانتظار المراجعة'
          }
        />
      )}
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
        <ul aria-label="طلبات المراجعة" className="divide-y rounded-xl border bg-card">
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
