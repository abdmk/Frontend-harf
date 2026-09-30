import { Navigate, useParams } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { SECTION_TITLE } from '@/features/account/config/nav';
import { ACCOUNT_SECTIONS, type AccountSection } from '@/features/account/types';
import { requireUser } from '@/lib/auth';

import { SectionContent } from './account-section-content';

const isSection = (s: string): s is AccountSection => (ACCOUNT_SECTIONS as readonly string[]).includes(s);

export function AccountSectionPage() {
  const { section } = useParams<{ section: string }>();
  if (!section || !isSection(section)) return <Navigate to="/account" replace />;
  const user = requireUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.account.getHref(section))} replace />;
  // الاستوديو يعيش في /studio؛ الرابط القديم يوجّه إليها مباشرة
  if (section === 'foundry')
    return (
      <Navigate to={user.plan === 'studio' ? paths.studio.getHref() : paths.account.getHref('subscription')} replace />
    );

  return (
    <AccountShell user={user} section={section}>
      <PageMeta title={SECTION_TITLE[section]} noindex />
      <SectionContent user={user} section={section} />
    </AccountShell>
  );
}
