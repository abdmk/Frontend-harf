import { Link } from 'react-router';

import { AreaChart } from '@/components/shared/charts/area-chart';
import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BankIcon,
  CheckIcon,
  ClockIcon,
  CrossIcon,
  DollarIcon,
  DownloadIcon,
  InfoIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDateAr, formatMoney } from '@/lib/format';
import type { StudioAnalytics } from '@/types/domain/analytics';
import type { Foundry, ReviewStatus, StudioFont } from '@/types/domain/foundry';

const STATUS: Record<
  ReviewStatus,
  { tone: 'success' | 'info' | 'danger' | 'neutral'; label: string; Icon: typeof CheckIcon }
> = {
  published: { tone: 'success', label: 'منشور', Icon: CheckIcon },
  review: { tone: 'info', label: 'قيد المراجعة', Icon: ClockIcon },
  rejected: { tone: 'danger', label: 'مرفوض', Icon: CrossIcon },
  draft: { tone: 'neutral', label: 'مسودّة', Icon: PencilIcon },
};

/** لوحة المسبك (تصميم 21-09 «إحصاءات المصمم» + «الأرباح والدفعات») */
export function StudioDashboard({
  foundry,
  fonts,
  analytics: a,
}: {
  foundry: Foundry;
  fonts: StudioFont[];
  analytics: StudioAnalytics;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-caption text-tertiary">لوحة المسبك</p>
          <h1 className="text-2xl font-semibold">{foundry.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={paths.foundry.getHref(foundry.id)}>صفحتك العامة</Link>
          </Button>
          <Button asChild>
            <Link to={paths.studio.getHref('publish')}>
              <PlusIcon />
              خط جديد
            </Link>
          </Button>
        </div>
      </div>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="mb-3 text-meta text-muted-foreground">
          إحصاءات المصمّم
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={a.downloads.label}
            value={a.downloads.value.toLocaleString('en-US')}
            delta={a.downloads.delta}
            hint={a.downloads.hint}
            icon={<DownloadIcon />}
            trend={a.downloads.trend}
            trendColor="var(--chart-1)"
          />
          <StatCard
            label={a.followers.label}
            value={a.followers.value.toLocaleString('en-US')}
            delta={a.followers.delta}
            deltaSuffix=""
            hint={a.followers.hint}
            icon={<UserIcon />}
            trend={a.followers.trend}
            trendColor="var(--color-ok-500)"
          />
          <StatCard
            label="خطوط منشورة"
            value={a.published.total}
            hint={`${a.published.free} مجانية · ${a.published.paid} مدفوعة`}
            icon={<LayersIcon />}
          />
          <StatCard
            label="متوسّط التقييم"
            value={`${a.rating.value} / 5`}
            hint={`من ${a.rating.count.toLocaleString('en-US')} تقييماً`}
            icon={<StarIcon />}
          />
        </div>
      </section>

      <section aria-labelledby="earn-title">
        <h2 id="earn-title" className="mb-3 text-meta text-muted-foreground">
          الأرباح والدفعات
        </h2>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between gap-8 rounded-xl border bg-card p-6">
            <div>
              <p className="flex items-center gap-2 text-control text-muted-foreground">
                <DollarIcon className="size-4" />
                الرصيد المتاح للتحويل
              </p>
              <p dir="ltr" className="mt-3 text-right text-5xl font-semibold tracking-tight">
                {formatMoney(a.earnings.available)}
              </p>
              <p className="mt-3 text-meta text-muted-foreground">
                الدفعة القادمة <strong className="text-foreground">{formatDateAr(a.earnings.nextPayout)}</strong> ·
                التحويل كل 14 يوماً إلى{' '}
                <span dir="ltr" className="tabular-nums">
                  IQ•• {a.earnings.bankLast4}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link to={paths.account.getHref('payouts')}>
                  <DollarIcon />
                  اسحب رصيدك
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to={paths.account.getHref('earnings')}>
                  <BankIcon />
                  تفاصيل الأرباح
                </Link>
              </Button>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {(
              [
                ['إجمالي الأرباح', a.earnings.total, 'بعد حصّة المنصّة', DollarIcon, 'bg-tint-info text-info-text'],
                [
                  'قيد التحويل',
                  a.earnings.pending,
                  'يُصرف مع الدفعة القادمة',
                  ClockIcon,
                  'bg-tint-warn text-warn-text',
                ],
                [
                  'المدفوع',
                  a.earnings.paid,
                  `آخر تحويل: ${formatDateAr(a.earnings.lastPayout)}`,
                  CheckIcon,
                  'bg-tint-ok text-ok-text',
                ],
              ] as const
            ).map(([label, money, hint, Icon, tint]) => (
              <li key={label} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <span className={`grid size-11 shrink-0 place-items-center rounded-sm ${tint}`}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-caption text-muted-foreground">{label}</p>
                  <p dir="ltr" className="text-right text-lg font-semibold">
                    {formatMoney(money)}
                  </p>
                  <p className="text-caption text-tertiary">{hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-caption text-tertiary">
          <InfoIcon className="size-3.5" />
          تُحتسب الأرباح عند اكتمال عملية الشراء، وتصبح قابلة للتحويل بعد انقضاء مدّة الاسترجاع. الحدّ الأدنى للتحويل{' '}
          {formatMoney(a.earnings.minPayout)}. (أرقام وسياسات تجريبية)
        </p>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ChartCard title="تحميلات خطوطك عبر الوقت" subtitle="آخر 30 يوماً · تحميلات يومية">
          <AreaChart
            labels={a.days}
            values={a.downloadsByDay}
            label="التحميلات"
            color="var(--chart-1)"
            caption="تحميلات خطوط المسبك اليومية خلال آخر 30 يوماً"
          />
        </ChartCard>
        <ChartCard title="أعلى خطوطك تحميلاً" subtitle="آخر 30 يوماً">
          <BarList items={a.topFonts} />
        </ChartCard>
      </div>

      <section aria-labelledby="fonts-title" className="rounded-xl border bg-card p-2 sm:p-4">
        <h2 id="fonts-title" className="px-3 pt-3 pb-2 text-base font-semibold">
          خطوطك
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الخط</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-end">التحميلات</TableHead>
              <TableHead>آخر تعديل</TableHead>
              <TableHead>
                <span className="sr-only">إجراءات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fonts.map((f) => {
              const st = STATUS[f.status];
              return (
                <TableRow key={f.id}>
                  <TableCell>
                    {/* المنشور يفتح صفحته في المكتبة، والباقي يفتح النشر لإكماله أو تعديله */}
                    <Link
                      to={f.status === 'published' ? paths.font.getHref(f.id) : paths.studio.getHref('publish')}
                      className="font-medium underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      {f.name}
                    </Link>
                    <span className="block text-caption text-muted-foreground">
                      {f.weights} أوزان{f.note ? ` · ${f.note}` : ''}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge tone={st.tone} icon={<st.Icon />}>
                      {st.label}
                    </Badge>
                  </TableCell>
                  <TableCell dir="ltr" className="text-start font-medium">
                    {f.downloads ? f.downloads.toLocaleString('en-US') : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateAr(f.updatedAt)}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={paths.studio.getHref('publish')}>
                        {f.status === 'draft' || f.status === 'rejected' ? 'أكمل' : 'تعديل'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
