import { Navigate } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { paths } from '@/config/paths';
import { VerifyFlow } from '@/features/verification/components/verify-flow';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMyVerification } from '@/lib/studio-verification';

/** توثيق الاستوديو — صفحة مركّزة بلا عمود جانبي (كمراحل التسجيل)، للاستوديو وحده */
export function StudioVerifyPage() {
  const user = useCurrentUser();
  const record = useMyVerification();
  if (!user) return <Navigate to={paths.login.getHref(paths.studio.getHref('verify'))} replace />;
  if (user.plan !== 'studio') return <Navigate to={paths.account.getHref('subscription')} replace />;
  return (
    <>
      <PageMeta title="توثيق الاستوديو" noindex />
      <VerifyFlow key={user.id} user={user} record={record} />
    </>
  );
}
