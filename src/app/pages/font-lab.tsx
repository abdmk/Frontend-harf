import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { ShieldCheckIcon } from '@/components/ui/icons';
import { FontLab } from '@/features/font-lab/components/font-lab';

/** «مختبر الخط» — يُحمَّل كسولاً: قارئ الملفات (fontkit) لا يثقل باقي الموقع */
export function FontLabPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="مختبر الخط"
        description="افحص خطّك قبل أن تستخدمه: اللغات، ميزات OpenType، أشكال الحروف، التشكيل والمحارف — في متصفّحك."
      />
      <ToolHero
        badgeIcon={<ShieldCheckIcon />}
        badge="في متصفّحك — لا تُرفع ملفاتك إلى أي خادم"
        title="مختبر الخط"
        highlight="افحص خطّك قبل أن تستخدمه"
        lead="ارفع ملفاً أو عائلة كاملة، واختبر اللغات والحروف والتشكيل وميزات OpenType والمحاور المتغيّرة."
      />
      <FontLab />
    </Container>
  );
}
