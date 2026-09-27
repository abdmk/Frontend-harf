'use client';

import { MarkAllRead, NotificationList } from './notification-list';
import { useNotifications } from '../hooks/use-notifications';
import type { NotificationView } from '../utils/group';

/** صفحة «كل الإشعارات» — القائمة نفسها بعرض أوسع */
export function NotificationsPanel({ initial }: { initial: NotificationView[] }) {
  const { items, unread, markRead, markAllRead } = useNotifications(initial);
  return (
    <div className="bg-surface overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">{unread ? `${unread} غير مقروءة` : 'كلّها مقروءة'}</p>
        <MarkAllRead disabled={!unread} onClick={markAllRead} />
      </div>
      <NotificationList items={items} onRead={markRead} titleLevel="h2" />
    </div>
  );
}
