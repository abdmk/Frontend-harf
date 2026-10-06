import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { CheckIcon, LayersIcon } from '@/components/ui/icons';
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
        title="خطوط عربية"
        highlight="تنسجم معاً في تصميمك"
        lead="اكتب نصّك واختر خطاً، و«نسق» يقترح ما يناسبه للعناوين والنصوص."
        noteIcon={<CheckIcon />}
        note="كل الاقتراحات من مكتبة حرف — بخطوطها الحقيقية"
      />
      <NasaqTool />
    </Container>
  );
}
