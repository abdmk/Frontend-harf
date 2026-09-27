import { Container } from '@/components/layout/container';
import { CtaSection } from '@/components/layout/cta-section';
import { FontCard } from '@/components/shared/font-card';
import { FontGrid } from '@/components/shared/font-grid';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { ActiveFilters } from '@/features/catalog/components/active-filters';
import { CatalogProvider, CatalogResults } from '@/features/catalog/components/catalog-context';
import { CatalogToolbar } from '@/features/catalog/components/catalog-toolbar';
import { EmptyResults } from '@/features/catalog/components/empty-results';
import { FeaturedCarousel } from '@/features/catalog/components/featured-carousel';
import { parseCatalogQuery } from '@/features/catalog/types/catalog-query';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  // معاملات الرابط تُتحقّق على الخادم قبل أي استعمال
  const query = parseCatalogQuery(await searchParams);
  const fonts = await getFonts(query);

  return (
    <Container as="main" id="main" className="pt-6 sm:pt-12">
      <h1 className="sr-only">خطوط عربية مجانية</h1>
      <FeaturedCarousel />
      <CatalogProvider>
        <CatalogToolbar />
        <ActiveFilters count={fonts.length} />
        <CatalogResults>
          <FontGrid
            fonts={fonts}
            empty={<EmptyResults />}
            renderCard={(f) => <FontCard font={f} favorite={<FavoriteButton fontId={f.id} fontName={f.name} />} />}
          />
        </CatalogResults>
      </CatalogProvider>
      <CtaSection />
    </Container>
  );
}
