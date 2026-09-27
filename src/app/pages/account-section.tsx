import { Navigate, useParams } from 'react-router';

import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { ACCOUNT_SECTIONS, type AccountSection } from '@/features/account/types';
import { requireUser } from '@/lib/auth';

import { SectionContent } from './account-section-content';

const isSection = (s: string): s is AccountSection => (ACCOUNT_SECTIONS as readonly string[]).includes(s);

export function AccountSectionPage() {
  const { section } = useParams<{ section: string }>();
  if (!section || !isSection(section)) return <Navigate to="/account" replace />;
  const user = requireUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.account.getHref(section))} replace />;
  if (section === 'foundry' && user.plan !== 'studio')
    return <Navigate to={paths.account.getHref('subscription')} replace />;

  return (
    <AccountShell user={user} section={section}>
      <SectionContent user={user} section={section} />
    </AccountShell>
  );
}
