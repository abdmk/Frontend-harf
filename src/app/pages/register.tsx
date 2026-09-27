import { signUp } from '@/features/auth/api/actions';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <AuthShell
      mode="register"
      title="ابدأ مع حرف مجاناً"
      lead="احفظ خطوطك المفضّلة، حمّل المجاني، واشترِ التراخيص من مكان واحد."
    >
      <RegisterForm action={signUp} />
    </AuthShell>
  );
}
