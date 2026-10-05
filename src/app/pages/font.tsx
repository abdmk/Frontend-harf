import { Link, useParams, useSearchParams } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { CtaSection } from '@/components/layout/cta-section';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { FontGrid } from '@/components/shared/font-grid';
import { PageMeta } from '@/components/shared/page-meta';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { getOwnedLicense } from '@/features/account/api/queries';
import { addToCart } from '@/features/cart/api/actions';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { getFont, getRelatedFonts } from '@/features/font-details/api/get-font';
import { FontDetailsTabs } from '@/features/font-details/components/font-details-tabs';
import { FontGallery } from '@/features/font-details/components/font-gallery';
import { FontHeader } from '@/features/font-details/components/font-header';
import { WeightWaterfall } from '@/features/font-details/components/weight-waterfall';
import { FontTester } from '@/features/font-tester/components/font-tester';
import { PurchaseActions } from '@/features/licensing/components/purchase-actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getPricing } from '@/lib/commerce/cart-store';

import { NotFoundPage } from './not-found';

export function FontPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const font = getFont(id!);
  const user = useCurrentUser();
  if (!font) return <NotFoundPage inLayout />;

  const pricing = getPricing(font.id);
  const owned = getOwnedLicense(user, font.id);
  const openLicense = searchParams.get('license') === '1';
  const favorite = <FavoriteButton fontId={font.id} fontName={font.name} variant="square" />;
  const related = getRelatedFonts(font);

  return (
    <Container as="main" id="main">
      <PageMeta title={font.name} description={font.description?.[0]} />
      <Breadcrumb
        className="mt-8 mb-5"
        items={[
          { label: 'الرئيسية', href: paths.home.getHref() },
          { label: font.type === 'free' ? 'خطوط مجانية' : 'خطوط مدفوعة', href: paths.home.getHref() },
          { label: font.name, ltr: true },
        ]}
      />

      <FontGallery fontName={font.name} face={font.face} latin={font.langs.includes('la')} />
      <FontHeader
        font={font}
        favorite={favorite}
        actions={
          pricing && font.type !== 'free' ? (
            <PurchaseActions
              font={{ id: font.id, name: font.name, type: font.type }}
              foundry={font.designerLabel ?? font.designers[0]?.nameAr ?? ''}
              pricing={pricing}
              face={font.face}
              favorite={favorite}
              ownership={owned ? 'owned' : 'none'}
              licenseId={owned?.licenseId}
              defaultOpen={openLicense}
              onSubmit={addToCart}
            />
          ) : undefined
        }
      />
      <FontTester face={font.face} />
      <WeightWaterfall variable={font.variable} face={font.face} />
      <FontDetailsTabs font={font} />

      <section aria-labelledby="related-title" className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="related-title" className="text-sm font-medium text-muted-foreground">
            خطوط مشابهة قد تعجبك
          </h2>
          <Link to={paths.home.getHref()} className="group inline-flex items-center gap-1 text-meta text-primary">
            عرض جميع الخطوط
            <ChevronLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>
        <FontGrid fonts={related} renderCard={(f) => <CatalogCard font={f} />} />
      </section>
      <CtaSection />
    </Container>
  );
}
