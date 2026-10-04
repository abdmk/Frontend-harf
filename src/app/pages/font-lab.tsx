import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { ShieldCheckIcon, SlidersIcon } from '@/components/ui/icons';
import { FontLab } from '@/features/font-lab/components/font-lab';

/**
 * «مختبر الخط» — يُحمَّل كسولاً: قارئ الملفات (fontkit) لا يثقل باقي الموقع.
 * layout="b": نسخة تجريبية بتوزيع آخر للأدوات نفسها (/tools/font-lab-b) — للمقارنة قبل اعتماد إحداهما.
 */
export function FontLabPage({ layout = 'a' }: { layout?: 'a' | 'b' }) {
  return (
    <Container as="main" id="main">
      <PageMeta
        title="مختبر الخط"
        noindex={layout === 'b'}
        description="افحص خطّك قبل أن تستخدمه: اللغات، ميزات OpenType، أشكال الحروف، التشكيل والمحارف — في متصفّحك."
      />
      <FontLab
        layout={layout}
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
