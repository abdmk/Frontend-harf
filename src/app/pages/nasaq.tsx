import { Container } from '@/components/layout/container';
import { PageIntro } from '@/components/layout/page-intro';
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
      <PageIntro
        eyebrow="أدوات حرف"
        title="نسق"
        lead="اختر ما تصمّمه، ونقترح عليك خطوطاً عربية تعمل معاً — معروضة بخطوطها الحقيقية، وكلها من مكتبة حرف: حمّل المجانية مباشرة، واشترِ ترخيص المدفوعة من السلة."
      />
      <NasaqTool />
    </Container>
  );
}
