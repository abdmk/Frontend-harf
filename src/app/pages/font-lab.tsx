import { Container } from '@/components/layout/container';
import { PageIntro } from '@/components/layout/page-intro';
import { PageMeta } from '@/components/shared/page-meta';
import { FontLab } from '@/features/font-lab/components/font-lab';

/** «مختبر الخط» — يُحمَّل كسولاً: قارئ الملفات (fontkit) لا يثقل باقي الموقع */
export function FontLabPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="مختبر الخط"
        description="افحص خطّك قبل أن تستخدمه: اللغات، ميزات OpenType، أشكال الحروف، التشكيل والمحارف — في متصفّحك."
      />
      <PageIntro
        eyebrow="أدوات حرف"
        title="مختبر الخط"
        lead="افحص خطّك قبل أن تستخدمه: ارفع ملفاً أو عائلة كاملة، واختبر اللغات والحروف والتشكيل وميزات OpenType والمحاور المتغيّرة. كل المعالجة داخل متصفّحك — لا تُرفع ملفاتك إلى أي خادم."
      />
      <FontLab />
    </Container>
  );
}
