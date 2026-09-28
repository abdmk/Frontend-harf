import { Container } from '@/components/layout/container';
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
      <header className="mb-8 max-w-[62ch]">
        <h1 className="text-2xl font-semibold sm:text-3xl">مختبر الخط</h1>
        <p className="mt-2 text-control leading-relaxed text-muted-foreground">
          افحص خطّك قبل أن تستخدمه: ارفع ملفاً أو عائلة كاملة، واختبر اللغات والحروف والتشكيل وميزات OpenType والمحاور
          المتغيّرة. كل المعالجة داخل متصفّحك — لا تُرفع ملفاتك إلى أي خادم.
        </p>
      </header>
      <FontLab />
    </Container>
  );
}
