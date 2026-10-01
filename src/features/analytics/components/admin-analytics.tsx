import { Link } from 'react-router';

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

import { AddRevenueDialog, ManualRevenueSection } from './manual-revenue';
import { TransactionsLog } from './transactions-log';
import { UsersRegistry } from './users-registry';
import { downloadAnalyticsCsv } from '../api/export-csv';
import { localToday, REVENUE_CATEGORY_LABEL } from '../api/manual-revenue';
import { useManualRevenue } from '../hooks/use-manual-revenue';

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
  const manual = useManualRevenue();
  // الإيرادات اليدوية لهذا الشهر تُضاف إلى إيراد الشهر، وكل القيود تظهر في سجلّ العمليات
  const month = localToday().slice(0, 7);
  const manualMonth = manual.items.filter((e) => e.date.startsWith(month)).reduce((n, e) => n + e.amount.cents, 0);
  // «مصادر أخرى» لكل شهر من الأشهر الستّة (آخرها الشهر الحالي) — من الإيرادات اليدوية
  const monthKeys = Array.from({ length: d.months.length }, (_, k) => {
    const dt = new Date();
    dt.setDate(1);
    dt.setMonth(dt.getMonth() - (d.months.length - 1 - k));
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  });
  const monthLabels = monthKeys.map((key) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString('ar-IQ', { month: 'long' }),
  );
  const otherByMonth = monthKeys.map((key) =>
    Math.round(manual.items.filter((e) => e.date.startsWith(key)).reduce((n, e) => n + e.amount.cents, 0) / 100),
  );
  const log = [
    ...manual.items.map((e) => ({
      id: e.id,
      buyer: e.client,
      kind: 'other' as const,
      label: REVENUE_CATEGORY_LABEL[e.category],
      when: new Date(`${e.date}T00:00:00`).toLocaleDateString('ar', { day: 'numeric', month: 'long' }),
      amount: e.amount,
    })),
    ...d.transactions,
  ];
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
                to={`?range=${r}`}
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
          <Button variant="outline" onClick={() => downloadAnalyticsCsv(range)}>
            <DownloadIcon />
            تصدير CSV
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
              tone="info"
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
              tone="ok"
              label={k.visitors.label}
              value={k.visitors.value.toLocaleString('en-US')}
              hint={k.visitors.hint}
              icon={<GlobeIcon />}
              trend={k.visitors.trend}
              trendColor="var(--chart-2)"
            />
            <StatCard
              tone="ok"
              label={k.downloads.label}
              value={k.downloads.value.toLocaleString('en-US')}
              hint={k.downloads.hint}
              icon={<DownloadIcon />}
              trend={k.downloads.trend}
              trendColor="var(--color-ok-500)"
            />
            <StatCard
              tone="warn"
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
            title="مصادر الإيراد عبر ستّة أشهر"
            subtitle="بيع الأعمال، الاشتراكات، ومصادر أخرى (تطوير خط، استشارة، تصميم مخطوطة…) · بالدولار"
            action={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Badge>لا تُجمع</Badge>
                <AddRevenueDialog onAdd={manual.add} variant="outline" />
              </div>
            }
          >
            <ColumnChart
              categories={monthLabels}
              series={[
                { label: 'المبيعات', values: d.salesByMonth },
                { label: 'الاشتراكات', values: d.subsByMonth },
                { label: 'مصادر أخرى', values: otherByMonth },
              ]}
              unit="usd"
              caption="إيراد المبيعات والاشتراكات والمصادر الأخرى شهرياً خلال ستّة أشهر"
            />
            {!otherByMonth.some(Boolean) && (
              <p className="text-caption text-muted-foreground">
                «مصادر أخرى» يُدخل يدوياً — أضف إيراد تطوير خط أو استشارة أو تصميم مخطوطة ليظهر في شهره.
              </p>
            )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              tone="info"
              label="المسجّلون"
              value={k.accounts.value.toLocaleString('en-US')}
              delta={k.accounts.delta}
              deltaSuffix=""
              hint="كل الحسابات"
              icon={<UserIcon />}
              trend={k.accounts.trend}
              trendColor="var(--chart-1)"
            />
            <StatCard
              tone="warn"
              label="المشتركون"
              value={k.subscribers.value.toLocaleString('en-US')}
              hint={`${((k.subscribers.value / Math.max(1, k.accounts.value)) * 100).toFixed(1)}% من المسجّلين`}
              icon={<CrownIcon />}
              trend={k.subscribers.trend}
              trendColor="var(--chart-3)"
            />
            <StatCard
              tone="ok"
              label="الزيارات"
              value={k.visitors.value.toLocaleString('en-US')}
              hint={k.visitors.hint}
              icon={<GlobeIcon />}
              trend={k.visitors.trend}
              trendColor="var(--chart-2)"
            />
            <StatCard
              label="تسجيلات جديدة"
              value={d.signupsByDay.reduce((a, b) => a + b, 0).toLocaleString('en-US')}
              hint={`خلال ${RANGE_LABEL[range]}`}
              icon={<UserIcon />}
              trend={d.signupsByDay.slice(-12)}
              trendColor="var(--chart-4)"
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <ChartCard title="المستخدمون الجدد" subtitle="حسابات أُنشئت يومياً">
              <AreaChart
                labels={d.days}
                values={d.signupsByDay}
                label="التسجيلات"
                color="var(--chart-1)"
                caption="التسجيلات اليومية"
              />
            </ChartCard>
            <ChartCard
              title="توزيع الخطط"
              subtitle={`${k.subscribers.value} مشترك من ${k.accounts.value.toLocaleString('en-US')}`}
            >
              <DonutChart slices={d.plans} totalLabel="حساب" caption="توزيع الحسابات على الخطط" />
            </ChartCard>
          </div>
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
            <StatCard
              tone="brand"
              label="إيراد هذا الشهر"
              value={formatMoney({ cents: s.month.cents + manualMonth, currency: 'USD' })}
              delta={s.delta}
              icon={<CartIcon />}
              hint={
                manualMonth ? `منها ${formatMoney({ cents: manualMonth, currency: 'USD' })} إيرادات أخرى` : undefined
              }
            />
            <StatCard label="عدد العمليات" value={s.orders} hint="3 مستردّة · 1.4% من العمليات" />
            <StatCard
              tone="warn"
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
            <ChartCard title="سجلّ العمليات" subtitle="مبيعات واشتراكات وإيرادات أخرى — كلٌّ بشارته">
              <TransactionsLog items={log} />
            </ChartCard>
          </div>
          <ManualRevenueSection
            items={manual.items}
            onAdd={manual.add}
            onRemove={manual.remove}
            onRestore={manual.restore}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
