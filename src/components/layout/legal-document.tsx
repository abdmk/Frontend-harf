import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { Fragment, type ReactNode, useEffect, useMemo, useState } from 'react';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { ChevronDownIcon } from '@/components/ui/icons';
import type { LegalBlock, LegalDoc } from '@/content/legal/parse';
import { cn } from '@/lib/cn';

/** يحوّل عناوين البريد داخل النص إلى روابط mailto — الباقي نصّ عادي */
function withEmails(text: string): ReactNode {
  const parts = text.split(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    i % 2 ? (
      <a key={i} href={`mailto:${p}`} dir="ltr">
        {p}
      </a>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

function Block({ b }: { b: LegalBlock }) {
  if (b.type === 'h') return <h3 className="pt-3 text-control font-semibold text-foreground">{b.text}</h3>;
  if (b.type === 'p') return <p>{withEmails(b.text)}</p>;
  const List = b.type === 'ul' ? 'ul' : 'ol';
  return (
    <List className={cn('flex flex-col gap-2 ps-5', b.type === 'ul' ? 'list-disc' : 'list-decimal')}>
      {b.items.map((it) => (
        <li key={it} className="ps-1 marker:text-foreground">
          {withEmails(it)}
        </li>
      ))}
    </List>
  );
}

/**
 * القسم الحالي — لتمييزه في «في هذه الصفحة»: آخر قسم عبر أعلى الشاشة، وعند نهاية الصفحة آخرها
 * (الأقسام الأخيرة القصيرة لا تبلغ الأعلى أبداً). حساب واحد لكل إطار أثناء التمرير.
 */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | undefined>(ids[0]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) return setActive(ids.at(-1));
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) cur = id;
        else break;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);
  return active;
}

const OVERVIEW = 'overview';
const prose =
  'flex flex-col gap-3 text-control leading-loose text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary';

/**
 * وثيقة قانونية بتخطيط هادئ: عنوان في الوسط مع تاريخ السريان، النص في عمود مقروء، وبجانبه
 * «في هذه الصفحة» يتتبّع القسم الحالي. أقسام يفصلها خطّ رفيع، وقسم التواصل الأخير في صندوق.
 */
export function LegalDocument({
  title,
  description,
  updated,
  doc,
  extras,
}: {
  title: string;
  description: string;
  /** YYYY-MM-DD */
  updated: string;
  doc: LegalDoc;
  /** عناصر تفاعلية تُلحق بقسم باسم عنوانه (مثل زرّ إعدادات ملفات تعريف الارتباط) */
  extras?: Record<string, ReactNode>;
}) {
  const ids = useMemo(() => [OVERVIEW, ...doc.sections.map((s) => s.id)], [doc]);
  const active = useActiveSection(ids);
  const date = new Date(`${updated}T00:00:00`).toLocaleDateString('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const last = doc.sections.at(-1);
  const contact = last?.title === 'التواصل' ? last : undefined;

  const toc = (
    <ol className="flex flex-col gap-0.5">
      {[{ id: OVERVIEW, title: 'نظرة عامة' }, ...doc.sections].map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={active === s.id ? 'location' : undefined}
            className="block border-s-2 border-transparent py-1 ps-3 text-meta leading-snug text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground aria-[current]:border-foreground aria-[current]:font-semibold aria-[current]:text-foreground"
          >
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <Container as="main" id="main" className="py-12 sm:py-20">
      <PageMeta title={title} description={description} />

      <header className="text-center">
        <h1 className="text-display leading-tight font-bold">{title}</h1>
        <p className="mt-3 text-meta text-muted-foreground">
          آخر تحديث: <time dateTime={updated}>{date}</time>
        </p>
      </header>

      {/* بعرض الحاوية كلها: النص يبدأ بمحاذاة الشعار، والفهرس ينتهي بمحاذاة طرف الترويسة الآخر */}
      <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        {/* في هذه الصفحة: بجانب النص على الشاشات الواسعة، قابل للطيّ على الجوال */}
        <aside className="lg:sticky lg:top-24 lg:order-last lg:max-h-[calc(100dvh-8rem)] lg:scroll-thin lg:self-start lg:overflow-y-auto">
          <nav aria-label={`فهرس ${title}`}>
            <div className="hidden lg:block">
              <p className="mb-3 text-caption font-semibold text-foreground">في هذه الصفحة</p>
              {toc}
            </div>
            <CollapsiblePrimitive.Root className="rounded-lg bg-sunken lg:hidden">
              <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between px-4 py-3 text-control font-semibold">
                في هذه الصفحة
                <ChevronDownIcon className="size-4 text-tertiary transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
              </CollapsiblePrimitive.Trigger>
              <CollapsiblePrimitive.Content className="overflow-hidden px-2 pb-3 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {toc}
              </CollapsiblePrimitive.Content>
            </CollapsiblePrimitive.Root>
          </nav>
        </aside>

        <article className="max-w-3xl min-w-0">
          <section id={OVERVIEW} aria-label="نظرة عامة" className={cn(prose, 'scroll-mt-24')}>
            {doc.intro.map((b, i) => (
              <Block key={i} b={b} />
            ))}
          </section>

          {doc.sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-t`}
              className={cn(
                'scroll-mt-24',
                s === contact ? 'mt-12 rounded-xl border moment p-6 sm:p-8' : 'mt-10 border-t pt-10',
              )}
            >
              <h2 id={`${s.id}-t`} className="text-xl leading-snug font-bold">
                {s.title}
              </h2>
              <div className={cn(prose, 'mt-4')}>
                {s.blocks.map((b, i) => (
                  <Block key={i} b={b} />
                ))}
              </div>
              {extras?.[s.title] && <div className="mt-5">{extras[s.title]}</div>}
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}
