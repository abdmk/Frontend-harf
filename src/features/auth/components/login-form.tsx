import { useActionState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { MailIcon, SignInIcon } from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';

import { AuthDivider } from './auth-divider';
import { GoogleButton } from './google-button';
import { PasswordInput } from './password-input';
import type { AuthState } from '../api/actions';

export function LoginForm({
  next,
  action,
}: {
  next?: string;
  action: (prev: AuthState, form: FormData) => AuthState | Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const f = state?.fields ?? {};
  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <GoogleButton />
      <AuthDivider />
      {state?.error && <Alert tone="danger" title={state.error} />}
      <input type="hidden" name="next" value={next ?? ''} />
      <Field>
        <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
        <InputGroup
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state?.values?.email}
          start={<MailIcon />}
          aria-invalid={!!f.email}
          aria-describedby="email-err"
          maxLength={254}
          required
        />
        <FieldError id="email-err">{f.email}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!f.password}
          aria-describedby="password-err"
          maxLength={128}
          required
        />
        <FieldError id="password-err">{f.password}</FieldError>
      </Field>
      <div className="flex items-center justify-between gap-4 text-meta">
        <label className="flex items-center gap-2">
          <Checkbox name="remember" defaultChecked /> تذكّرني
        </label>
        <a
          href="mailto:abdulmalik@harflibrary.com?subject=استعادة كلمة المرور"
          className="text-muted-foreground hover:text-foreground"
        >
          نسيت كلمة المرور؟
        </a>
      </div>
      <Button type="submit" size="lg" block loading={pending}>
        <SignInIcon />
        تسجيل الدخول
      </Button>
    </form>
  );
}
