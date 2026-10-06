import { MOCK_ADMIN_ANALYTICS } from '@/testing/mocks/studio';
import type { Range } from '@/types/domain/analytics';

/** تحليلات الإدارة — تجريبية؛ لاحقاً استعلامات مجمَّعة على الخادم حسب المدى */
export function getAdminAnalytics(range: Range) {
  void range;
  return MOCK_ADMIN_ANALYTICS;
}
