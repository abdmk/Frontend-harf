import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { ChevronRightIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { navKeyFor, SECTION_TITLE } from '@/features/account/config/nav';
import type { AccountSection, User } from '@/features/account/types';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/cn';

import { AccountPanel } from './account-panel';

/**
 * هيكل واحد لكل صفحات الحساب والاستوديو: العمود الجانبي نفسه (نفس البنود والترتيب والعرض)
 * والمحتوى بجانبه — الذي يتغيّر بين الصفحات هو البند المحدّد والمحتوى فقط.
 * على الجوال: ‎/account فهرس بالقائمة وحدها، وكل صفحة أخرى مستقلّة بزرّ رجوع إليه.
 */
export function WorkspaceShell({
  user,
  index = false,
  children,
}: {
  user: User;
  /** صفحة الفهرس (‎/account): القائمة وحدها على الجوال */
  index?: boolean;
  children?: ReactNode;
}) {
  const { pathname } = useLocation();
  // فهرس الجوال قائمة فقط — لا بند محدّداً؛ على الواسعة يظهر الملف بجانبها فيُحدَّد
  const wide = useMediaQuery('(min-width: 64rem)');
  const active = index && !wide ? null : navKeyFor(pathname);
  return (
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-8 sm:py-10 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside
        className={cn(
          'lg:sticky lg:top-26 lg:block lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto',
          !index && 'hidden',
        )}
      >
        <AccountPanel user={user} active={active} />
      </aside>
      <main id="main" className={cn('min-w-0', index && 'hidden lg:block')}>
        {!index && (
          <Link
            to={paths.account.getHref('')}
            className="mb-4 inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ChevronRightIcon className="size-4" />
            الحساب
          </Link>
        )}
        {children}
      </main>
    </div>
  );
}

/** صفحات الحساب: الهيكل الموحّد + عنوان القسم */
export function AccountShell({
  user,
  section,
  children,
}: {
  user: User;
  /** null = صفحة الفهرس */
  section: AccountSection | null;
  children?: ReactNode;
}) {
  const shown = section ?? 'profile';
  return (
    <WorkspaceShell user={user} index={!section}>
      <h1 key={shown} className="animate-fade-up text-2xl font-semibold">
        {SECTION_TITLE[shown]}
      </h1>
      <div className="mt-6">{children}</div>
    </WorkspaceShell>
  );
}
