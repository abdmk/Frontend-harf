import { Navigate } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageIntro } from '@/components/layout/page-intro';
import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { getNotifications } from '@/features/notifications/api/get-notifications';
import { NotificationsPanel } from '@/features/notifications/components/notifications-panel';
import { useCurrentUser } from '@/hooks/use-current-user';

export function NotificationsPage() {
  const user = useCurrentUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.notifications.getHref())} replace />;
  const items = getNotifications(user);
  return (
    <Container as="main" id="main" className="py-8 sm:py-12">
      <PageMeta title="الإشعارات" noindex />
      {/* الحاوية الموحّدة، والقائمة بعرض قراءة في وسطها */}
      <div className="mx-auto max-w-2xl">
        <PageIntro size="compact" title="الإشعارات" />
        <NotificationsPanel initial={items} />
      </div>
    </Container>
  );
}
