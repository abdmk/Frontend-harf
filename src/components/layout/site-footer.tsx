import { Link } from 'react-router';

import applePayDark from '@/assets/payments/apple-pay-dark.svg';
import applePay from '@/assets/payments/apple-pay.svg';
import googlePayDark from '@/assets/payments/google-pay-dark.svg';
import googlePay from '@/assets/payments/google-pay.svg';
import mastercard from '@/assets/payments/mastercard.svg';
import stripe from '@/assets/payments/stripe.svg';
import visa from '@/assets/payments/visa.svg';
import { SOCIAL, SocialIcon } from '@/components/shared/social-icons';
import { footerNav } from '@/config/site';

/** شعارات وسائل الدفع كما وردت من ملف الهوية؛ Apple Pay وGoogle Pay لهما نسخة للوضع الداكن، وVisa تُقلب للأبيض */
function PaymentMarks() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2" dir="ltr">
      <img src={stripe} alt="Stripe" width={57} height={23} className="h-5.5 w-auto" />
      <span aria-hidden className="h-4.5 w-px bg-strong" />
      <ul aria-label="وسائل الدفع المقبولة" className="flex items-center gap-4">
        <li>
          <img src={visa} alt="Visa" width={29} height={9} className="h-2.5 w-auto dark:brightness-0 dark:invert" />
        </li>
        <li>
          <img src={mastercard} alt="Mastercard" width={21} height={13} className="h-3.5 w-auto" />
        </li>
        <li>
          <img src={applePay} alt="Apple Pay" width={33} height={14} className="h-3.5 w-auto dark:hidden" />
          <img src={applePayDark} alt="Apple Pay" width={33} height={14} className="hidden h-3.5 w-auto dark:block" />
        </li>
        <li>
          <img src={googlePay} alt="Google Pay" width={36} height={15} className="h-3.5 w-auto dark:hidden" />
          <img src={googlePayDark} alt="Google Pay" width={36} height={15} className="hidden h-3.5 w-auto dark:block" />
        </li>
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="container-page mt-12 pb-8">
      <div className="grid gap-x-16 gap-y-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 text-meta leading-[1.9] text-muted-foreground">
          <p>
            حرف منصة متخصصة في عرض وبيع وترخيص الخطوط العربية ومتعددة اللغات، وتعمل كسوق يجمع مصممي الخطوط بالمصممين
            والعلامات التجارية.
          </p>
          <p>
            جميع الحقوق المتعلقة بالخطوط والأعمال المعروضة على «حرف» محفوظة لمصمميها وأصحاب الحقوق المعنيين. وتُباع
            الخطوط التجارية وتُرخّص عبر المنصة وفق الاتفاقيات والتراخيص المعتمدة مع أصحابها، بما يوضح نطاق الاستخدام
            والحقوق المرتبطة بكل ترخيص.
          </p>
          <p>
            شراء الخط لا يعني انتقال حقوق الملكية الفكرية، وإنما يمنح المستخدم حق استخدامه وفق نطاق وشروط الترخيص المحدد
            لكل منتج، سواء كان الترخيص شخصياً أو تجارياً. وتبقى ملكية الخط وحقوقه الفكرية محفوظة لصاحبها الأصلي، وفق
            الشروط والحقوق المعتمدة لكل خط.
          </p>
        </div>
        <div className="flex flex-col gap-6 text-meta leading-[1.9] text-muted-foreground">
          <div>
            <p className="mb-1 text-left text-meta text-foreground" dir="ltr">
              Powered by
            </p>
            <PaymentMarks />
          </div>
          <p>تتم معالجة المدفوعات بأمان عبر Stripe، دون تخزين بيانات الدفع مباشرة على خوادم حرف.</p>
          {/* المرور: دائرة ناعمة تتّسع من المركز خلف العلامة، والعلامة تكبر قليلاً وتغمق؛ الضغط ينكمش */}
          <div className="-ms-2.5 mt-auto flex justify-start gap-1" dir="ltr">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="group relative grid size-9 place-items-center rounded-full text-muted-foreground transition-[color,scale] duration-(--dur-base) ease-out-quint outline-none before:absolute before:inset-0 before:scale-50 before:rounded-full before:bg-sunken before:opacity-0 before:transition-[scale,opacity] before:duration-(--dur-slow) before:ease-pop hover:text-foreground hover:before:scale-100 hover:before:opacity-100 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:before:scale-100 focus-visible:before:opacity-100 active:scale-90"
              >
                <SocialIcon
                  label={s.label}
                  className="relative size-4.5 transition-[scale] duration-(--dur-slow) ease-pop group-hover:scale-110"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm md:flex-row md:items-center">
        <nav aria-label="روابط حرف" className="flex flex-wrap gap-x-8 gap-y-2">
          {footerNav.map((l) => (
            <Link key={l.label} to={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <span>جميع الحقوق محفوظة لحرف © 2026</span>
      </div>
    </footer>
  );
}
