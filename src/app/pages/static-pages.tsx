import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { Link } from 'react-router';

import { ContentPage, ContentSection } from '@/components/layout/content-page';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ExclamationIcon, MailIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL, FAQ } from '@/config/faq';
import { paths } from '@/config/paths';

function ContactButton({ label = CONTACT_EMAIL }: { label?: string }) {
  return (
    <Button asChild variant="outline" className="w-fit">
      <a href={`mailto:${CONTACT_EMAIL}`}>
        <MailIcon />
        {label}
      </a>
    </Button>
  );
}

export function AboutPage() {
  return (
    <ContentPage
      title="عن حرف"
      lead="حرف منصة متخصصة في عرض وبيع وترخيص الخطوط العربية ومتعددة اللغات، وسوق يجمع مصممي الخطوط بالمصممين والعلامات التجارية."
    >
      <ContentSection title="ما نقدّمه">
        <ul>
          <li>مكتبة خطوط مجانية ومدفوعة بتراخيص واضحة لكل خط.</li>
          <li>صفحات للمصمّمين والمسابك تعرض أعمالهم وتربطهم بجمهورهم.</li>
          <li>أدوات تخدم من يعمل بالحرف العربي، مثل «عكس النص».</li>
        </ul>
      </ContentSection>
      <ContentSection title="حقوق المصمّمين">
        <p>
          جميع الحقوق المتعلقة بالخطوط والأعمال المعروضة على «حرف» محفوظة لمصمميها وأصحاب الحقوق المعنيين. شراء الخط لا
          يعني انتقال حقوق الملكية الفكرية، وإنما يمنح حق استخدامه وفق نطاق الترخيص المحدد لكل منتج.
        </p>
      </ContentSection>
      <ContentSection title="تواصل معنا">
        <ContactButton />
      </ContentSection>
    </ContentPage>
  );
}

export function ServicesPage() {
  return (
    <ContentPage title="الخدمات" lead="نساعدك تختار الخط الأنسب لمشروعك، أو نصمّم لك خطاً خاصاً يعكس هويتك.">
      <ContentSection title="استشارة اختيار الخط">
        <p>جلسة قصيرة مع فريقنا نفهم فيها مشروعك وجمهوره، ونقترح خطوطاً من المكتبة تناسبه مع التراخيص المطلوبة.</p>
      </ContentSection>
      <ContentSection title="خط مخصّص للعلامات">
        <p>تصميم خط عربي أو متعدد اللغات خاص بعلامتك، بالتعاون مع مصمّمين من المنصة، مع ترخيص يناسب استخدامك.</p>
      </ContentSection>
      <ContentSection title="احجز جلسة">
        <p>راسلنا بنبذة عن مشروعك وموعدك المناسب، ونردّ عادةً خلال يوم عمل.</p>
        <ContactButton label="راسل فريق حرف" />
      </ContentSection>
    </ContentPage>
  );
}

export function HelpPage() {
  return (
    <ContentPage title="المساعدة" lead="إجابات سريعة لأكثر الأسئلة تكراراً، وطريق مباشر للتواصل معنا.">
      <ContentSection title="أسئلة شائعة">
        <ul className="!ms-0 !list-none !space-y-0 divide-y rounded-xl border bg-card">
          {FAQ.map(([q, a]) => (
            <li key={q} className="!ms-0">
              <CollapsiblePrimitive.Root>
                <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-control font-medium text-foreground hover:bg-sunken">
                  {q}
                  <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
                </CollapsiblePrimitive.Trigger>
                <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <p className="px-5 pb-4 text-meta">{a}</p>
                </CollapsiblePrimitive.Content>
              </CollapsiblePrimitive.Root>
            </li>
          ))}
        </ul>
      </ContentSection>
      <ContentSection title="لم تجد إجابتك؟">
        <p>راسلنا ونردّ عادةً خلال يوم عمل. إن كان سؤالك عن طلب، اذكر رقم الإيصال.</p>
        <ContactButton />
      </ContentSection>
    </ContentPage>
  );
}

/** تنبيه ظاهر أن النص مسودّة — لا يُطلق الموقع قبل مراجعته قانونياً */
function DraftNotice() {
  return (
    <div role="note" className="mb-10 flex gap-3 rounded-lg bg-tint-warn p-4 text-warn-text">
      <ExclamationIcon className="mt-0.5 size-5 shrink-0" />
      <p className="text-meta leading-relaxed">
        <strong className="font-semibold">مسودّة.</strong> هذا النص هيكل مؤقت يوضّح الأقسام المطلوبة، ويجب أن يُكتب
        ويُراجَع مع مختصّ قانوني قبل إطلاق المنصة.
      </p>
    </div>
  );
}

export function TermsPage() {
  return (
    <ContentPage title="الشروط والأحكام" lead="القواعد التي تنظّم استخدامك لمنصة حرف." notice={<DraftNotice />}>
      <ContentSection title="الحساب">
        <p>مسؤوليتك عن صحة بياناتك وسرّية كلمة المرور، وعن النشاط الذي يتمّ من حسابك.</p>
      </ContentSection>
      <ContentSection title="التراخيص والاستخدام">
        <p>
          كل خط يُستخدم وفق ترخيصه المحدد في صفحته. الشراء يمنح حق الاستخدام لا ملكية الخط. تفاصيل نطاقات الاستخدام
          تُرفق مع ملفات كل ترخيص.
        </p>
      </ContentSection>
      <ContentSection title="الدفع والاسترجاع">
        <p>تُعالَج المدفوعات عبر Stripe. سياسة الاسترجاع ومدّتها تُحدَّد هنا.</p>
      </ContentSection>
      <ContentSection title="نشر الخطوط (للمسابك والمصمّمين)">
        <p>إقرار الناشر بملكية الحقوق، ومراجعة الخطوط قبل نشرها، وحصّة المنصة ومواعيد التحويل.</p>
      </ContentSection>
      <ContentSection title="التعديلات والتواصل">
        <p>
          كيف نُبلغك بتغيير هذه الشروط، وطريق التواصل: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </ContentSection>
    </ContentPage>
  );
}

export function PrivacyPage() {
  return (
    <ContentPage title="سياسة الخصوصية" lead="ما البيانات التي نجمعها، ولماذا، وكيف نحميها." notice={<DraftNotice />}>
      <ContentSection title="ما نجمعه">
        <ul>
          <li>بيانات الحساب: الاسم والبريد الإلكتروني وما تضيفه لملفك.</li>
          <li>سجل المشتريات والتراخيص والتحميلات.</li>
          <li>بيانات استخدام تقنية لتحسين المنصة وحمايتها.</li>
        </ul>
      </ContentSection>
      <ContentSection title="الدفع">
        <p>بيانات البطاقات تُعالَج عبر Stripe مباشرة، ولا تُخزَّن على خوادم حرف.</p>
      </ContentSection>
      <ContentSection title="ملفات تعريف الارتباط">
        <p>ما نستخدمه منها (الجلسة، التفضيلات) ولماذا، وكيف تتحكّم بها.</p>
      </ContentSection>
      <ContentSection title="حقوقك">
        <p>
          الاطّلاع على بياناتك وتصحيحها وحذف حسابك من <Link to={paths.account.getHref('security')}>إعدادات الحساب</Link>
          ، أو بمراسلتنا على <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
