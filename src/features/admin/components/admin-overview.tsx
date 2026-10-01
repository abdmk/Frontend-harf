import { Link } from 'react-router';

import { AreaChart } from '@/components/shared/charts/area-chart';
import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  CartIcon,
  DocumentSignedIcon,
  DownloadIcon,
  EyeOffIcon,
  PictureIcon,
  TimePastIcon,
  UserIcon,
} from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { useSiteContent } from '@/lib/site-content';
import type { AdminAnalytics } from '@/types/domain/analytics';

import { AdminPageHeader } from './admin-nav';
import { ReviewCard } from './review-queue';
import { useAuditLog } from '../api/audit';
import { useStoreFonts } from '../api/fonts-store';
import { useReviewItems } from '../api/review';
import { fmt, isOverdue, timeAgo } from '../utils';

/** بطاقة «يحتاج انتباهك» — رقم وسطر واحد ورابط للإجراء؛ تهدأ حين لا شيء */
function Attention({
  icon,
  title,
  count,
  line,
  to,
  cta,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  line: string;
  to: string;
  cta: string;
  tone?: 'brand' | 'warn' | 'neutral';
}) {
  const quiet = count === 0;
  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-strong',
        !quiet && tone === 'brand' && 'moment',
      )}
    >
      <span className="flex items-center justify-between gap-3 text-meta text-muted-foreground">
        {title}
        <span
          className={cn(
            'grid size-9 place-items-center rounded-full [&_svg]:size-4.5',
            quiet
              ? 'bg-sunken text-tertiary'
              : tone === 'warn'
                ? 'bg-tint-warn text-warn-text'
                : 'bg-tint-brand text-primary',
          )}
        >
          {icon}
        </span>
      </span>
      <span dir="ltr" className={cn('text-end text-3xl font-semibold tabular-nums', quiet && 'text-tertiary')}>
        {count}
      </span>
      <span className="text-meta text-muted-foreground">{line}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-meta font-medium text-foreground group-hover:text-primary">
        {cta}
        <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      </span>
    </Link>
  );
}

/**
 * الرئيسية: ما يحتاج قراراً أولاً (المراجعة، الخطوط المخفية، المحتوى)، ثم نبض المنصّة بأرقام قليلة،
 * ثم آخر ما فعله المشرفون. التفاصيل الكاملة في التحليلات.
 */
export function AdminOverview({ analytics: d, adminName }: { analytics: AdminAnalytics; adminName: string }) {
  const reviews = useReviewItems();
  const fonts = useStoreFonts();
  const content = useSiteContent();
  const log = useAuditLog();

  const pending = reviews
    .filter((r) => r.state === 'pending')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const overdue = pending.filter((r) => isOverdue(r.submittedAt)).length;
  const hidden = fonts.filter((f) => f.visibility === 'hidden').length;
  const activeBanners = content.banners.filter((b) => b.active).length;
  const top = fonts
    .filter((f) => f.visibility === 'visible')
    .sort((a, b) => b.stats.downloads - a.stats.downloads)
    .slice(0, 6)
    .map((f) => ({ label: f.font.name, value: f.stats.downloads }));
  const k = d.kpis;
  const hour = new Date().getHours();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`${hour < 12 ? 'صباح الخير' : 'مساء الخير'}، ${adminName}`}
        description={new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      <section aria-labelledby="att-title" className="flex flex-col gap-3">
        <h2 id="att-title" className="text-lg font-semibold">
          يحتاج انتباهك
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Attention
            icon={<DocumentSignedIcon />}
            title="بانتظار المراجعة"
            count={pending.length}
            line={
              pending.length
                ? overdue
                  ? `${overdue} منها تجاوز يومين`
                  : `أقدمها وصل ${timeAgo(pending[0]!.submittedAt)}`
                : 'الطابور فارغ'
            }
            to={pending[0] ? paths.admin.review.getHref(pending[0].id) : paths.admin.getHref('review')}
            cta={pending.length ? 'ابدأ بالأقدم' : 'سجلّ المراجعات'}
            tone="brand"
          />
          <Attention
            icon={<EyeOffIcon />}
            title="خطوط مخفية"
            count={hidden}
            line={hidden ? 'لا يراها الزوّار — راجع إن كان الإخفاء مؤقتاً' : 'كل الخطوط ظاهرة'}
            to={paths.admin.getHref('fonts')}
            cta="مخزن الخطوط"
            tone="warn"
          />
          <Attention
            icon={<PictureIcon />}
            title="بنرات مفعّلة"
            count={activeBanners}
            line={activeBanners ? `من ${content.banners.length} في الشريحة الرئيسية` : 'الشريحة الرئيسية بلا بنرات'}
            to={paths.admin.getHref('content')}
            cta="إدارة المحتوى"
            tone="warn"
          />
        </div>
      </section>

      <section aria-labelledby="pulse-title" className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 id="pulse-title" className="text-lg font-semibold">
            نبض المنصّة
          </h2>
          <Link to={paths.admin.getHref('analytics')} className="text-meta text-muted-foreground hover:text-primary">
            التحليلات الكاملة
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            tone="info"
            label={k.accounts.label}
            value={fmt(k.accounts.value)}
            delta={k.accounts.delta}
            deltaSuffix=""
            icon={<UserIcon />}
            hint={k.accounts.hint}
          />
          <StatCard
            tone="ok"
            label={k.downloads.label}
            value={fmt(k.downloads.value)}
            icon={<DownloadIcon />}
            hint={k.downloads.hint}
          />
          <StatCard
            tone="brand"
            label="إيراد المبيعات"
            value={formatMoney(d.revenue.sales.month)}
            delta={d.revenue.sales.delta}
            icon={<CartIcon />}
            hint={`${d.revenue.sales.orders} عملية هذا الشهر`}
          />
          <StatCard
            label="الاشتراكات (MRR)"
            value={formatMoney(d.revenue.subscriptions.mrr)}
            delta={d.revenue.subscriptions.delta}
            hint={`${k.subscribers.value} مشترك`}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <ChartCard title="الزيارات" subtitle="يومياً · آخر 30 يوماً">
            <AreaChart
              labels={d.days}
              values={d.visitsByDay}
              label="الزيارات"
              caption="الزيارات اليومية خلال آخر 30 يوماً"
            />
          </ChartCard>
          <ChartCard title="الأكثر تحميلاً" subtitle="من الخطوط الظاهرة">
            <BarList items={top} />
          </ChartCard>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="q-title" className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <h2 id="q-title" className="text-lg font-semibold">
              التالي في الطابور
            </h2>
            {pending.length > 3 && (
              <Button asChild variant="ghost" size="sm">
                <Link to={paths.admin.getHref('review')}>الكل ({pending.length})</Link>
              </Button>
            )}
          </div>
          {pending.length ? (
            <ul className="flex flex-col gap-3">
              {pending.slice(0, 3).map((s) => (
                <ReviewCard key={s.id} s={s} compact />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border bg-card p-6 text-meta text-muted-foreground">
              لا شيء بانتظارك — راجعت كل ما وصل.
            </p>
          )}
        </section>

        <section aria-labelledby="log-title" className="flex flex-col gap-3">
          <h2 id="log-title" className="text-lg font-semibold">
            آخر النشاط
          </h2>
          <div className="rounded-xl border bg-card p-5">
            {log.length ? (
              <ol className="flex flex-col gap-4">
                {log.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex gap-3 text-meta">
                    <TimePastIcon className="mt-0.5 size-4 shrink-0 text-tertiary" />
                    <span className="min-w-0">
                      <span className="text-foreground">{e.action}</span>{' '}
                      <bdi className="font-medium">«{e.target}»</bdi>
                      <span className="block text-caption text-muted-foreground">
                        {e.actor} · {timeAgo(e.at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-meta text-muted-foreground">
                ستظهر هنا قرارات المراجعة وتعديلات الخطوط والمحتوى — من فعلها ومتى.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
