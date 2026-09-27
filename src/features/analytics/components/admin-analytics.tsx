import Link from 'next/link';

import { AreaChart } from '@/components/shared/charts/area-chart';
import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { ColumnChart } from '@/components/shared/charts/column-chart';
import { DonutChart } from '@/components/shared/charts/donut-chart';
import { Sparkline } from '@/components/shared/charts/sparkline';
import { StatCard } from '@/components/shared/stat-card';
import { UsageMeter } from '@/components/shared/usage-meter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CartIcon, CrownIcon, DownloadIcon, GlobeIcon, UserIcon } from '@/components/ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import type { AdminAnalytics, Range } from '@/types/domain/analytics';

import { TransactionsLog } from './transactions-log';
import { UsersRegistry } from './users-registry';

const RANGE_LABEL: Record<Range, string> = { '7': '7 أيام', '30': '30 يوماً', '365': 'سنة' };

function RevenueCard({
  title,
  value,
  delta,
  line,
  trend,
  color,
  split,
}: {
  title: string;
  value: string;
  delta: number;
  line: React.ReactNode;
  trend: number[];
  color: string;
  split: { label: string; value: number }[];
}) {
  const sum = split.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-6">
      <h3 className="text-control text-muted-foreground">{title}</h3>
      <p className="flex items-center gap-3">
        <span dir="ltr" className="text-3xl font-semibold tracking-tight">
          {value}
        </span>
        <Badge tone="success" dir="ltr">
          +{delta}%
        </Badge>
      </p>
      <p className="text-meta">{line}</p>
      <Sparkline values={trend} color={color} />
      <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 text-caption text-muted-foreground">
        {split.map((s, i) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: `var(--chart-${i + 1})` }} />
            {s.label}{' '}
            <strong dir="ltr" className="text-foreground">
              ${s.value.toLocaleString('en-US')}
            </strong>
            <span dir="ltr">{Math.round((s.value / sum) * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** لوحة التحليلات للمشرف (تصميم 21-09 ولقطة harflibrary): فلتر المدى وتصدير CSV فوق كل شيء، ثم ثلاثة تبويبات */
export function AdminAnalyticsView({ data: d, range }: { data: AdminAnalytics; range: Range }) {
  const k = d.kpis;
  const s = d.revenue.sales;
  const sub = d.revenue.subscriptions;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-caption text-tertiary">لوحة الإدارة</p>
          <h1 className="text-display font-semibold">التحليلات</h1>
          <p className="text-meta text-muted-foreground">آخر تحديث قبل 4 دقائق · بيانات تجريبية</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="المدى الزمني" className="flex rounded-full bg-sunken p-1">
            {(['7', '30', '365'] as const).map((r) => (
              <Link
                key={r}
                href={`?range=${r}`}
                aria-current={range === r ? 'true' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-control transition-colors',
                  range === r
                    ? 'bg-paper font-medium text-paper-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {RANGE_LABEL[r]}
              </Link>
            ))}
          </nav>
          <Button asChild variant="outline">
            <a href={`/admin/analytics/export?range=${range}`} download>
              <DownloadIcon />
              تصدير CSV
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList aria-label="أقسام التحليلات">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={k.accounts.label}
              value={k.accounts.value.toLocaleString('en-US')}
              delta={k.accounts.delta}
              deltaSuffix=""
              hint={k.accounts.hint}
              icon={<UserIcon />}
              trend={k.accounts.trend}
              trendColor="var(--chart-1)"
            />
            <StatCard
              label={k.visitors.label}
              value={k.visitors.value.toLocaleString('en-US')}
              hint={k.visitors.hint}
              icon={<GlobeIcon />}
              trend={k.visitors.trend}
              trendColor="var(--chart-2)"
            />
            <StatCard
              label={k.downloads.label}
              value={k.downloads.value.toLocaleString('en-US')}
              hint={k.downloads.hint}
              icon={<DownloadIcon />}
              trend={k.downloads.trend}
              trendColor="var(--color-ok-500)"
            />
            <StatCard
              label={k.subscribers.label}
              value={k.subscribers.value}
              hint={k.subscribers.hint}
              icon={<CrownIcon />}
              trend={k.subscribers.trend}
              trendColor="var(--chart-3)"
            />
          </div>

          <div>
            <p className="mb-3 text-meta text-muted-foreground">
              الإيرادات — مصدران منفصلان: بيع الأعمال دخل لمرّة واحدة، والاشتراك دخل متكرّر. جمعُهما في رقم واحد يخفي
              أيّهما ينمو.
            </p>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              <RevenueCard
                title="إيراد المبيعات — هذا الشهر"
                value={formatMoney(s.month)}
                delta={s.delta}
                line={
                  <>
                    خطوط ومخطوطات · {s.orders} عملية · متوسّط الطلب <span dir="ltr">{formatMoney(s.avgOrder)}</span>
                  </>
                }
                trend={s.trend}
                color="var(--chart-1)"
                split={s.split}
              />
              <RevenueCard
                title="إيراد الاشتراكات — متكرّر شهرياً"
                value={formatMoney(sub.mrr)}
                delta={sub.delta}
                line={
                  <>
                    الأساسية والاستوديو · <span dir="ltr">{formatMoney(sub.arr)}</span> سنوياً بالوتيرة الحالية
                  </>
                }
                trend={sub.trend}
                color="var(--chart-2)"
                split={sub.split}
              />
            </div>
          </div>

          <ChartCard
            title="المصدران عبر ستّة أشهر"
            subtitle="بيع الأعمال مقابل الاشتراكات · بالدولار"
            action={<Badge>لا يُجمعان</Badge>}
          >
            <ColumnChart
              categories={d.months}
              series={[
                { label: 'المبيعات', values: d.salesByMonth },
                { label: 'الاشتراكات', values: d.subsByMonth },
              ]}
              unit="usd"
              caption="إيراد المبيعات والاشتراكات شهرياً خلال ستّة أشهر"
            />
          </ChartCard>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <ChartCard title="النشاط اليومي" subtitle="زيارات يومية · آخر 30 يوماً">
              <AreaChart
                labels={d.days}
                values={d.visitsByDay}
                label="الزيارات"
                caption="الزيارات اليومية خلال آخر 30 يوماً"
              />
            </ChartCard>
            <ChartCard
              title="توزيع الخطط"
              subtitle={`${k.accounts.value.toLocaleString('en-US')} حساب · ${k.subscribers.value} منها مدفوع`}
            >
              <DonutChart slices={d.plans} totalLabel="حساب" caption="توزيع الحسابات على الخطط" />
            </ChartCard>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
            <ChartCard title="توزيع الأجهزة" subtitle="حسب الجلسات">
              <DonutChart slices={d.devices} totalLabel="جلسة" caption="الجلسات حسب نوع الجهاز" />
            </ChartCard>
            <ChartCard title="المستخدمون الجدد" subtitle="حسابات أُنشئت يومياً · آخر 30 يوماً">
              <AreaChart
                labels={d.days}
                values={d.signupsByDay}
                label="التسجيلات"
                color="var(--chart-1)"
                caption="التسجيلات اليومية خلال آخر 30 يوماً"
              />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="users" className="flex flex-col gap-6">
          <ChartCard title="تغطية بيانات الملفّات" subtitle="النسب أدناه محسوبة على من أفصح عن بياناته وحده.">
            <UsageMeter
              label={`ملفات مكتملة — ${d.coverage.complete.toLocaleString('en-US')} من ${d.coverage.total.toLocaleString('en-US')}`}
              meter={{ used: d.coverage.complete, limit: d.coverage.total }}
            />
          </ChartCard>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <ChartCard title="الدول" subtitle="أعلى 6">
              <BarList items={d.countries} color="var(--chart-2)" />
            </ChartCard>
            <ChartCard title="الفئات العمرية" subtitle="من الشريحة التي أفصحت">
              <BarList items={d.ages} color="var(--chart-4)" />
            </ChartCard>
          </div>
          <ChartCard title="الحسابات المسجّلة">
            <UsersRegistry users={d.users} />
          </ChartCard>
        </TabsContent>

        <TabsContent value="sales" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="إيراد هذا الشهر" value={formatMoney(s.month)} delta={s.delta} icon={<CartIcon />} />
            <StatCard label="عدد العمليات" value={s.orders} hint="3 مستردّة · 1.4% من العمليات" />
            <StatCard
              label="الدخل المتكرّر (MRR)"
              value={formatMoney(sub.mrr)}
              delta={sub.delta}
              icon={<CrownIcon />}
            />
            <StatCard label="الدخل السنوي (ARR)" value={formatMoney(sub.arr)} hint="MRR × 12 بالوتيرة الحالية" />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <ChartCard title="أعلى الأعمال مبيعاً" subtitle="هذا الشهر · بالإيراد (دولار)">
              <BarList items={d.topWorks} />
            </ChartCard>
            <ChartCard title="سجلّ العمليات" subtitle="مبيعات واشتراكات — كلٌّ بشارته">
              <TransactionsLog items={d.transactions} />
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
