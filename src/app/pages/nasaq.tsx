import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { NasaqTool } from '@/features/pairing/components/nasaq-tool';

/** «نسق» — تُحمَّل كسولاً: الكتالوج والمحرّك وملفات الخطوط لا تثقل باقي الموقع */
export function NasaqPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="نسق — تركيبات خطوط متناسقة"
        description="اختر ما تصمّمه، ونقترح عليك خطوطاً عربية تعمل معاً — معروضة بخطوطها الحقيقية."
      />
      <header className="mb-8 max-w-[62ch]">
        <h1 className="text-2xl font-semibold sm:text-3xl">نسق</h1>
        <p className="mt-2 text-control leading-relaxed text-muted-foreground">
          قل لنا ما تصمّمه، ونقترح عليك خطوطاً عربية تعمل معاً: عنواناً بشخصية، ومتناً مريحاً، وتناسقاً محسوباً بينهما —
          معروضة بالخط الحقيقي لا بوصفه.
        </p>
      </header>
      <NasaqTool />
    </Container>
  );
}
