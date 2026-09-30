import { Navigate, Outlet, useOutletContext } from 'react-router';

import { SiteHeader } from '@/components/layout/site-header';
import { paths } from '@/config/paths';
import { getStudio } from '@/features/studio/api/get-studio';
import { StudioSidebar, StudioTabs, useStudioSection } from '@/features/studio/components/studio-nav';
import { getCurrentUser } from '@/lib/auth';

import { HeaderActions } from '../header-actions';
import { preloadPage } from '../lazy-pages';
import { PageTransition } from './page-transition';

type StudioContext = ReturnType<typeof getStudio>;

/** بيانات الاستوديو لصفحاته — تُجلب مرّة في التخطيط */
export function useStudio() {
  return useOutletContext<StudioContext>();
}

/**
 * مساحة الاستوديو: مستقلّة عن الحساب الشخصي — عمود جانبي بهوية الاستوديو وأقسامه الأربعة،
 * وحارس واحد لكل صفحاتها (الاستوديو وحده؛ والخادم يتحقّق من الدور في كل طلب).
 */
export function StudioLayout() {
  const section = useStudioSection();
  const user = getCurrentUser();
  if (!user) return <Navigate to={paths.login.getHref(`/studio${section ? `/${section}` : ''}`)} replace />;
  if (user.plan !== 'studio') return <Navigate to={paths.account.getHref('subscription')} replace />;
  const studio = getStudio(user);
  return (
    <>
      <SiteHeader actions={<HeaderActions />} onNavIntent={preloadPage} />
      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="hidden lg:sticky lg:top-26 lg:block lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto">
          <StudioSidebar foundry={studio.foundry} />
        </aside>
        <StudioTabs foundry={studio.foundry} />
        <main id="main" className="min-w-0">
          <PageTransition>
            <Outlet context={studio} />
          </PageTransition>
        </main>
      </div>
    </>
  );
}
