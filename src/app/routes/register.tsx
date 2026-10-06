import { PageMeta } from '@/components/shared/page-meta';
import { signUp } from '@/features/auth/api/actions';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <AuthShell
      mode="register"
      title="أنشئ حسابك في حرف"
      lead="احفظ خطوطك المفضّلة، حمّل المجاني، واشترِ التراخيص من مكان واحد."
    >
      <PageMeta title="إنشاء حساب" />
      <RegisterForm action={signUp} />
    </AuthShell>
  );
}
