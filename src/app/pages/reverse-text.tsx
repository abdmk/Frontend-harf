import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { ReverseTextTool } from '@/features/text-tools/components/reverse-text-tool';

const STEPS = [
  ['اكتب النص', 'اكتب النص العربي أو الصقه في الخانة اليمنى كما تكتبه عادةً.'],
  ['انسخ النتيجة', 'تتحوّل الحروف إلى أشكالها المتّصلة وينعكس الاتجاه فوراً — اضغط «نسخ النتيجة».'],
  ['الصق في برنامجك', 'الصقها في البرنامج الذي يقطّع العربية أو يقلبها، فتظهر صحيحة.'],
] as const;

const APPS = [
  'After Effects',
  'Premiere Pro',
  'Illustrator وPhotoshop بلا دعم الشرق الأوسط',
  'Unity وUnreal',
  'Blender',
  'برامج التصميم ثلاثي الأبعاد',
];

export function ReverseTextPage() {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta
        title="عكس النص"
        description="حوّل النص العربي ليظهر متّصلاً وصحيح الاتجاه في البرامج التي لا تدعم العربية."
      />
      <header className="mb-8 max-w-[60ch]">
        <h1 className="text-2xl font-semibold sm:text-3xl">عكس النص</h1>
        <p className="mt-2 text-control leading-relaxed text-muted-foreground">
          بعض البرامج تعرض العربية حروفاً منفصلة ومقلوبة. الصق نصّك هنا لتحصل على نسخة متّصلة الحروف وبالاتجاه الصحيح،
          جاهزة للّصق. يعمل كله في متصفّحك، ولا يُرسل نصّك إلى أي مكان.
        </p>
      </header>

      <ReverseTextTool />

      <section aria-labelledby="how-title" className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <h2 id="how-title" className="text-lg font-semibold">
            كيف تستخدمها
          </h2>
          <ol className="mt-5 flex flex-col gap-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span
                  dir="ltr"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-sunken text-caption font-semibold"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-control font-semibold">{title}</p>
                  <p className="mt-0.5 text-meta leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-lg font-semibold">متى تحتاجها</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {APPS.map((a) => (
              <li key={a} className="rounded-full border px-3 py-1.5 text-caption text-muted-foreground">
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-md bg-sunken px-4 py-3 text-meta leading-relaxed text-muted-foreground">
            إن ظهرت مربّعات بدل الحروف في برنامجك، فالخط المستخدم هناك لا يحوي «أشكال العرض» العربية — جرّب خطاً عربياً
            آخر.
          </p>
        </div>
      </section>
    </Container>
  );
}
