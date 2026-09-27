import Link from 'next/link';

import { Reveal } from '@/components/shared/reveal';

/** «تبحث عن خط خاص؟» — دعوة ثابتة أسفل صفحات المكتبة */
export function CtaSection() {
  return (
    <Reveal
      as="section"
      aria-labelledby="cta-title"
      className="mt-30 flex flex-col items-center gap-4 rounded-xl bg-callout px-6 py-[clamp(48px,7vw,96px)] text-center"
    >
      <h2 id="cta-title" className="text-display font-semibold tracking-tight">
        تبحث عن خط خاص؟
      </h2>
      <p className="max-w-[44ch] text-sm leading-[1.8] text-muted-foreground">
        احجز جلسة سريعة مع فريقنا، نساعدك تختار الخط الأنسب لمشروعك أو نخصص لك خط يعكس هويتك بشكل أوضح وأميز.
      </p>
      <Link
        href="#"
        className="group mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-ink ps-4 pe-6 text-sm font-medium text-ink-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[.97]"
      >
        <span aria-hidden className="flex">
          <i
            className="grid size-6 place-items-center rounded-full bg-harf-500 text-3xs font-semibold text-white not-italic ring-2 ring-ink"
            dir="ltr"
          >
            AJ
          </i>
          <i
            className="-ms-1.5 grid size-6 place-items-center rounded-full bg-ai-500 text-3xs font-semibold text-white not-italic ring-2 ring-ink transition-[margin] duration-200 group-hover:-ms-0.5"
            dir="ltr"
          >
            KM
          </i>
        </span>
        تحدث مع فريقنا
      </Link>
    </Reveal>
  );
}
