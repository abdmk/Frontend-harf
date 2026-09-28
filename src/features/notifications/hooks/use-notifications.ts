import { useState } from 'react';

import type { NotificationView } from '../utils/group';

/** حالة المقروء في الواجهة. عند الربط بالخادم يُستدعى فعل خادم هنا، والحالة تبقى تفاؤلية */
export function useNotifications(initial: NotificationView[]) {
  const [items, setItems] = useState(initial);
  return {
    items,
    unread: items.filter((n) => n.unread).length,
    markRead: (id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, unread: false } : x))),
    markAllRead: () => setItems((xs) => xs.map((x) => ({ ...x, unread: false }))),
  };
}
