import { Navigate, useSearchParams } from 'react-router';

import { PageMeta } from '@/components/shared/page-meta';
import { signIn } from '@/features/auth/api/actions';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { useCurrentUser } from '@/hooks/use-current-user';
import { safeNext } from '@/lib/auth';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next') ?? undefined, '');
  const user = useCurrentUser();
  if (user) return <Navigate to={next || '/'} replace />;
  return (
    <AuthShell mode="login" title="سجّل الدخول إلى حرف" lead="تابع مكتبتك وتراخيصك ومشاريعك من حيث توقّفت.">
      <PageMeta title="تسجيل الدخول" />
      <LoginForm next={next} action={signIn} />
    </AuthShell>
  );
}
