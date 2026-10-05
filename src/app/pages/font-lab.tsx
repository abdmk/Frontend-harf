import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { ShieldCheckIcon, SlidersIcon } from '@/components/ui/icons';
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
            icon={<SlidersIcon />}
            name="مختبر الخط"
            title="اكتشف خطّك"
            highlight="قبل أن تستخدمه"
            lead="ارفع ملف الخط واختبر أوزانه، الحروف، التشكيل وميزات OpenType في مكان واحد."
            noteIcon={<ShieldCheckIcon />}
            note="اختبر الملف محلياً — دون رفعه إلى خوادمنا"
          />
        }
      />
    </Container>
  );
}
