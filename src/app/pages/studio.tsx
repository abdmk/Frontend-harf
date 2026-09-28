import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { getStudio } from '@/features/studio/api/get-studio';
import { StudioDashboard } from '@/features/studio/components/studio-dashboard';
import { getCurrentUser } from '@/lib/auth';

export function StudioPage() {
  const user = getCurrentUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref())} replace />;
  if (user.plan !== 'studio') return <Navigate to={paths.account.getHref('subscription')} replace />;
  const { foundry, fonts, analytics } = getStudio(user);
  return (
    <main id="main" className="container-page py-8 sm:py-10">
      <PageMeta title="لوحة المسبك" noindex />
      <StudioDashboard foundry={foundry} fonts={fonts} analytics={analytics} />
    </main>
  );
}
