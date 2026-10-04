import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { ChevronDownIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { HowCards } from '@/features/text-tools/components/how-cards';
import { ReverseWorkspace } from '@/features/text-tools/components/reverse-workspace';

const FAQ = [
  [
    'تظهر مربّعات بدل الحروف في برنامجي',
    'الخط المستخدم في البرنامج لا يحوي «أشكال العرض» العربية التي تعتمد عليها النتيجة. اختر خطاً عربياً كاملاً يدعم هذا النطاق.',
  ],
  [
    'النص الطويل ينكسر بترتيب خاطئ',
    'البرنامج يكسر السطر من اليسار، فتنتقل آخر كلمات الجملة إلى السطر الأول. اكسر الأسطر بنفسك هنا (Enter) قبل النسخ، ووسّع صندوق النص في البرنامج.',
  ],
  [
    'الحركات تظهر في غير مكانها',
    'أغلب هذه البرامج لا تضع الحركات فوق حروفها. فعّل «إزالة التشكيل» إن لم تكن الحركات ضرورية للمعنى.',
  ],
  [
    'هل يُرسل نصّي إلى أي مكان؟',
    'لا. التحويل كله يجري في متصفّحك، ولا يُحفظ النص ولا يُرسل إلى أي خادم — حتى بعد إغلاق الصفحة لا يبقى منه شيء.',
  ],
] as const;

/** عنوان قسم موحّد في الصفحة: عنوان + سطر توضيح — نفس الإيقاع لكل الأقسام */
function SectionHead({ id, title, lead }: { id: string; title: string; lead: string }) {
  return (
    <header className="mb-6">
      <h2 id={id} className="text-xl font-semibold sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1.5 text-meta text-muted-foreground">{lead}</p>
    </header>
  );
}

/**
 * «عكس النص»: بداية الأدوات نفسها (ToolHero)، ثم الأداة مباشرة كأبرز عنصر — بطاقة واحدة تجمع الخيارات
 * والنص والنتيجة والنسخ — ثم «كيف يعمل» يشرح ما حدث للتوّ، ثم حلول ما بعد اللصق.
 */
export function ReverseTextPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="عكس النص"
        description="حوّل النص العربي ليظهر متّصلاً وصحيح الاتجاه في After Effects وPhotoshop وUnity والبرامج التي لا تدعم العربية."
      />
      <ToolHero
        badgeIcon={<ShieldCheckIcon />}
        badge="في متصفّحك — لا يُرسل نصّك إلى أي مكان"
        title="عكس النص"
        highlight="عربية متّصلة في أي برنامج"
        lead="برامج مثل After Effects وUnity تعرض العربية حروفاً منفصلة ومقلوبة. اكتب نصّك، وانسخ النتيجة جاهزة للّصق."
      />

      <ReverseWorkspace />

      <section aria-labelledby="how-title" className="mt-14 sm:mt-16">
        <SectionHead id="how-title" title="كيف يعمل" lead="ثلاث خطوات تجري على نصّك لحظة الكتابة." />
        <HowCards />
      </section>

      <section aria-labelledby="faq-title" className="mt-14 sm:mt-16">
        <SectionHead id="faq-title" title="إن لم تظهر كما تتوقّع" lead="أكثر ما يواجهه المصمّمون بعد اللصق، وحلّه." />
        <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
          {FAQ.map(([q, a]) => (
            <li key={q}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-control font-medium transition-colors outline-none select-none hover:bg-sunken/60 focus-visible:bg-sunken/60 [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDownIcon className="size-4 shrink-0 text-tertiary transition-transform duration-(--dur-slow) ease-out-quint group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-4 text-meta leading-relaxed text-muted-foreground">{a}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
