import { Link } from 'react-router';

import { StatCard } from '@/components/shared/stat-card';
import {
  ArrowLeftIcon,
  CartIcon,
  CheckIcon,
  DocumentSignedIcon,
  DownloadIcon,
  EyeOffIcon,
  PictureIcon,
  ShieldCheckIcon,
  TimePastIcon,
  UserIcon,
} from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import { useSiteContent } from '@/lib/site-content';
import type { AdminAnalytics } from '@/types/domain/analytics';

import { AdminPageHeader } from './admin-nav';
import { useAuditLog } from '../api/audit';
import { useStoreFonts } from '../api/fonts-store';
import { useManuscriptRequests } from '../api/manuscripts';
import { useReviewItems } from '../api/review';
import { useStudioRequests } from '../api/studios';
import { fmt, isOverdue, timeAgo } from '../utils';

type Task = {
  key: string;
  Icon: (p: { className?: string }) => React.JSX.Element;
  title: string;
  line: string;
  to: string;
  cta: string;
  urgent?: boolean;
};

/** صفّ مهمّة: أيقونة، ما المطلوب ولماذا، وزرّ الانتقال — القائمة كلها رابط واحد لكل صفّ */
function TaskRow({ t }: { t: Task }) {
  return (
    <li>
      <Link to={t.to} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-sunken/60 sm:px-5">
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full [&_svg]:size-4.5',
            t.urgent ? 'bg-tint-brand text-primary' : 'bg-sunken text-muted-foreground',
          )}
        >
          <t.Icon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-control font-semibold">{t.title}</span>
          <span className="mt-0.5 block text-meta text-muted-foreground">{t.line}</span>
        </span>
        <span className="hidden items-center gap-1 text-meta font-medium text-foreground group-hover:text-primary sm:inline-flex">
          {t.cta}
          <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}

/**
 * الرئيسية: سؤال واحد — «ما الذي ينتظرني؟» — بقائمة مهام مرتّبة بالأهمّية، ثم أربعة أرقام
 * للاطمئنان على المنصّة، ثم آخر النشاط. الرسوم والتفاصيل في «التحليلات» وحدها.
 */
export function AdminOverview({ analytics: d, adminName }: { analytics: AdminAnalytics; adminName: string }) {
  const reviews = useReviewItems();
  const studios = useStudioRequests();
  const manuscripts = useManuscriptRequests();
  const fonts = useStoreFonts();
  const content = useSiteContent();
  const log = useAuditLog();

  const pendingFonts = reviews
    .filter((r) => r.state === 'pending')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const overdue = pendingFonts.filter((r) => isOverdue(r.submittedAt)).length;
  const pendingStudios = studios.filter((r) => r.status === 'pending');
  const pendingManuscripts = manuscripts
    .filter((m) => m.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const hidden = fonts.filter((f) => f.visibility === 'hidden').length;
  const activeBanners = content.banners.filter((b) => b.active).length;

  const tasks: Task[] = [];
  if (pendingFonts.length)
    tasks.push({
      key: 'fonts',
      Icon: DocumentSignedIcon,
      title: `${pendingFonts.length} خطوط بانتظار المراجعة`,
      line: overdue
        ? `${overdue} منها تجاوز يومين — ابدأ بالأقدم`
        : `أقدمها وصل ${timeAgo(pendingFonts[0]!.submittedAt)}`,
      to: paths.admin.review.getHref(pendingFonts[0]!.id),
      cta: 'ابدأ بالأقدم',
      urgent: true,
    });
  if (pendingStudios.length)
    tasks.push({
      key: 'studios',
      Icon: ShieldCheckIcon,
      title: `${pendingStudios.length} استوديوهات تطلب التوثيق`,
      line: 'لا يستطيعون البيع قبل اعتمادك',
      to: `${paths.admin.getHref('requests')}?type=studios`,
      cta: 'راجِع',
      urgent: true,
    });
  if (pendingManuscripts.length)
    tasks.push({
      key: 'manuscripts',
      Icon: PictureIcon,
      title: `${pendingManuscripts.length} مخطوطات بانتظار المراجعة`,
      line: `أقدمها وصل ${timeAgo(pendingManuscripts[0]!.createdAt)}`,
      to: paths.admin.manuscript.getHref(pendingManuscripts[0]!.reference),
      cta: 'ابدأ بالأقدم',
      urgent: true,
    });
  if (hidden)
    tasks.push({
      key: 'hidden',
      Icon: EyeOffIcon,
      title: `${hidden} خطوط مخفية`,
      line: 'لا يراها الزوّار — تأكّد أن الإخفاء ما زال مقصوداً',
      to: paths.admin.getHref('fonts'),
      cta: 'الخطوط',
    });
  if (!activeBanners)
    tasks.push({
      key: 'banners',
      Icon: PictureIcon,
      title: 'الشريحة الرئيسية بلا بنرات',
      line: 'أضف بنراً — صورة أو نصّاً — ليظهر أعلى المكتبة',
      to: paths.admin.getHref('content'),
      cta: 'المحتوى',
    });

  const k = d.kpis;
  const hour = new Date().getHours();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={`${hour < 12 ? 'صباح الخير' : 'مساء الخير'}، ${adminName}`}
        description={new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      <section aria-labelledby="tasks-title" className="flex flex-col gap-3">
        <h2 id="tasks-title" className="text-lead font-semibold">
          ما ينتظرك
        </h2>
        {tasks.length ? (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {tasks.map((t) => (
              <TaskRow key={t.key} t={t} />
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-3 rounded-xl border bg-card p-5 text-control text-muted-foreground">
            <span className="grid size-10 place-items-center rounded-full bg-tint-ok text-ok-text">
              <CheckIcon className="size-4.5" />
            </span>
            لا شيء ينتظرك — كل الطلبات محسومة والمكتبة كما ينبغي.
          </p>
        )}
      </section>

      <section aria-labelledby="pulse-title" className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 id="pulse-title" className="text-lead font-semibold">
            المنصّة هذا الشهر
          </h2>
          <Link
            to={paths.admin.getHref('analytics')}
            className="inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-primary"
          >
            التحليلات
            <ArrowLeftIcon className="size-3.5" />
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
      </section>

      <section aria-labelledby="log-title" className="flex flex-col gap-3">
        <h2 id="log-title" className="text-lead font-semibold">
          آخر النشاط
        </h2>
        {log.length ? (
          <ol className="divide-y rounded-xl border bg-card">
            {log.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3 text-meta sm:px-5">
                <TimePastIcon className="size-4 shrink-0 text-tertiary" />
                <span className="min-w-0 flex-1">
                  {e.action} <bdi className="font-medium">«{e.target}»</bdi>
                </span>
                <span className="shrink-0 text-caption text-muted-foreground">
                  {e.actor} · {timeAgo(e.at)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border bg-card p-5 text-meta text-muted-foreground">
            ستظهر هنا القرارات والتعديلات — من فعلها ومتى.
          </p>
        )}
      </section>
    </div>
  );
}
