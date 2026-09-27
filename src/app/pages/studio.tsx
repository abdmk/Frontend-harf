import { Navigate } from 'react-router';

import { paths } from '@/config/paths';
import { getStudio } from '@/features/studio/api/get-studio';
import { StudioDashboard } from '@/features/studio/components/studio-dashboard';
import { requireStudio } from '@/lib/auth';

export function StudioPage() {
  const user = requireStudio();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref())} replace />;
  const { foundry, fonts, analytics } = getStudio(user);
  return (
    <main id="main" className="mx-auto max-w-360 px-4 py-8 sm:px-8 lg:px-12">
      <StudioDashboard foundry={foundry} fonts={fonts} analytics={analytics} />
    </main>
  );
}
