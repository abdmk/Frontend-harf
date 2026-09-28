import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { PageMeta } from '@/components/shared/page-meta';

/** صفحة محتوى ثابت (عن حرف، الخدمات، المساعدة، الشروط…): عنوان ومقدّمة ثم محتوى بعرض قراءة مريح */
export function ContentPage({
  title,
  lead,
  notice,
  children,
}: {
  title: string;
  lead?: string;
  /** شريط تنبيه أعلى المحتوى (مثل «مسودّة») */
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta title={title} description={lead} />
      <div className="mx-auto max-w-170">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {lead && <p className="mt-3 text-lead leading-relaxed text-muted-foreground">{lead}</p>}
        </header>
        {notice}
        <div className="flex flex-col gap-10">{children}</div>
      </div>
    </Container>
  );
}

/** قسم داخل صفحة المحتوى: عنوان ثم فقرات أو قائمة */
export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-control leading-loose text-muted-foreground [&_a:not([data-slot])]:text-foreground [&_a:not([data-slot])]:underline [&_a:not([data-slot])]:underline-offset-4 [&_a:not([data-slot])]:hover:text-primary [&_li]:ms-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
