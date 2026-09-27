import { CtaSection } from '@/components/layout/cta-section';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { ActiveFilters } from '@/features/catalog/components/active-filters';
import { CatalogProvider, CatalogResults } from '@/features/catalog/components/catalog-context';
import { CatalogToolbar } from '@/features/catalog/components/catalog-toolbar';
import { FeaturedCarousel } from '@/features/catalog/components/featured-carousel';
import { FontCard } from '@/components/shared/font-card';
import { FontGrid } from '@/components/shared/font-grid';
import { EmptyResults } from '@/features/catalog/components/empty-results';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { parseCatalogQuery } from '@/features/catalog/types/catalog-query';

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  // معاملات الرابط تُتحقّق على الخادم قبل أي استعمال
  const query = parseCatalogQuery(await searchParams);
  const fonts = await getFonts(query);

  return (
    <main id="main" className="mx-auto w-[min(100%-2rem,1120px)] pt-6 sm:w-[min(100%-3rem,1120px)] sm:pt-12">
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
    </main>
  );
}
