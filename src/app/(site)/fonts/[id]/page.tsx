import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CtaSection } from '@/components/layout/cta-section';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { getFont, getRelatedFonts } from '@/features/font-details/api/get-font';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { FontCard } from '@/components/shared/font-card';
import { FontDetailsTabs } from '@/features/font-details/components/font-details-tabs';
import { FontGallery } from '@/features/font-details/components/font-gallery';
import { FontGrid } from '@/components/shared/font-grid';
import { FontHeader } from '@/features/font-details/components/font-header';
import { FontTester } from '@/features/font-tester/components/font-tester';
import { WeightWaterfall } from '@/features/font-details/components/weight-waterfall';

export async function generateMetadata({ params }: PageProps<'/fonts/[id]'>): Promise<Metadata> {
  const font = await getFont((await params).id);
  if (!font) return { title: 'الخط غير موجود' };
  return {
    title: font.name,
    description: font.description?.[0] ?? `${font.name} — خط عربي في مكتبة حرف.`,
    alternates: { canonical: paths.font.getHref(font.id) },
  };
}

export default async function FontPage({ params }: PageProps<'/fonts/[id]'>) {
  const font = await getFont((await params).id);
  if (!font) notFound();
  const related = await getRelatedFonts(font);

  return (
    <main id="main" className="mx-auto w-[min(100%-2rem,1120px)] sm:w-[min(100%-3rem,1120px)]">
      <nav aria-label="مسار التنقّل" className="mt-8 mb-5">
        <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <Link href={paths.home.getHref()} className="hover:text-foreground">
              الرئيسية
            </Link>
            <ChevronLeftIcon className="size-3.5" />
          </li>
          <li className="flex items-center gap-2">
            <Link href={paths.home.getHref()} className="hover:text-foreground">
              خطوط مجانية
            </Link>
            <ChevronLeftIcon className="size-3.5" />
          </li>
          <li aria-current="page" dir="ltr" className="font-medium text-foreground">
            {font.name}
          </li>
        </ol>
      </nav>

      <FontGallery fontName={font.name} />
      <FontHeader font={font} favorite={<FavoriteButton fontId={font.id} fontName={font.name} variant="square" />} />
      <FontTester />
      <WeightWaterfall />
      <FontDetailsTabs font={font} />

      <section aria-labelledby="related-title" className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="related-title" className="text-sm font-medium text-muted-foreground">
            خطوط مشابهة قد تعجبك
          </h2>
          <Link href={paths.home.getHref()} className="group inline-flex items-center gap-1 text-[12.5px] text-primary">
            عرض جميع الخطوط
            <ChevronLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>
        <FontGrid
          fonts={related}
          renderCard={(f) => <FontCard font={f} favorite={<FavoriteButton fontId={f.id} fontName={f.name} />} />}
        />
      </section>
      <CtaSection />
    </main>
  );
}
