import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { requireUser } from '@/lib/auth';

import { SectionContent } from './account-section-content';

export function AccountIndexPage() {
  const user = requireUser();
  if (!user) return <Navigate to={paths.login.getHref(paths.account.getHref(''))} replace />;
  return (
    <AccountShell user={user} section={null}>
      <PageMeta title="الملف الشخصي" noindex />
      <SectionContent user={user} section="profile" />
    </AccountShell>
  );
}
