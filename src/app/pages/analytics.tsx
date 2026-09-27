import { Navigate, useSearchParams } from 'react-router';

import { paths } from '@/config/paths';
import { getAdminAnalytics } from '@/features/analytics/api/get-analytics';
import { AdminAnalyticsView } from '@/features/analytics/components/admin-analytics';
import { requireAdmin } from '@/lib/auth';
import type { Range } from '@/types/domain/analytics';

const toRange = (v: string | null): Range => (v === '7' || v === '365' ? v : '30');

export function AnalyticsPage() {
  const user = requireAdmin();
  if (!user) return <Navigate to={paths.login.getHref(paths.admin.analytics.getHref())} replace />;
  const [searchParams] = useSearchParams();
  const range = toRange(searchParams.get('range'));
  const data = getAdminAnalytics(range);
  return (
    <main id="main" className="mx-auto max-w-360 px-4 py-8 sm:px-8 lg:px-12">
      <AdminAnalyticsView data={data} range={range} />
    </main>
  );
}
