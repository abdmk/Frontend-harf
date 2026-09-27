import type { Metadata } from 'next';

import { paths } from '@/config/paths';
import { submitForReview } from '@/features/publishing/api/submit';
import { PublishWorkspace } from '@/features/publishing/components/publish-workspace';
import { requireStudio } from '@/lib/auth';

export const metadata: Metadata = { title: 'مساحة النشر', robots: { index: false } };

export default async function PublishPage() {
  const user = await requireStudio(paths.studio.getHref('publish'));
  return (
    <main id="main" className="mx-auto max-w-360 px-4 py-8 sm:px-8 lg:px-12">
      <PublishWorkspace isAdmin={user.role === 'admin'} onSubmit={submitForReview} />
    </main>
  );
}
