import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { submitForReview } from '@/features/publishing/api/submit';
import { PublishWorkspace } from '@/features/publishing/components/publish-workspace';
import { requireStudio } from '@/lib/auth';

export function PublishPage() {
  const user = requireStudio();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref('publish'))} replace />;
  return (
    <main id="main" className="mx-auto max-w-360 px-4 py-8 sm:px-8 lg:px-12">
      <PageMeta title="نشر خط جديد" noindex />
      <PublishWorkspace isAdmin={user.role === 'admin'} onSubmit={submitForReview} />
    </main>
  );
}
