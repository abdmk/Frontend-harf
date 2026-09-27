import { Navigate } from 'react-router';

import { Container } from '@/components/layout/container';
import { paths } from '@/config/paths';
import { getNotifications } from '@/features/notifications/api/get-notifications';
import { NotificationsPanel } from '@/features/notifications/components/notifications-panel';
import { requireUser } from '@/lib/auth';

export function NotificationsPage() {
  const user = requireUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.notifications.getHref())} replace />;
  const items = getNotifications(user);
  return (
    <Container as="main" id="main" className="max-w-2xl py-8 sm:py-12">
      <h1 className="mb-8 text-2xl font-semibold">الإشعارات</h1>
      <NotificationsPanel initial={items} />
    </Container>
  );
}
