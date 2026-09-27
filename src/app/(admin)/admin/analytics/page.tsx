import type { Metadata } from 'next';

import { paths } from '@/config/paths';
import { getAdminAnalytics } from '@/features/analytics/api/get-analytics';
import { AdminAnalyticsView } from '@/features/analytics/components/admin-analytics';
import { requireAdmin } from '@/lib/auth';
import type { Range } from '@/types/domain/analytics';

export const metadata: Metadata = { title: 'التحليلات', robots: { index: false, follow: false } };

const toRange = (v: unknown): Range => (v === '7' || v === '365' ? v : '30');

export default async function AnalyticsPage({ searchParams }: PageProps<'/admin/analytics'>) {
  await requireAdmin(paths.admin.analytics.getHref());
  const range = toRange((await searchParams).range);
  const data = await getAdminAnalytics(range);
  return (
    <main id="main" className="mx-auto max-w-360 px-4 py-8 sm:px-8 lg:px-12">
      <AdminAnalyticsView data={data} range={range} />
    </main>
  );
}
