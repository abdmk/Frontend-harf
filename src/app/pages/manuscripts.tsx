import { Container } from '@/components/layout/container';
import { PageBanner } from '@/components/shared/banner-slide';
import { PageMeta } from '@/components/shared/page-meta';
import { ManuscriptsBrowser } from '@/features/manuscripts/components/manuscripts-browser';

const LEAD = 'لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك.';

/** بترتيب صفحة الخطوط نفسه: بنر في الأعلى، ثم شريط الأدوات، ثم سطر النتائج، ثم الأعمال */
export function ManuscriptsPage() {
  return (
    <Container as="main" id="main" className="pt-6 pb-16 sm:pt-12 sm:pb-20">
      <PageMeta title="مخطوطات" description={LEAD} />
      <PageBanner title="مخطوطات" lead={LEAD} />
      <ManuscriptsBrowser className="mt-10" />
    </Container>
  );
}
