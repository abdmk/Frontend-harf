import type { Metadata } from 'next';

import { paths } from '@/config/paths';
import { getStudio } from '@/features/studio/api/get-studio';
import { StudioDashboard } from '@/features/studio/components/studio-dashboard';
import { requireStudio } from '@/lib/auth';

export const metadata: Metadata = { title: 'لوحة المسبك', robots: { index: false } };

export default async function StudioPage() {
  const user = await requireStudio(paths.studio.getHref());
  const { foundry, fonts, analytics } = await getStudio(user);
  return (
    <main id="main" className="mx-auto max-w-360 px-4 py-8 sm:px-8 lg:px-12">
      <StudioDashboard foundry={foundry} fonts={fonts} analytics={analytics} />
    </main>
  );
}
