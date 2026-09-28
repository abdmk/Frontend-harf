import { useSearchParams } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { CtaSection } from '@/components/layout/cta-section';
import { FontGrid } from '@/components/shared/font-grid';
import { PageMeta } from '@/components/shared/page-meta';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { ActiveFilters } from '@/features/catalog/components/active-filters';
import { CatalogProvider, CatalogResults } from '@/features/catalog/components/catalog-context';
import { CatalogToolbar } from '@/features/catalog/components/catalog-toolbar';
import { EmptyResults } from '@/features/catalog/components/empty-results';
import { FeaturedCarousel } from '@/features/catalog/components/featured-carousel';
import { parseCatalogQuery } from '@/features/catalog/types/catalog-query';

export function HomePage() {
  const [searchParams] = useSearchParams();
  const query = parseCatalogQuery(Object.fromEntries(searchParams));
  const fonts = getFonts(query);

  const heading = query.license === 'paid' ? 'خطوط عربية مدفوعة' : 'خطوط عربية مجانية';
  return (
    <Container as="main" id="main" className="pt-6 sm:pt-12">
      <PageMeta title={heading} />
      <h1 className="sr-only">{heading}</h1>
      <FeaturedCarousel />
      <CatalogProvider>
        <CatalogToolbar />
        <ActiveFilters count={fonts.length} />
        <CatalogResults>
          <FontGrid fonts={fonts} empty={<EmptyResults />} renderCard={(f) => <CatalogCard font={f} />} />
        </CatalogResults>
      </CatalogProvider>
      <CtaSection />
    </Container>
  );
}
