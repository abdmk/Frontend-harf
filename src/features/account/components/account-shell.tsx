import type { ReactNode } from 'react';

import { SECTION_TITLE } from '@/features/account/config/nav';
import type { AccountSection, User } from '@/features/account/types';

import { AccountPanel } from './account-panel';

/** صفحة الحساب: العمود الجانبي (قائمة الحساب) + منطقة المحتوى */
export function AccountShell({
  user,
  section,
  children,
}: {
  user: User;
  section: AccountSection;
  children?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100dvh-72px)] grid-cols-[minmax(0,1fr)] lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[480px_minmax(0,1fr)]">
      <aside className="border-b bg-background px-6 py-8 sm:px-10 lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] lg:overflow-y-auto lg:border-e lg:border-b-0 lg:py-10">
        <AccountPanel user={user} active={section} />
      </aside>
      <main id="main" className="bg-page-muted px-6 py-10 sm:px-12">
        <h1 key={section} className="animate-fade-up text-2xl font-semibold">
          {SECTION_TITLE[section]}
        </h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

/** مكان محتوى القسم حتى يُصمَّم */
export function SectionPlaceholder() {
  return (
    <div className="animate-fade-up rounded-lg border border-dashed border-strong px-6 py-16 text-center text-sm text-muted-foreground">
      محتوى هذا القسم لم يُصمَّم بعد.
    </div>
  );
}
