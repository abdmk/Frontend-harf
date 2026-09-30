import { Container } from '@/components/layout/container';
import { PageIntro } from '@/components/layout/page-intro';
import { PageMeta } from '@/components/shared/page-meta';
import { ManuscriptsBrowser } from '@/features/manuscripts/components/manuscripts-browser';

export function ManuscriptsPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="مخطوطات"
        description="لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك."
      />
      <PageIntro
        eyebrow="مكتبة حرف"
        title="مخطوطات"
        lead="لوحات وأعمال خطّية عربية بصيغة SVG متجهة — تصفّحها، كبّرها، وحمّلها لتصاميمك."
        aside={
          <p className="rounded-full bg-sunken px-3 py-1.5 text-caption text-muted-foreground">
            نماذج تجريبية مكتوبة بخطوط المكتبة المجانية
          </p>
        }
      />
      <ManuscriptsBrowser />
    </Container>
  );
}
