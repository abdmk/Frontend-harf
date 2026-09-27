import { Navigate } from 'react-router';

import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { requireUser } from '@/lib/auth';

import { SectionContent } from './account-section-content';

export function AccountIndexPage() {
  const user = requireUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.account.getHref(''))} replace />;
  return (
    <AccountShell user={user} section={null}>
      <SectionContent user={user} section="profile" />
    </AccountShell>
  );
}
