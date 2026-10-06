import { useState } from 'react';
import { Link } from 'react-router';

import { AreaChart } from '@/components/shared/charts/area-chart';
import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeftIcon,
  CrossIcon,
  DownloadIcon,
  LayersIcon,
  PencilIcon,
  StarIcon,
  UserIcon,
} from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { paths } from '@/config/paths';
import type { StudioAnalytics, StudioRange } from '@/types/domain/analytics';
import { cents } from '@/types/domain/commerce';
import type { StudioFont } from '@/types/domain/foundry';
import { formatMoney } from '@/utils/format';

import { RANGE_LABEL, StudioPageHeader } from './studio-page-header';
import { getSales, useEarnings } from '../api/earnings';
import { studioTotals } from '../api/get-studio';

const sum = (xs: number[]) => xs.reduce((n, x) => n + x, 0);
const fmt = (n: number) => n.toLocaleString('en-US');

/** ملخّص مالي مختصر — للاستوديو الذي يبيع فقط؛ التفاصيل كلها في «المالية» */
function FinanceGlance() {
  const e = useEarnings();
  const month = getSales().filter((s) => s.date.startsWith('2026-09') && s.status !== 'refunded');
  return (
    <section
      aria-labelledby="glance-t"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <p id="glance-t" className="text-meta text-muted-foreground">
            الرصيد المتاح
          </p>
          <p dir="ltr" className="text-right text-2xl font-semibold tabular-nums">
            {formatMoney(cents(e.available))}
          </p>
        </div>
        <div>
          <p className="text-meta text-muted-foreground">صافي هذا الشهر</p>
          <p dir="ltr" className="text-right text-2xl font-semibold tabular-nums">
            {formatMoney(cents(month.reduce((n, s) => n + s.netCents, 0)))}
          </p>
        </div>
      </div>
      <Link
        to={paths.studio.getHref('finance')}
        className="inline-flex items-center gap-1 text-meta font-medium text-primary hover:underline"
      >
        المالية
        <ChevronLeftIcon className="size-3.5" />
      </Link>
    </section>
  );
}

/**
 * نظرة عامة على الاستوديو — مفيدة لمن ينشر مجاناً أيضاً: التحميلات والمستخدمون والخطوط والتقييم،
 * الأداء عبر الزمن، أفضل الخطوط، وما يحتاج انتباهك. المال سطر واحد فقط، ولمن يبيع.
 */
export function StudioOverview({ fonts, analytics: a }: { fonts: StudioFont[]; analytics: StudioAnalytics }) {
  const [range, setRange] = useState<StudioRange>('30');
  const t = studioTotals(fonts);
  const s = a.series[range];
  const d = a.deltas[range];
  const top = fonts
    .filter((f) => f.status === 'published')
    .sort((x, y) => y.downloads - x.downloads)
    .map((f) => ({ label: f.name, value: f.downloads }));

  return (
    <div className="flex flex-col gap-6">
      <StudioPageHeader
        title="نظرة عامة"
        description="أداء الاستوديو وخطوطه."
        action={
          <SegmentedControl
            label="المدّة"
            value={range}
            onChange={setRange}
            options={(Object.keys(RANGE_LABEL) as StudioRange[]).map((r) => ({ value: r, label: RANGE_LABEL[r] }))}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          tone="ok"
          label="التحميلات"
          value={fmt(sum(s.downloads))}
          delta={d.downloads}
          hint={`آخر ${RANGE_LABEL[range]}`}
          icon={<DownloadIcon />}
        />
        <StatCard
          tone="info"
          label="المستخدمون"
          value={fmt(sum(s.users))}
          delta={d.users}
          hint="من حمّلوا خطاً واحداً على الأقل"
          icon={<UserIcon />}
        />
        <StatCard
          tone="ai"
          label="خطوط منشورة"
          value={t.published}
          hint={`${t.free} مجانية · ${t.paid} مدفوعة`}
          icon={<LayersIcon />}
        />
        <StatCard
          tone="warn"
          label="التقييم"
          value={t.rating ? `${t.rating.value.toFixed(1)} / 5` : '—'}
          hint={t.rating ? `من ${fmt(t.rating.count)} تقييماً` : 'لا تقييمات بعد'}
          icon={<StarIcon />}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="التحميلات عبر الوقت" subtitle={`آخر ${RANGE_LABEL[range]} · يومياً`}>
          <AreaChart
            labels={s.labels}
            values={s.downloads}
            label="التحميلات"
            color="var(--chart-1)"
            caption={`تحميلات خطوط الاستوديو اليومية خلال آخر ${RANGE_LABEL[range]}`}
          />
        </ChartCard>
        <ChartCard title="أفضل الخطوط" subtitle="بالتحميلات منذ النشر">
          <BarList items={top} />
        </ChartCard>
      </div>

      {t.attention.length > 0 && (
        <section aria-labelledby="attn-t" className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="attn-t" className="font-semibold">
              يحتاج انتباهك
            </h2>
            <Link to={paths.studio.getHref('fonts')} className="text-meta font-medium text-primary hover:underline">
              خطوطي
            </Link>
          </div>
          <ul className="flex flex-col divide-y">
            {t.attention.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 last:pb-0">
                {f.status === 'rejected' ? (
                  <Badge tone="danger" icon={<CrossIcon />}>
                    مرفوض
                  </Badge>
                ) : (
                  <Badge tone="neutral" icon={<PencilIcon />}>
                    مسودّة
                  </Badge>
                )}
                <span className="font-medium">{f.name}</span>
                <span className="min-w-0 flex-1 text-meta text-muted-foreground">
                  {f.note ?? 'لم يُرسل للمراجعة بعد.'}
                </span>
                <Link
                  to={paths.studio.getHref('publish')}
                  className="text-meta font-medium text-primary hover:underline"
                >
                  {f.status === 'rejected' ? 'أصلحه' : 'أكمله'}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {t.hasPaid && <FinanceGlance />}
    </div>
  );
}
