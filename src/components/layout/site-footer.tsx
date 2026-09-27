import Link from 'next/link';

import { footerNav } from '@/config/site';

const SOCIAL = [
  {
    label: 'LinkedIn',
    d: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1.6 7v8h2.3v-8H5.6zm1.2-3.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM18.4 13.2c0-2.2-1.2-3.4-2.9-3.4-1.1 0-1.8.6-2.1 1.1V10H11v8h2.3v-4.2c0-1.1.5-1.8 1.4-1.8.9 0 1.4.7 1.4 1.8V18h2.3v-4.8z',
  },
  {
    label: 'Instagram',
    d: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 1.8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8a3.2 3.2 0 0 0 3.2-3.2V8A3.2 3.2 0 0 0 16 4.8H8zm4 3.2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4zm5.2-3.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z',
  },
  {
    label: 'Telegram',
    d: 'M21.4 4.1 2.9 11.3c-1 .4-1 1.7 0 2l4.7 1.5 1.8 5.4c.2.7 1.1.9 1.6.4l2.6-2.4 4.7 3.4c.6.4 1.5.1 1.6-.6l3.2-15.7c.2-.9-.6-1.6-1.4-1.2zM9.6 14.4l8-6.6-6.5 7.8-.3 2.9-1.2-4.1z',
  },
  {
    label: 'X',
    d: 'M17.7 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.4L2 3h6.4l4.4 5.8L17.7 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11 14.5z',
  },
];

function PaymentMarks() {
  const mark =
    'grid h-5 min-w-9 place-items-center rounded bg-sunken px-1 font-[system-ui] text-[10px] leading-none font-bold';
  return (
    <div className="flex items-center gap-3" dir="ltr">
      <span className="font-[system-ui] text-[22px] leading-none font-bold tracking-tighter text-[#635BFF]">
        stripe
      </span>
      <span aria-hidden className="h-[18px] w-px bg-strong" />
      <span className={`${mark} text-[#1A1F71] italic dark:text-[#8FA3FF]`}>VISA</span>
      <span className={mark}>
        <svg viewBox="0 0 24 15" className="h-3.5 w-auto" aria-label="Mastercard" role="img">
          <circle cx="8" cy="7.5" r="6.5" fill="#EB001B" />
          <circle cx="16" cy="7.5" r="6.5" fill="#F79E1B" fillOpacity=".9" />
        </svg>
      </span>
      <span className={mark}>Apple Pay</span>
      <span className={mark}>G Pay</span>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-12 w-[min(100%-2rem,1120px)] pb-8 sm:w-[min(100%-3rem,1120px)]">
      <div className="grid gap-x-16 gap-y-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 text-[12.5px] leading-[1.9] text-muted-foreground">
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
        <div className="flex flex-col gap-6 text-[12.5px] leading-[1.9] text-muted-foreground">
          <div>
            <p className="mb-1 text-left text-[12.5px] text-foreground" dir="ltr">
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
                <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
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
