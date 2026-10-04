import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { LayersIcon } from '@/components/ui/icons';
import { NasaqTool } from '@/features/pairing/components/nasaq-tool';

/** «نسق» — تُحمَّل كسولاً: الكتالوج والمحرّك وملفات الخطوط لا تثقل باقي الموقع */
export function NasaqPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="نسق — تركيبات خطوط متناسقة"
        description="اختر ما تصمّمه، ونقترح عليك خطوطاً عربية تعمل معاً — معروضة بخطوطها الحقيقية."
      />
      <ToolHero
        icon={<LayersIcon />}
        name="نسق"
        title="اعثر على خطوط"
        highlight="تنسجم معاً"
        lead="اكتب نصّك، واختر خطاً، ودع «نسق» يقترح تركيبات متوازنة للعناوين والنصوص من مكتبة حرف."
      />
      <NasaqTool />
    </Container>
  );
}
