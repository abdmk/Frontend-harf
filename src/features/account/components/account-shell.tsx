import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ChevronRightIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { SECTION_TITLE } from '@/features/account/config/nav';
import type { AccountSection, User } from '@/features/account/types';
import { cn } from '@/lib/cn';

import { AccountPanel } from './account-panel';

/**
 * صفحة الحساب: العمود الجانبي (قائمة الحساب) + منطقة المحتوى.
 * على الجوال: ‎/account صفحة فهرس بالقائمة فقط، وكل قسم صفحة مستقلّة بزرّ رجوع.
 */
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
    <div className="grid min-h-[calc(100dvh-72px)] grid-cols-[minmax(0,1fr)] lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[480px_minmax(0,1fr)]">
      <aside
        className={cn(
          'bg-background px-6 py-8 sm:px-10 lg:sticky lg:top-18 lg:block lg:h-[calc(100dvh-72px)] lg:overflow-y-auto lg:border-e lg:py-10',
          section && 'hidden',
        )}
      >
        <AccountPanel user={user} active={section} />
      </aside>
      <main id="main" className={cn('bg-page-muted px-4 py-8 sm:px-12 sm:py-10', !section && 'hidden lg:block')}>
        {section && (
          <Link
            to={paths.account.getHref('')}
            className="mb-4 inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ChevronRightIcon className="size-4" />
            الحساب
          </Link>
        )}
        <h1 key={shown} className="animate-fade-up text-2xl font-semibold">
          {SECTION_TITLE[shown]}
        </h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
