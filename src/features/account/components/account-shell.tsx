import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ChevronRightIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { SECTION_TITLE } from '@/features/account/config/nav';
import type { AccountSection, User } from '@/features/account/types';
import { cn } from '@/lib/cn';

import { AccountPanel } from './account-panel';

/**
 * صفحة الحساب: القائمة + المحتوى داخل عمود الصفحة نفسه تحت الترويسة (حوافّ متطابقة).
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
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-8 sm:py-10 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside
        className={cn(
          'lg:sticky lg:top-26 lg:block lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto',
          section && 'hidden',
        )}
      >
        <AccountPanel user={user} active={section} />
      </aside>
      <main id="main" className={cn('min-w-0', !section && 'hidden lg:block')}>
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
