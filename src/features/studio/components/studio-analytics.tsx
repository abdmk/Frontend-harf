import { useState } from 'react';
import { Link } from 'react-router';

import { AreaChart } from '@/components/shared/charts/area-chart';
import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { StatCard } from '@/components/shared/stat-card';
import { DownloadIcon, EyeIcon, HeartIcon, StarIcon, UserIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import type { StudioAnalytics, StudioRange } from '@/types/domain/analytics';
import type { StudioFont } from '@/types/domain/foundry';

import { RANGE_LABEL, StudioPageHeader } from './studio-page-header';
import { studioTotals } from '../api/get-studio';

const sum = (xs: number[]) => xs.reduce((n, x) => n + x, 0);
const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * التحليلات: كل ما ليس مالاً — التحميلات والزيارات والمستخدمون والمفضّلة والتقييم، عبر الزمن ولكل خط.
 * مقياس واحد لكل رسم (لا محوران في رسم واحد).
 */
export function StudioAnalyticsView({ fonts, analytics: a }: { fonts: StudioFont[]; analytics: StudioAnalytics }) {
  const [range, setRange] = useState<StudioRange>('30');
  const s = a.series[range];
  const d = a.deltas[range];
  const t = studioTotals(fonts);
  const published = fonts.filter((f) => f.status === 'published').sort((x, y) => y.visits - x.visits);

  return (
    <div className="flex flex-col gap-6">
      <StudioPageHeader
        title="التحليلات"
        description="كيف يكتشف الناس خطوطك ويستخدمونها."
        action={
          <SegmentedControl
            label="المدّة"
            value={range}
            onChange={setRange}
            options={(Object.keys(RANGE_LABEL) as StudioRange[]).map((r) => ({ value: r, label: RANGE_LABEL[r] }))}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard label="الزيارات" value={fmt(sum(s.visits))} delta={d.visits} icon={<EyeIcon />} />
        <StatCard label="التحميلات" value={fmt(sum(s.downloads))} delta={d.downloads} icon={<DownloadIcon />} />
        <StatCard label="المستخدمون" value={fmt(sum(s.users))} delta={d.users} icon={<UserIcon />} />
        <StatCard label="في المفضّلة" value={fmt(t.favorites)} hint="منذ النشر" icon={<HeartIcon />} />
        <StatCard
          label="التقييم"
          value={t.rating ? t.rating.value.toFixed(1) : '—'}
          hint={t.rating ? `${fmt(t.rating.count)} تقييماً` : undefined}
          icon={<StarIcon />}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <ChartCard title="الزيارات" subtitle={`آخر ${RANGE_LABEL[range]} · يومياً`}>
          <AreaChart
            labels={s.labels}
            values={s.visits}
            label="الزيارات"
            color="var(--chart-2)"
            caption={`زيارات صفحات خطوطك اليومية خلال آخر ${RANGE_LABEL[range]}`}
          />
        </ChartCard>
        <ChartCard title="التحميلات" subtitle={`آخر ${RANGE_LABEL[range]} · يومياً`}>
          <AreaChart
            labels={s.labels}
            values={s.downloads}
            label="التحميلات"
            color="var(--chart-1)"
            caption={`تحميلات خطوطك اليومية خلال آخر ${RANGE_LABEL[range]}`}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard title="أداء كل خط" subtitle="منذ النشر">
          <Table aria-label="أداء الخطوط">
            <TableHeader>
              <TableRow>
                <TableHead>الخط</TableHead>
                <TableHead className="text-end">الزيارات</TableHead>
                <TableHead className="text-end">التحميلات</TableHead>
                <TableHead className="text-end">التحويل</TableHead>
                <TableHead className="text-end">المفضّلة</TableHead>
                <TableHead className="text-end">التقييم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {published.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Link to={paths.font.getHref(f.id)} className="font-medium hover:text-primary hover:underline">
                      {f.name}
                    </Link>
                    <span className="block text-caption text-muted-foreground">
                      {f.type === 'paid' ? 'مدفوع' : 'مجاني'}
                    </span>
                  </TableCell>
                  {[
                    fmt(f.visits),
                    fmt(f.downloads),
                    `${((f.downloads / Math.max(1, f.visits)) * 100).toFixed(1)}%`,
                    fmt(f.favorites),
                    f.rating ? f.rating.value.toFixed(1) : '—',
                  ].map((v, i) => (
                    <TableCell key={i} dir="ltr" className="text-start tabular-nums">
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 text-caption text-tertiary">التحويل = التحميلات ÷ زيارات صفحة الخط.</p>
        </ChartCard>
        <ChartCard title="الأكثر زيارة" subtitle="منذ النشر">
          <BarList items={published.map((f) => ({ label: f.name, value: f.visits }))} color="var(--chart-2)" />
        </ChartCard>
      </div>
    </div>
  );
}
