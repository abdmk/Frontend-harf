import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { ArrowLeftIcon, ChevronDownIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
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

export function ReverseTextPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="عكس النص"
        description="حوّل النص العربي ليظهر متّصلاً وصحيح الاتجاه في After Effects وPhotoshop وUnity والبرامج التي لا تدعم العربية."
      />
      <header className="mb-8 max-w-[62ch]">
        <h1 className="text-2xl font-semibold sm:text-3xl">عكس النص</h1>
        <p className="mt-2 text-control leading-relaxed text-muted-foreground">
          برامج كثيرة تعرض العربية حروفاً منفصلة ومقلوبة. اكتب نصّك، وشاهده قبل المعالجة وبعدها، ثم انسخه جاهزاً للّصق —
          في متصفّحك، ولا يُرسل نصّك إلى أي مكان.
        </p>
      </header>

      <ReverseWorkspace />

      <section aria-labelledby="how-title" className="mt-16 sm:mt-20">
        <h2 id="how-title" className="mb-6 text-xl font-semibold sm:text-2xl">
          ماذا يحدث لنصّك؟
        </h2>
        <HowCards />
      </section>

      <section
        aria-labelledby="faq-title"
        className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]"
      >
        <div>
          <h2 id="faq-title" className="text-xl font-semibold sm:text-2xl">
            إن لم تظهر كما تتوقّع
          </h2>
          <p className="mt-2 text-meta leading-relaxed text-muted-foreground">
            أكثر ما يواجهه المصمّمون بعد اللصق، وحلّه.
          </p>
          <Link
            to={paths.home.getHref()}
            className="group mt-5 inline-flex items-center gap-1.5 text-control font-medium text-primary"
          >
            تصفّح الخطوط العربية المجانية
            <ArrowLeftIcon className="size-4 transition-transform duration-(--dur-base) ease-out-quint group-hover:-translate-x-1" />
          </Link>
        </div>
        <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
          {FAQ.map(([q, a]) => (
            <li key={q}>
              <CollapsiblePrimitive.Root>
                <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-control font-medium transition-colors hover:bg-sunken/60">
                  {q}
                  <ChevronDownIcon className="size-4 shrink-0 text-tertiary transition-transform duration-(--dur-base) ease-out-quint group-data-[state=open]:rotate-180" />
                </CollapsiblePrimitive.Trigger>
                <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <p className="px-5 pb-4 text-meta leading-relaxed text-muted-foreground">{a}</p>
                </CollapsiblePrimitive.Content>
              </CollapsiblePrimitive.Root>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
