import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { FontGrid } from '@/components/shared/font-grid';
import { SectionHeading } from '@/components/shared/section-heading';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { getFoundry } from '@/features/studio/api/get-studio';
import { FoundryProfile } from '@/features/studio/components/foundry-profile';

export async function generateMetadata({ params }: PageProps<'/foundries/[id]'>): Promise<Metadata> {
  const f = await getFoundry((await params).id);
  return f ? { title: f.foundry.name, description: f.foundry.bio } : { title: 'المسبك غير موجود' };
}

export default async function FoundryPage({ params }: PageProps<'/foundries/[id]'>) {
  const data = await getFoundry((await params).id);
  if (!data) notFound();
  const ids = new Set(data.fonts.map((f) => f.id));
  const fonts = (await getFonts(DEFAULT_QUERY)).filter((f) => ids.has(f.id));
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
