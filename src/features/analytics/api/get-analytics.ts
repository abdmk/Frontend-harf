import 'server-only';

import { MOCK_ADMIN_ANALYTICS } from '@/mocks/studio';
import type { Range } from '@/types/domain/analytics';

export const RANGES: Range[] = ['7', '30', '365'];

/** تحليلات الإدارة — تجريبية؛ لاحقاً استعلامات مجمَّعة على الخادم حسب المدى */
export async function getAdminAnalytics(range: Range) {
  void range;
  return MOCK_ADMIN_ANALYTICS;
}
