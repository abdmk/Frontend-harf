import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExclamationIcon, PictureIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import type { ManuscriptSubmission, SubmissionStatus } from '@/lib/manuscript-submissions';
import { useManuscriptUrl } from '@/lib/media-store';
import { MANUSCRIPT_CATEGORY_LABEL } from '@/types/domain/manuscript';

import { STATE } from './decision-panel';
import { useManuscriptRequests } from '../api/manuscripts';
import { isOverdue, timeAgo } from '../utils';

/** صورة مصغّرة للرسم — من ملف الطلب نفسه، في <img> فقط */
export function ManuscriptThumb({ fileId, className }: { fileId?: string; className?: string }) {
  const url = useManuscriptUrl(fileId);
  return (
    <span
      aria-hidden
      className={
        className ?? 'hidden h-14 w-24 shrink-0 place-items-center overflow-hidden rounded-md bg-sunken p-1.5 sm:grid'
      }
    >
      {url ? <img src={url} alt="" className="max-h-full max-w-full object-contain" /> : null}
    </span>
  );
}

function Row({ m }: { m: ManuscriptSubmission }) {
  const st = STATE[m.status];
  const late = m.status === 'pending' && isOverdue(m.createdAt);
  const href = paths.admin.manuscript.getHref(m.reference);
  return (
    <li className="flex animate-fade-up items-center gap-4 px-4 py-4 sm:px-5">
      <ManuscriptThumb fileId={m.file.id} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link to={href} className="text-control font-semibold underline-offset-4 hover:text-primary hover:underline">
            {m.title}
          </Link>
          {m.status !== 'pending' && (
            <Badge tone={st.tone} icon={<st.Icon />}>
              {st.label}
            </Badge>
          )}
          {!m.file.id && (
            <Badge tone="warning" icon={<ExclamationIcon />}>
              الملف غير متاح
            </Badge>
          )}
        </div>
        <p className="mt-1 text-meta text-muted-foreground">
          {m.studioName} · {MANUSCRIPT_CATEGORY_LABEL[m.category]} ·{' '}
          <span className={late ? 'font-medium text-warn-text' : undefined}>{timeAgo(m.createdAt)}</span>
        </p>
      </div>
      <Button asChild size="sm" variant={m.status === 'pending' ? 'secondary' : 'outline'}>
        <Link to={href}>{m.status === 'pending' ? 'راجِع' : 'التفاصيل'}</Link>
      </Button>
    </li>
  );
}

type Filter = SubmissionStatus | 'all';

/** طابور المخطوطات: الأقدم أولاً، والقرارات السابقة في تبويباتها — كطابور الخطوط تماماً */
export function ManuscriptQueue() {
  const items = useManuscriptRequests();
  const [filter, setFilter] = useState<Filter>('pending');
  const count = (st: SubmissionStatus) => items.filter((i) => i.status === st).length;
  const rows = items
    .filter((i) => filter === 'all' || i.status === filter)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="flex flex-col gap-5">
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
        <ul aria-label="طلبات المخطوطات" className="divide-y rounded-xl border bg-card">
          {rows.map((m) => (
            <Row key={m.reference} m={m} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<PictureIcon />}
          title={filter === 'pending' ? 'لا مخطوطات بانتظارك' : 'لا طلبات هنا'}
          description={
            filter === 'pending'
              ? 'تظهر هنا المخطوطات التي ترفعها الاستوديوهات من «رفع مخطوطة» فور إرسالها.'
              : 'جرّب حالة أخرى.'
          }
        />
      )}
    </div>
  );
}
