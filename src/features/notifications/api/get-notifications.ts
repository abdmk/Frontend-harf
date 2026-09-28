import { mockNotifications } from '@/mocks/notifications';
import type { User } from '@/types/domain/user';

import { toViews } from '../utils/group';

/** إشعارات المستخدم جاهزة للعرض — تجريبية اليوم، ومن الخادم حسب المستخدم لاحقاً */
export function getNotifications(user: User) {
  void user;
  const now = Date.now();
  return toViews(mockNotifications(now), now);
}
