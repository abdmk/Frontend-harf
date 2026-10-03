import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckIcon,
  ClockIcon,
  CloudUploadIcon,
  CrossIcon,
  CrownIcon,
  LayersIcon,
  PencilIcon,
} from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import { formatDateAr, formatMoney } from '@/lib/format';
import { netOf } from '@/lib/publisher-terms';
import { cents } from '@/types/domain/commerce';
import type { ReviewStatus, StudioFont } from '@/types/domain/foundry';

import { StudioPageHeader } from './studio-page-header';

export const STATUS: Record<
  ReviewStatus,
  { tone: 'success' | 'info' | 'danger' | 'neutral'; label: string; Icon: typeof CheckIcon }
> = {
  published: { tone: 'success', label: 'منشور', Icon: CheckIcon },
  review: { tone: 'info', label: 'قيد المراجعة', Icon: ClockIcon },
  rejected: { tone: 'danger', label: 'مرفوض', Icon: CrossIcon },
  draft: { tone: 'neutral', label: 'مسودّة', Icon: PencilIcon },
};

type StatusFilter = 'all' | ReviewStatus;
type TypeFilter = 'all' | StudioFont['type'];
const fmt = (n: number) => n.toLocaleString('en-US');

/** أرقام الخط حسب نوعه: المجاني بلا بيع ولا أرباح، والمدفوع يضيفهما — وغير المنشور بلا أرقام */
function Metrics({ f }: { f: StudioFont }) {
  if (f.status !== 'published') return null;
  const items: [string, string][] = [
    ['تحميل', fmt(f.downloads)],
    ['في المفضّلة', fmt(f.favorites)],
    ['التقييم', f.rating ? `${f.rating.value.toFixed(1)} (${fmt(f.rating.count)})` : '—'],
  ];
  if (f.type === 'paid') {
    items.push(['مبيعات', fmt(f.sales ?? 0)]);
    items.push(['صافي الأرباح', formatMoney(cents(netOf(f.revenueCents ?? 0).net))]);
  }
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map(([k, v]) => (
        <div key={k} className="flex flex-col-reverse">
          <dt className="text-caption text-tertiary">{k}</dt>
          <dd dir="ltr" className="text-right font-semibold tabular-nums">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** «خطوطي»: كل خطوط الاستوديو — المنشور وقيد المراجعة والمسودّات والمرفوض، مجانية ومدفوعة */
export function StudioFonts({ fonts }: { fonts: StudioFont[] }) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const rows = fonts.filter((f) => (status === 'all' || f.status === status) && (type === 'all' || f.type === type));
  const count = (s: ReviewStatus) => fonts.filter((f) => f.status === s).length;

  return (
    <div className="flex flex-col gap-5">
      <StudioPageHeader
        title="خطوطي"
        description={`${fonts.length} خطوط · ${count('published')} منشورة`}
        action={
          <Button asChild>
            <Link to={paths.studio.getHref('publish')}>
              <CloudUploadIcon />
              رفع خط
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="الحالة"
          value={status}
          onChange={setStatus}
          className="max-w-full overflow-x-auto"
          options={[
            { value: 'all', label: 'الكل' },
            ...(Object.keys(STATUS) as ReviewStatus[]).map((s) => ({
              value: s,
              label: `${STATUS[s].label} ${count(s)}`,
            })),
          ]}
        />
        <SegmentedControl
          label="النوع"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: 'الكل' },
            { value: 'free', label: 'مجانية' },
            { value: 'paid', label: 'مدفوعة' },
          ]}
        />
      </div>

      {rows.length ? (
        <ul aria-label="خطوط الاستوديو" className="flex flex-col gap-3">
          {rows.map((f) => {
            const st = STATUS[f.status];
            const published = f.status === 'published';
            return (
              <li
                key={f.id}
                className="flex animate-fade-up flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={published ? paths.font.getHref(f.id) : paths.studio.getHref('publish')}
                      className="text-lead font-semibold underline-offset-4 hover:text-primary hover:underline"
                    >
                      {f.name}
                    </Link>
                    <Badge tone={st.tone} icon={<st.Icon />}>
                      {st.label}
                    </Badge>
                    {f.type === 'paid' ? (
                      <Badge tone="studio" icon={<CrownIcon />}>
                        مدفوع · <bdi dir="ltr">${f.price}</bdi>
                      </Badge>
                    ) : (
                      <Badge tone="neutral">مجاني</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {f.weights} أوزان · آخر تعديل {formatDateAr(f.updatedAt)}
                  </p>
                  {f.note && <p className="mt-2 text-meta text-dgr-text">{f.note}</p>}
                  {f.status === 'review' && (
                    <p className="mt-2 text-meta text-muted-foreground">نراجعه عادةً خلال 3 أيام عمل.</p>
                  )}
                  {published && (
                    <div className="mt-4">
                      <Metrics f={f} />
                    </div>
                  )}
                </div>
                <Button
                  asChild
                  variant={published ? 'outline' : 'secondary'}
                  size="sm"
                  className="self-start sm:self-center"
                >
                  <Link to={paths.studio.getHref('publish')}>
                    {f.status === 'draft' ? 'أكمل' : f.status === 'rejected' ? 'أصلح وأعد الإرسال' : 'تعديل'}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={<LayersIcon />} title="لا خطوط تطابق التصفية" description="غيّر الحالة أو النوع." />
      )}
    </div>
  );
}
