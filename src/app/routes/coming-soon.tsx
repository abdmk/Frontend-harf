import { useState } from 'react';
import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckIcon, ClockIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { COMING_SOON, type ComingSoonKey } from '@/config/coming-soon';
import { paths } from '@/config/paths';

const KEY = (k: string) => `harf-notify-${k}`;
const read = (k: string) => {
  try {
    return localStorage.getItem(KEY(k)) === '1';
  } catch {
    return false;
  }
};

/** صفحة «قريباً»: ما ستقدّمه الأداة، و«نبّهني عند الإطلاق» (محفوظ في المتصفّح في وضع العرض) */
export function ComingSoonPage({ page }: { page: ComingSoonKey }) {
  const p = COMING_SOON[page];
  const [on, setOn] = useState(() => read(page));

  function toggle() {
    const next = !on;
    setOn(next);
    try {
      if (next) localStorage.setItem(KEY(page), '1');
      else localStorage.removeItem(KEY(page));
    } catch {
      /* التخزين غير متاح — يبقى الاختيار لهذه الزيارة */
    }
    if (next) toast({ tone: 'success', title: 'سننبّهك عند الإطلاق', description: p.title });
  }

  return (
    <Container as="main" id="main" className="grid min-h-[60dvh] place-items-center py-16">
      <PageMeta title={p.title} description={p.lead} />
      <div className="flex max-w-lg flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-3 py-1 text-caption text-muted-foreground">
          <ClockIcon className="size-3.5" />
          قريباً
        </span>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">{p.title}</h1>
        <p className="mt-3 text-lead leading-relaxed text-muted-foreground">{p.lead}</p>
        {p.points.length > 0 && (
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {p.points.map((x) => (
              <li
                key={x}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption text-muted-foreground"
              >
                <CheckIcon className="size-3.5 text-ok-text" />
                {x}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" variant={on ? 'secondary' : 'primary'} aria-pressed={on} onClick={toggle}>
            {on ? <CheckIcon className="animate-pop-in" /> : <BellIcon />}
            {on ? 'سننبّهك عند الإطلاق' : 'نبّهني عند الإطلاق'}
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={paths.home.getHref()}>تصفّح الخطوط</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
