import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { signIn } from '@/features/auth/api/actions';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { getCurrentUser, safeNext } from '@/lib/auth';

export const metadata: Metadata = { title: 'تسجيل الدخول', robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const next = safeNext((await searchParams).next, '');
  if (await getCurrentUser()) redirect(next || '/');
  return (
    <AuthShell mode="login" title="سجّل الدخول إلى حرف" lead="تابع مكتبتك وتراخيصك ومشاريعك من حيث توقّفت.">
      <LoginForm next={next} action={signIn} />
    </AuthShell>
  );
}
