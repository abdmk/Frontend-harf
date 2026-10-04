import { useParams, useSearchParams } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { AdminOverview } from '@/features/admin/components/admin-overview';
import { ContentManager } from '@/features/admin/components/content-manager';
import { FontDetail } from '@/features/admin/components/font-detail';
import { FontStore } from '@/features/admin/components/font-store';
import { Requests } from '@/features/admin/components/requests';
import { ReviewDetail } from '@/features/admin/components/review-detail';
import { StudioRequestDetail } from '@/features/admin/components/studio-verifications';
import { UsersManager } from '@/features/admin/components/users-manager';
import { getAdminAnalytics } from '@/features/analytics/api/get-analytics';
import { AdminAnalyticsView } from '@/features/analytics/components/admin-analytics';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Range } from '@/types/domain/analytics';

/* صفحات لوحة الإدارة — الحارس في AdminLayout، وكل إجراء يتحقّق من الدور مجدّداً (features/admin/api) */

export function AdminHomePage() {
  const admin = useCurrentUser();
  return (
    <>
      <PageMeta title="لوحة الإدارة" noindex />
      <AdminOverview analytics={getAdminAnalytics('30')} adminName={admin?.name ?? ''} />
    </>
  );
}

export function AdminReviewDetailPage() {
  const { id = '' } = useParams();
  return (
    <>
      <PageMeta title="مراجعة خط" noindex />
      <ReviewDetail id={id} />
    </>
  );
}

export function AdminFontsPage() {
  return (
    <>
      <PageMeta title="مخزن الخطوط" noindex />
      <FontStore />
    </>
  );
}

export function AdminFontDetailPage() {
  const { id = '' } = useParams();
  return (
    <>
      <PageMeta title="خط في المخزن" noindex />
      <FontDetail id={id} />
    </>
  );
}

export function AdminUsersPage() {
  return (
    <>
      <PageMeta title="المستخدمون" noindex />
      <UsersManager visits={getAdminAnalytics('30').kpis.visitors.value} />
    </>
  );
}

export function AdminContentPage() {
  return (
    <>
      <PageMeta title="المحتوى" noindex />
      <ContentManager />
    </>
  );
}

const toRange = (v: string | null): Range => (v === '7' || v === '365' ? v : '30');

export function AdminAnalyticsPage() {
  const [searchParams] = useSearchParams();
  const range = toRange(searchParams.get('range'));
  return (
    <>
      <PageMeta title="التحليلات" noindex />
      <AdminAnalyticsView data={getAdminAnalytics(range)} range={range} />
    </>
  );
}

export function AdminStudioDetailPage() {
  const { id = '' } = useParams();
  return (
    <>
      <PageMeta title="طلب توثيق" noindex />
      <StudioRequestDetail id={id} />
    </>
  );
}

export function AdminRequestsPage() {
  return (
    <>
      <PageMeta title="الطلبات" noindex />
      <Requests />
    </>
  );
}
