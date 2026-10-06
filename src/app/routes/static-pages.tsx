import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { type ReactNode, useState } from 'react';
import { Link } from 'react-router';

import privacyText from '@/assets/legal/privacy.txt?raw';
import termsText from '@/assets/legal/terms.txt?raw';
import { ContactBox, ContentPage, ContentSection } from '@/components/layout/content-page';
import { LegalDocument } from '@/components/layout/legal-document';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CloudUploadIcon,
  CrownIcon,
  LayersIcon,
  LockIcon,
  MagicWandIcon,
  MailIcon,
  PencilIcon,
  ReceiptIcon,
  SearchIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { CONTACT_EMAIL, FAQ, FAQ_TOPICS } from '@/config/faq';
import { paths } from '@/config/paths';
import { getFonts } from '@/features/catalog/api/get-fonts';
import { DEFAULT_QUERY } from '@/features/catalog/types/catalog-query';
import { openConsentSettings } from '@/stores/consent';
import { LANGS } from '@/types/domain/font';
import { parseLegal } from '@/utils/legal';

function ContactButton({ label = CONTACT_EMAIL }: { label?: string }) {
  return (
    <Button asChild variant={label === CONTACT_EMAIL ? 'outline' : 'primary'} className="w-fit">
      <a href={`mailto:${CONTACT_EMAIL}`}>
        <MailIcon />
        <span dir={label === CONTACT_EMAIL ? 'ltr' : undefined}>{label}</span>
      </a>
    </Button>
  );
}

/** بطاقة: أيقونة، عنوان، نصّ، ورابط اختياري */
function InfoCard({
  Icon,
  title,
  children,
  to,
  cta,
}: {
  Icon: (p: { className?: string }) => React.JSX.Element;
  title: string;
  children: ReactNode;
  to?: string;
  cta?: string;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <span className="grid size-10 place-items-center rounded-full bg-sunken text-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="flex-1 text-meta leading-relaxed">{children}</p>
      {to && cta && (
        <Link
          to={to}
          className="inline-flex w-fit items-center gap-1 text-meta font-medium !text-primary !no-underline hover:!underline"
        >
          {cta}
          <ArrowLeftIcon className="size-3.5" />
        </Link>
      )}
    </li>
  );
}

export function AboutPage() {
  const fonts = getFonts(DEFAULT_QUERY);
  const designers = new Set(fonts.flatMap((f) => f.designers.map((d) => d.id))).size;
  const stats = [
    [fonts.length, 'خطاً في المكتبة'],
    [designers, 'مصمّماً ومسبكاً'],
    [LANGS.length, 'لغات مدعومة'],
  ] as const;
  return (
    <ContentPage
      wide
      title="عن حرف"
      lead="حرف منصة متخصصة في عرض وبيع وترخيص الخطوط العربية ومتعددة اللغات، وسوق يجمع مصممي الخطوط بالمصممين والعلامات التجارية."
    >
      <dl className="grid grid-cols-3 rounded-xl border bg-card py-6 text-center [&>*+*]:border-s">
        {stats.map(([n, label]) => (
          <div key={label} className="flex flex-col-reverse gap-1 px-2">
            <dt className="text-meta text-muted-foreground">{label}</dt>
            <dd dir="ltr" className="text-3xl font-bold tabular-nums">
              {n}
            </dd>
          </div>
        ))}
      </dl>

      <ContentSection title="ما نقدّمه">
        <ul className="grid gap-4 sm:grid-cols-3">
          <InfoCard Icon={LayersIcon} title="مكتبة بتراخيص واضحة" to={paths.home.getHref()} cta="تصفّح الخطوط">
            خطوط مجانية ومدفوعة، ولكل خط ترخيص مكتوب يوضّح ما تستطيع فعله به قبل أن تحمّله أو تشتريه.
          </InfoCard>
          <InfoCard
            Icon={UserIcon}
            title="مساحة للمصمّمين والمسابك"
            to={paths.account.getHref('subscription')}
            cta="انضمّ كاستوديو"
          >
            صفحات تعرض أعمالهم وتربطهم بجمهورهم، ونشر وبيع ومتابعة للأرباح من مكان واحد.
          </InfoCard>
          <InfoCard Icon={MagicWandIcon} title="أدوات للحرف العربي" to="/tools/nasaq" cta="جرّب «نسق»">
            «نسق» لتركيبات الخطوط، و«عين» لمطابقة الخطوط، و«مختبر الخط»، و«عكس النص» للبرامج التي لا تدعم العربية.
          </InfoCard>
        </ul>
      </ContentSection>

      <ContentSection title="حقوق المصمّمين">
        <p>
          جميع الحقوق المتعلقة بالخطوط والأعمال المعروضة على «حرف» محفوظة لمصمميها وأصحاب الحقوق المعنيين. شراء الخط لا
          يعني انتقال حقوق الملكية الفكرية، وإنما يمنح حق استخدامه وفق نطاق الترخيص المحدد لكل منتج —{' '}
          <Link to="/terms">الشروط والأحكام</Link>.
        </p>
      </ContentSection>

      <ContactBox title="تواصل معنا" action={<ContactButton />}>
        لأي سؤال عن المنصة أو التراخيص أو الشراكات.
      </ContactBox>
    </ContentPage>
  );
}

export function ServicesPage() {
  const services = [
    {
      Icon: SearchIcon,
      title: 'استشارة اختيار الخط',
      text: 'جلسة قصيرة نفهم فيها مشروعك وجمهوره، ونقترح خطوطاً من المكتبة تناسبه مع التراخيص المطلوبة.',
      items: ['مراجعة الهوية أو المشروع', 'اقتراح خطوط وتركيبات', 'الترخيص المناسب لكل استخدام'],
    },
    {
      Icon: PencilIcon,
      title: 'خط مخصّص للعلامات',
      text: 'تصميم خط عربي أو متعدد اللغات خاص بعلامتك، بالتعاون مع مصمّمين من المنصة، مع ترخيص يناسب استخدامك.',
      items: ['خط عربي أو متعدد اللغات', 'أوزان حسب الحاجة', 'ترخيص حصري أو واسع'],
    },
  ];
  const steps = [
    ['راسلنا', 'بنبذة عن مشروعك وموعدك المناسب.'],
    ['نتّفق', 'على النطاق والمدّة والتكلفة قبل البدء.'],
    ['نسلّم', 'الخطوط أو الاقتراحات مع ملفات الترخيص.'],
  ] as const;
  return (
    <ContentPage wide title="الخدمات" lead="نساعدك تختار الخط الأنسب لمشروعك، أو نصمّم لك خطاً خاصاً يعكس هويتك.">
      <ul className="grid gap-4 sm:grid-cols-2">
        {services.map((sv) => (
          <li key={sv.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
            <span className="grid size-10 place-items-center rounded-full bg-sunken">
              <sv.Icon className="size-5" />
            </span>
            <h2 className="text-lg font-bold">{sv.title}</h2>
            <p className="text-meta leading-relaxed text-muted-foreground">{sv.text}</p>
            <ul className="mt-1 flex flex-col gap-2 border-t pt-4">
              {sv.items.map((it) => (
                <li key={it} className="flex items-center gap-2 text-meta">
                  <CheckIcon className="size-4 shrink-0 text-ok-text" />
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <ContentSection title="كيف نعمل">
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-meta font-semibold text-background tabular-nums">
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold text-foreground">{t}</span>
                <span className="text-meta">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </ContentSection>

      <ContactBox title="احجز جلسة" action={<ContactButton label="راسل فريق حرف" />}>
        نردّ عادةً خلال يوم عمل.
      </ContactBox>
    </ContentPage>
  );
}

export function HelpPage() {
  const [q, setQ] = useState('');
  const t = q.trim();
  const hits = FAQ.filter(([qq, a]) => !t || qq.includes(t) || a.includes(t));
  const links = [
    [ReceiptIcon, 'مشترياتي', 'الملفات والإيصالات والتراخيص', paths.account.getHref('purchases')],
    [CrownIcon, 'الاشتراك', 'تغيير الخطة أو إلغاؤها', paths.account.getHref('subscription')],
    [CloudUploadIcon, 'نشر خط', 'من مساحة الاستوديو', paths.studio.getHref('publish')],
    [LockIcon, 'الخصوصية', 'بياناتك وحقوقك', '/privacy'],
  ] as const;
  return (
    <ContentPage title="المساعدة" lead="إجابات سريعة لأكثر الأسئلة تكراراً، وطريق مباشر للتواصل معنا.">
      <ul className="-mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {links.map(([Icon, title, sub, to]) => (
          <li key={title}>
            <Link
              to={to}
              className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:border-strong"
            >
              <Icon className="size-5" />
              <span className="font-semibold">{title}</span>
              <span className="text-caption text-muted-foreground">{sub}</span>
            </Link>
          </li>
        ))}
      </ul>

      <ContentSection title="أسئلة شائعة">
        <label htmlFor="faq-q" className="sr-only">
          ابحث في الأسئلة
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-tertiary" />
          <Input
            id="faq-q"
            type="search"
            value={q}
            maxLength={60}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في الأسئلة… مثل: استرجاع، ترخيص"
            className="h-11 ps-11"
          />
        </div>
        {hits.length ? (
          FAQ_TOPICS.filter((topic) => hits.some((h) => h[2] === topic)).map((topic) => (
            <div key={topic} className="flex flex-col gap-2">
              <h3 className="mt-3 text-meta font-semibold text-foreground">{topic}</h3>
              <ul className="divide-y rounded-xl border bg-card">
                {hits
                  .filter((h) => h[2] === topic)
                  .map(([qq, a]) => (
                    <li key={qq}>
                      <CollapsiblePrimitive.Root>
                        <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-control font-medium text-foreground hover:bg-sunken">
                          {qq}
                          <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
                        </CollapsiblePrimitive.Trigger>
                        <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <p className="px-5 pb-4 text-meta">{a}</p>
                        </CollapsiblePrimitive.Content>
                      </CollapsiblePrimitive.Root>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        ) : (
          <p role="status" className="rounded-xl bg-sunken px-5 py-8 text-center text-meta">
            لا أسئلة تطابق «{t}» — راسلنا وسنجيبك.
          </p>
        )}
      </ContentSection>

      <ContactBox title="لم تجد إجابتك؟" action={<ContactButton />}>
        نردّ عادةً خلال يوم عمل. إن كان سؤالك عن طلب، اذكر رقم الإيصال.
      </ContactBox>
    </ContentPage>
  );
}

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
