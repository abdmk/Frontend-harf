import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { ShieldCheckIcon } from '@/components/ui/icons';
import { FontLab } from '@/features/font-lab/components/font-lab';

/** «مختبر الخط» — يُحمَّل كسولاً: قارئ الملفات (fontkit) لا يثقل باقي الموقع */
export function FontLabPage() {
  return (
    <Container as="main" id="main">
      <PageMeta
        title="مختبر الخط"
        description="افحص خطّك قبل أن تستخدمه: اللغات، ميزات OpenType، أشكال الحروف، التشكيل والمحارف — في متصفّحك."
      />
      <FontLab
        hero={
          <ToolHero
            badgeIcon={<ShieldCheckIcon />}
            badge="في متصفّحك — لا تُرفع ملفاتك إلى أي خادم"
            title="أفضل أداة لاختبار الخطوط"
            highlight="اختبر خطّك قبل أن تستخدمه"
            lead="ارفع ملف الخط واكتشف كل ما فيه في ثوانٍ: اللغات والحروف والتشكيل وميزات OpenType والمحاور المتغيّرة."
          />
        }
      />
    </Container>
  );
}
