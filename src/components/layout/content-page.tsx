import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';
import { cn } from '@/lib/cn';

/**
 * صفحة محتوى (عن حرف، الخدمات، المساعدة): عنوان في الوسط ومقدّمة كالوثائق القانونية،
 * ثم أقسام بعرض قراءة مريح — وأعرض قليلاً حين تحوي بطاقات.
 */
export function ContentPage({
  title,
  lead,
  wide,
  children,
}: {
  title: string;
  lead?: string;
  /** عرض أوسع للصفحات ذات البطاقات */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Container as="main" id="main" className="py-12 sm:py-20">
      <PageMeta title={title} description={lead} />
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="animate-fade-up text-display leading-tight font-bold">{title}</h1>
        {lead && <p className="mt-4 text-lead leading-relaxed text-muted-foreground">{lead}</p>}
      </header>
      <div className={cn('mx-auto mt-12 flex flex-col gap-14 sm:mt-16', wide ? 'max-w-4xl' : 'max-w-2xl')}>
        {children}
      </div>
    </Container>
  );
}

/** قسم داخل صفحة المحتوى: عنوان ثم فقرات أو قائمة أو بطاقات */
export function ContentSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-meta text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-3 text-control leading-loose text-muted-foreground [&_a:not([data-slot])]:text-foreground [&_a:not([data-slot])]:underline [&_a:not([data-slot])]:underline-offset-4 [&_a:not([data-slot])]:hover:text-primary">
        {children}
      </div>
    </section>
  );
}

/** صندوق التواصل الرمادي في نهاية الصفحة — كقسم «التواصل» في الوثائق القانونية */
export function ContactBox({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border moment p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-control leading-relaxed text-muted-foreground">{children}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </section>
  );
}
