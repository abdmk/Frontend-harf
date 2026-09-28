import { Navigate, useSearchParams } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { getAdminAnalytics } from '@/features/analytics/api/get-analytics';
import { AdminAnalyticsView } from '@/features/analytics/components/admin-analytics';
import { requireAdmin } from '@/lib/auth';
import type { Range } from '@/types/domain/analytics';

const toRange = (v: string | null): Range => (v === '7' || v === '365' ? v : '30');

export function AnalyticsPage() {
  const user = requireAdmin();
  const [searchParams] = useSearchParams();
  if (!user) return <Navigate to={paths.login.getHref(paths.admin.analytics.getHref())} replace />;
  const range = toRange(searchParams.get('range'));
  const data = getAdminAnalytics(range);
  return (
    <main id="main" className="container-page py-8 sm:py-10">
      <PageMeta title="التحليلات" noindex />
      <AdminAnalyticsView data={data} range={range} />
    </main>
  );
}
