import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { useCurrentUser } from '@/hooks/use-current-user';

import { SectionContent } from './account-section-content';

export function AccountIndexPage() {
  const user = useCurrentUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.account.getHref(''))} replace />;
  return (
    <AccountShell user={user} section={null}>
      <PageMeta title="الملف الشخصي" noindex />
      <SectionContent user={user} section="profile" />
    </AccountShell>
  );
}
