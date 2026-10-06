import { useParams } from 'react-router';

import { CatalogCard } from '@/app/_components/catalog-card';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/shared/empty-state';
import { FontGrid } from '@/components/shared/font-grid';
import { PageMeta } from '@/components/shared/page-meta';
import { SectionHeading } from '@/components/shared/section-heading';
import { LayersIcon } from '@/components/ui/icons';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { getDesigner } from '@/features/studio/api/get-studio';
import { DesignerProfileHeader } from '@/features/studio/components/designer-profile';

import { NotFoundPage } from './not-found';

export function DesignerPage() {
  const { id } = useParams<{ id: string }>();
  const data = getDesigner(id!);
  if (!data) return <NotFoundPage inLayout />;
  const fonts = getFonts(DEFAULT_QUERY).filter((f) => f.designers.some((d) => d.id === data.designer.id));
  const weights = fonts.reduce((sum, f) => sum + f.weights, 0);

  return (
    <Container as="main" id="main" className="py-8 sm:py-12">
      <PageMeta title={data.designer.nameAr} description={data.designer.bio} />
      <DesignerProfileHeader designer={data.designer} foundry={data.foundry} stats={{ fonts: fonts.length, weights }} />
      <section aria-labelledby="df-title" className="mt-12">
        <SectionHeading
          id="df-title"
          title={
            <>
              خطوط المصمّم{' '}
              <span dir="ltr" className="font-normal text-tertiary">
                ({fonts.length})
              </span>
            </>
          }
          description="كل خط شارك في تصميمه، منفرداً أو مع آخرين."
        />
        <FontGrid
          fonts={fonts}
          renderCard={(f) => <CatalogCard font={f} />}
          empty={
            <EmptyState
              icon={<LayersIcon />}
              title="لا خطوط منشورة بعد"
              description="تابع المصمّم ليصلك إشعار حين ينشر أول خط."
            />
          }
        />
      </section>
    </Container>
  );
}
