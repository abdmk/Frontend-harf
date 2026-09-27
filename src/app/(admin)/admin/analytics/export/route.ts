import { getAdminAnalytics } from '@/features/analytics/api/get-analytics';
import { getCurrentUser } from '@/lib/auth';
import { toCsv } from '@/lib/csv';

/** تصدير CSV للمشرف وحده — غيره يرى 404، والملف لا يُخزَّن في ذاكرة وسيطة */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'admin') return new Response('Not found', { status: 404 });
  const r = new URL(request.url).searchParams.get('range');
  const range = r === '7' || r === '365' ? r : '30';
  const d = await getAdminAnalytics(range);
  const csv = toCsv([
    ['اليوم', 'الزيارات', 'التسجيلات'],
    ...d.days.map((day, i) => [day, d.visitsByDay[i] ?? 0, d.signupsByDay[i] ?? 0]),
  ]);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="harf-analytics-${range}d.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
