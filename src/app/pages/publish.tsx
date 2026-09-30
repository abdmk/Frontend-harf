import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { submitForReview } from '@/features/publishing/api/submit';
import { PublishWorkspace } from '@/features/publishing/components/publish-workspace';
import { requireStudio } from '@/lib/auth';

export function PublishPage() {
  const user = requireStudio();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref('publish'))} replace />;
  // داخل مساحة الاستوديو: التخطيط يوفّر العمود الجانبي و<main>
  return (
    <>
      <PageMeta title="نشر خط جديد" noindex />
      <PublishWorkspace isAdmin={user.role === 'admin'} onSubmit={submitForReview} />
    </>
  );
}
