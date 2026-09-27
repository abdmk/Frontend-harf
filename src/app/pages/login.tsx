import { Navigate, useSearchParams } from 'react-router';

import { signIn } from '@/features/auth/api/actions';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { getCurrentUser, safeNext } from '@/lib/auth';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next') ?? undefined, '');
  if (getCurrentUser()) return <Navigate to={next || '/'} replace />;
  return (
    <AuthShell mode="login" title="سجّل الدخول إلى حرف" lead="تابع مكتبتك وتراخيصك ومشاريعك من حيث توقّفت.">
      <LoginForm next={next} action={signIn} />
    </AuthShell>
  );
}
