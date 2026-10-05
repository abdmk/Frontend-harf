import { Navigate, Outlet, useOutletContext } from 'react-router';

import { SiteHeader } from '@/components/layout/site-header';
import { paths } from '@/config/paths';
import { WorkspaceShell } from '@/features/account/components/account-shell';
import { getStudio } from '@/features/studio/api/get-studio';
import { useStudioSection } from '@/features/studio/components/studio-nav';
import { useCurrentUser } from '@/hooks/use-current-user';

import { HeaderActions } from '../header-actions';
import { preloadPage } from '../preload';
import { PageTransition } from './page-transition';

type StudioContext = ReturnType<typeof getStudio>;

/** بيانات الاستوديو لصفحاته — تُجلب مرّة في التخطيط */
export function useStudio() {
  return useOutletContext<StudioContext>();
}

/**
 * مساحة الاستوديو: العمود الجانبي نفسه الذي في صفحات الحساب (الاستوديو بند فيه بأقسامه)،
 * وحارس واحد لكل صفحاتها (الاستوديو وحده؛ والخادم يتحقّق من الدور في كل طلب).
 */
export function StudioLayout() {
  const section = useStudioSection();
  const user = useCurrentUser();
  if (!user) return <Navigate to={paths.login.getHref(`/studio${section ? `/${section}` : ''}`)} replace />;
  if (user.plan !== 'studio') return <Navigate to={paths.account.getHref('subscription')} replace />;
  const studio = getStudio(user);
  return (
    <>
      <SiteHeader actions={<HeaderActions />} onNavIntent={preloadPage} />
      <WorkspaceShell user={user}>
        <PageTransition>
          <Outlet context={studio} />
        </PageTransition>
      </WorkspaceShell>
    </>
  );
}
