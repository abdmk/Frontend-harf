import { Collapsible as CollapsiblePrimitive } from 'radix-ui';

import { ContentPage, ContentSection } from '@/components/layout/content-page';
import { LegalDocument } from '@/components/layout/legal-document';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, MailIcon } from '@/components/ui/icons';
import { CONTACT_EMAIL, FAQ } from '@/config/faq';
import { parseLegal } from '@/content/legal/parse';
import privacyText from '@/content/legal/privacy.txt?raw';
import termsText from '@/content/legal/terms.txt?raw';
import { openConsentSettings } from '@/lib/consent';

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
const TERMS = parseLegal(termsText);
const PRIVACY = parseLegal(privacyText);
const LEGAL_UPDATED = '2026-09-30';

export function TermsPage() {
  return (
    <LegalDocument
      title="الشروط والأحكام"
      description="القواعد التي تنظّم استخدامك لمنصة حرف وخطوطها وتراخيصها ومنتجاتها الرقمية."
      updated={LEGAL_UPDATED}
      doc={TERMS}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalDocument
      title="سياسة الخصوصية"
      description="كيف تجمع حرف بياناتك الشخصية وتستخدمها وتحميها وتشاركها."
      updated={LEGAL_UPDATED}
      doc={PRIVACY}
      extras={{
        'ملفات تعريف الارتباط': (
          <Button variant="outline" onClick={openConsentSettings}>
            إعدادات ملفات تعريف الارتباط
          </Button>
        ),
      }}
    />
  );
}
