import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { Fragment, type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { ChevronDownIcon } from '@/components/ui/icons';
import type { LegalBlock, LegalDoc } from '@/content/legal/parse';
import { wordCount } from '@/content/legal/parse';
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
  if (b.type === 'h') return <h3 className="pt-2 text-control font-semibold text-foreground">{b.text}</h3>;
  if (b.type === 'p') return <p>{withEmails(b.text)}</p>;
  const List = b.type === 'ul' ? 'ul' : 'ol';
  return (
    <List className={cn('flex flex-col gap-1.5 ps-5', b.type === 'ul' ? 'list-disc' : 'list-decimal')}>
      {b.items.map((it) => (
        <li key={it} className="ps-1 marker:text-tertiary">
          {withEmails(it)}
        </li>
      ))}
    </List>
  );
}

/** البند الظاهر حالياً — لتمييزه في الفهرس */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      // «ظاهر» = دخل الثلث الأعلى من الشاشة
      { rootMargin: '-96px 0px -66% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const DOCS = [
  { href: '/terms', label: 'الشروط والأحكام' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
] as const;

/**
 * صفحة وثيقة قانونية: مقدّمة بطابع الوثيقة (تاريخ التحديث، عدد البنود، مدّة القراءة، والتنقّل بين
 * الوثيقتين)، ثم فهرس ثابت بجانب البنود على الشاشات الواسعة وقابل للطيّ على الجوال. كل بند له رابط.
 */
export function LegalDocument({
  title,
  description,
  updated,
  doc,
  current,
}: {
  title: string;
  description: string;
  /** YYYY-MM-DD */
  updated: string;
  doc: LegalDoc;
  current: (typeof DOCS)[number]['href'];
}) {
  const ids = doc.sections.map((s) => s.id);
  const active = useActiveSection(ids);
  const minutes = Math.max(1, Math.round(wordCount(doc) / 200));
  const date = new Date(`${updated}T00:00:00`).toLocaleDateString('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const toc = (
    <ol className="flex flex-col">
      {doc.sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={active === s.id ? 'location' : undefined}
            className="flex gap-3 rounded-xs py-1.5 ps-3 pe-2 text-meta leading-snug text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-sunken hover:text-foreground aria-[current]:bg-tint-brand aria-[current]:font-medium aria-[current]:text-primary"
          >
            <span dir="ltr" className="w-5 shrink-0 text-end tabular-nums opacity-70">
              {s.n}
            </span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta title={title} description={description} />

      {/* المقدّمة: طابع الوثيقة — لا عنوان ووصف في فراغ */}
      <header className="border-b pb-8 sm:pb-10">
        <nav aria-label="الوثائق القانونية" className="mb-8 flex flex-wrap gap-2">
          {DOCS.map((d) => (
            <Link
              key={d.href}
              to={d.href}
              aria-current={d.href === current ? 'page' : undefined}
              className="rounded-full border px-4 py-1.5 text-meta text-muted-foreground transition-colors hover:border-strong hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {d.label}
            </Link>
          ))}
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <h1 className="text-display leading-tight font-semibold">{title}</h1>
            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-meta text-muted-foreground">
              <div className="flex gap-1.5">
                <dt>آخر تحديث</dt>
                <dd className="font-medium text-foreground">
                  <time dateTime={updated}>{date}</time>
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="sr-only">عدد البنود</dt>
                <dd>
                  <span className="tabular-nums">{doc.sections.length}</span> بنداً
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="sr-only">مدّة القراءة</dt>
                <dd>
                  نحو <span className="tabular-nums">{minutes}</span> دقيقة قراءة
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex max-w-[62ch] flex-col gap-2 text-control leading-loose text-muted-foreground">
            {doc.intro.map((b, i) => (
              <Block key={i} b={b} />
            ))}
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        {/* الفهرس: ثابت بجانب النص على الشاشات الواسعة، قابل للطيّ على الجوال */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto">
          <nav aria-label={`فهرس ${title}`}>
            <div className="hidden lg:block">
              <p className="mb-3 px-3 text-caption font-medium text-tertiary">المحتويات</p>
              {toc}
            </div>
            <CollapsiblePrimitive.Root className="rounded-lg border lg:hidden">
              <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between px-4 py-3 text-control font-medium">
                <span>
                  المحتويات · <span className="tabular-nums">{doc.sections.length}</span> بنداً
                </span>
                <ChevronDownIcon className="size-4 text-tertiary transition-transform duration-(--dur-base) group-data-[state=open]:rotate-180" />
              </CollapsiblePrimitive.Trigger>
              <CollapsiblePrimitive.Content className="overflow-hidden border-t px-1 py-2 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                {toc}
              </CollapsiblePrimitive.Content>
            </CollapsiblePrimitive.Root>
          </nav>
        </aside>

        <div className="flex max-w-170 flex-col gap-12">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className="scroll-mt-24">
              <h2 id={`${s.id}-t`} className="group flex items-baseline gap-3 text-lg font-semibold">
                <span dir="ltr" className="text-control font-semibold text-primary tabular-nums">
                  {String(s.n).padStart(2, '0')}
                </span>
                {s.title}
                <a
                  href={`#${s.id}`}
                  aria-label={`رابط البند ${s.n}`}
                  className="text-tertiary opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  #
                </a>
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-control leading-loose text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary">
                {s.blocks.map((b, i) => (
                  <Block key={i} b={b} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
