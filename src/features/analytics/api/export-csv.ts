import type { Range } from '@/types/domain/analytics';
import { toCsv } from '@/utils/csv';

import { getAdminAnalytics } from './get-analytics';

export function downloadAnalyticsCsv(range: Range) {
  const d = getAdminAnalytics(range);
  const csv = toCsv([
    ['اليوم', 'الزيارات', 'التسجيلات'],
    ...d.days.map((day, i) => [day, d.visitsByDay[i] ?? 0, d.signupsByDay[i] ?? 0]),
  ]);
  const blob = new Blob([csv], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harf-analytics-${range}d.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
