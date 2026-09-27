import { Navigate, useParams } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { FontGrid } from '@/components/shared/font-grid';
import { SectionHeading } from '@/components/shared/section-heading';
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
  return (
    <Container as="main" id="main" className="py-8 sm:py-12">
      <FoundryProfile foundry={data.foundry} />
      <section aria-labelledby="ff-title" className="mt-10">
        <SectionHeading id="ff-title" title="خطوط المسبك المنشورة" />
        <FontGrid fonts={fonts} renderCard={(f) => <CatalogCard font={f} />} />
      </section>
    </Container>
  );
}
