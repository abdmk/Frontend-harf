import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { AccountShell } from '@/features/account/components/account-shell';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMediaQuery } from '@/hooks/use-media-query';

import { SectionContent } from './account-section-content';

/**
 * ‎/account: على الجوال فهرس بالقائمة وحدها (وجهة زرّ «الحساب» من كل الصفحات)،
 * وعلى الشاشات الواسعة الملف الشخصي بجانبها.
 */
export function AccountIndexPage() {
  const user = useCurrentUser();
  const wide = useMediaQuery('(min-width: 64rem)');
  if (!user) return <Navigate to={paths.login.getHref(paths.account.getHref(''))} replace />;
  // ملف الاستوديو في /studio/profile — يُحوَّل إليه على الشاشات الواسعة فقط، وإلا لما ظهر الفهرس على الجوال
  if (user.plan === 'studio' && wide) return <Navigate to={paths.studio.getHref('profile')} replace />;
  return (
    <AccountShell user={user} section={null}>
      <PageMeta title="الملف الشخصي" noindex />
      {user.plan !== 'studio' && <SectionContent user={user} section="profile" />}
    </AccountShell>
  );
}
