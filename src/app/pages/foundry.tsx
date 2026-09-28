import { Navigate, useParams } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';
import { FontGrid } from '@/components/shared/font-grid';
import { PageMeta } from '@/components/shared/page-meta';
import { SectionHeading } from '@/components/shared/section-heading';
import { LayersIcon } from '@/components/ui/icons';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { getFoundry } from '@/features/studio/api/get-studio';
import { FoundryProfile } from '@/features/studio/components/foundry-profile';

export function FoundryPage() {
  const { id } = useParams<{ id: string }>();
  const data = getFoundry(id!);
  if (!data) return <Navigate to="/" replace />;
  const ids = new Set(data.fonts.map((f) => f.id));
  const fonts = getFonts(DEFAULT_QUERY).filter((f) => ids.has(f.id));
  const downloads = data.fonts.reduce((sum, f) => sum + f.downloads, 0);

  return (
    <Container as="main" id="main" className="py-8 sm:py-12">
      <PageMeta title={data.foundry.name} description={data.foundry.bio} />
      <FoundryProfile foundry={data.foundry} stats={{ fonts: data.fonts.length, downloads }} />
      <section aria-labelledby="ff-title" className="mt-12">
        <SectionHeading
          id="ff-title"
          title={
            <>
              خطوط المسبك{' '}
              <span dir="ltr" className="font-normal text-tertiary">
                ({fonts.length})
              </span>
            </>
          }
          description="كل خط منشور من هذا المسبك، بتراخيصه وأسعاره."
        />
        <FontGrid
          fonts={fonts}
          renderCard={(f) => <CatalogCard font={f} />}
          empty={
            <EmptyState
              icon={<LayersIcon />}
              title="لا خطوط منشورة بعد"
              description="تابع المسبك ليصلك إشعار حين ينشر أول خط."
            />
          }
        />
      </section>
    </Container>
  );
}
