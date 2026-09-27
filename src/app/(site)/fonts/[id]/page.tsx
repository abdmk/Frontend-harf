import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { CtaSection } from '@/components/layout/cta-section';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { FontGrid } from '@/components/shared/font-grid';
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
import { getCurrentUser } from '@/lib/auth';
import { getPricing } from '@/lib/commerce/server';

export async function generateMetadata({ params }: PageProps<'/fonts/[id]'>): Promise<Metadata> {
  const font = await getFont((await params).id);
  if (!font) return { title: 'الخط غير موجود' };
  return {
    title: font.name,
    description: font.description?.[0] ?? `${font.name} — خط عربي في مكتبة حرف.`,
    alternates: { canonical: paths.font.getHref(font.id) },
  };
}

export default async function FontPage({ params, searchParams }: PageProps<'/fonts/[id]'>) {
  const font = await getFont((await params).id);
  if (!font) notFound();
  const [pricing, owned] = await Promise.all([
    getPricing(font.id),
    getCurrentUser().then((u) => getOwnedLicense(u, font.id)),
  ]);
  const openLicense = (await searchParams).license === '1';
  const favorite = <FavoriteButton fontId={font.id} fontName={font.name} variant="square" />;
  const related = await getRelatedFonts(font);

  return (
    <Container as="main" id="main">
      <Breadcrumb
        className="mt-8 mb-5"
        items={[
          { label: 'الرئيسية', href: paths.home.getHref() },
          { label: font.type === 'free' ? 'خطوط مجانية' : 'خطوط مدفوعة', href: paths.home.getHref() },
          { label: font.name, ltr: true },
        ]}
      />

      <FontGallery fontName={font.name} />
      <FontHeader
        font={font}
        favorite={favorite}
        actions={
          pricing && font.type !== 'free' ? (
            <PurchaseActions
              font={{ id: font.id, name: font.name, type: font.type }}
              foundry={font.designerLabel ?? font.designers[0]?.nameAr ?? ''}
              pricing={pricing}
              favorite={favorite}
              ownership={owned ? 'owned' : 'none'}
              licenseId={owned?.licenseId}
              defaultOpen={openLicense}
              onSubmit={addToCart}
            />
          ) : undefined
        }
      />
      <FontTester />
      <WeightWaterfall />
      <FontDetailsTabs font={font} />

      <section aria-labelledby="related-title" className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="related-title" className="text-sm font-medium text-muted-foreground">
            خطوط مشابهة قد تعجبك
          </h2>
          <Link href={paths.home.getHref()} className="group inline-flex items-center gap-1 text-meta text-primary">
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
