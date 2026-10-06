import { Link } from 'react-router';

import { Reveal } from '@/components/shared/reveal';
import { useSiteContent } from '@/stores/site-content';

/** «تبحث عن خط خاص؟» — دعوة أسفل صفحات المكتبة */
export function CtaSection() {
  // النصوص من لوحة الإدارة («المحتوى»)
  const { cta } = useSiteContent();
  return (
    <Reveal
      as="section"
      aria-labelledby="cta-title"
      className="mt-30 flex flex-col items-center gap-4 rounded-xl border border-(--grad-dawn-edge) px-6 py-[clamp(48px,7vw,96px)] text-center [background:var(--grad-grain),var(--grad-streaks),var(--grad-dawn-wide)]"
    >
      <h2 id="cta-title" className="text-display font-semibold tracking-tight">
        {cta.title}
      </h2>
      <p className="max-w-[44ch] text-sm leading-[1.8] text-muted-foreground">{cta.lead}</p>
      <Link
        to="/services"
        className="group mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-ink ps-4 pe-6 text-sm font-medium text-ink-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[.97]"
      >
        <span aria-hidden className="flex">
          <i
            className="grid size-6 place-items-center rounded-full bg-harf-600 text-3xs font-semibold text-white not-italic ring-2 ring-ink"
            dir="ltr"
          >
            AJ
          </i>
          <i
            className="-ms-1.5 grid size-6 place-items-center rounded-full bg-ai-500 text-3xs font-semibold text-white not-italic ring-2 ring-ink transition-[margin] duration-(--dur-base) group-hover:-ms-0.5"
            dir="ltr"
          >
            KM
          </i>
        </span>
        {cta.button}
      </Link>
    </Reveal>
  );
}
