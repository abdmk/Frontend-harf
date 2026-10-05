import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { CloudUploadIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { BannerQuickEdit } from '@/features/admin/components/banner-quick-edit';
import { FeaturedCarousel } from '@/features/catalog/components/featured-carousel';
import { ManuscriptsBrowser } from '@/features/manuscripts/components/manuscripts-browser';
import { useCurrentUser } from '@/hooks/use-current-user';

const LEAD = 'لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك.';

/** بترتيب صفحة الخطوط نفسه وبنرها نفسه: الشريحة المميّزة، ثم شريط الأدوات، ثم سطر النتائج، ثم الأعمال */
export function ManuscriptsPage() {
  const user = useCurrentUser();
  return (
    <Container as="main" id="main" className="pt-6 pb-16 sm:pt-12 sm:pb-20">
      <PageMeta title="مخطوطات" description={LEAD} />
      <h1 className="sr-only">مخطوطات</h1>
      <FeaturedCarousel />
      <BannerQuickEdit />
      {/* للاستوديو: طريق مباشر لرفع عمل — وللزوّار لا شيء يزاحم التصفّح */}
      {user?.plan === 'studio' && (
        <div className="mt-6 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link to={paths.studio.getHref('manuscripts/new')}>
              <CloudUploadIcon />
              ارفع مخطوطة
            </Link>
          </Button>
        </div>
      )}
      <ManuscriptsBrowser className="mt-10" />
    </Container>
  );
}
