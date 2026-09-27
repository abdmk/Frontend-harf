import Link from 'next/link';

import { SOCIAL } from '@/components/shared/social-icons';
import { footerNav } from '@/config/site';

function PaymentMarks() {
  const mark =
    'grid h-5 min-w-9 place-items-center rounded bg-sunken px-1 font-[system-ui] text-micro leading-none font-bold';
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <span className="font-[system-ui] text-xl leading-none font-bold tracking-tighter text-stripe">stripe</span>
      <span aria-hidden className="h-4.5 w-px bg-strong" />
      <span className={`${mark} text-visa italic`}>VISA</span>
      <span className={mark}>
        <svg viewBox="0 0 24 15" className="h-3.5 w-auto" aria-label="Mastercard" role="img">
          <circle cx="8" cy="7.5" r="6.5" className="fill-mastercard-red" />
          <circle cx="16" cy="7.5" r="6.5" className="fill-mastercard-orange" fillOpacity=".9" />
        </svg>
      </span>
      <span className={mark}>Apple Pay</span>
      <span className={mark}>G Pay</span>
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
          <div className="mt-auto flex justify-end gap-4">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid size-6 place-items-center rounded-md text-muted-foreground transition-[color,transform] duration-200 ease-pop hover:-translate-y-0.5 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm md:flex-row md:items-center">
        <nav aria-label="روابط حرف" className="flex flex-wrap gap-x-8 gap-y-2">
          {footerNav.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <span>جميع الحقوق محفوظة لحرف © 2026</span>
      </div>
    </footer>
  );
}
