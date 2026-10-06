import { useActionState, useState } from 'react';
import { Link } from 'react-router';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { CheckIcon, MailIcon, UserIcon } from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { AuthDivider } from './auth-divider';
import { GoogleButton } from './google-button';
import { PasswordInput } from './password-input';
import { VerifyEmail } from './verify-email';
import type { AuthState } from '../api/actions';

const RULES: [string, (p: string) => boolean][] = [
  ['8 أحرف على الأقل', (p) => p.length >= 8],
  ['حرف واحد على الأقل', (p) => /[A-Za-z؀-ۿ]/.test(p)],
  ['رقم واحد على الأقل', (p) => /\d/.test(p)],
];

export function RegisterForm({
  action,
}: {
  action: (prev: AuthState, form: FormData) => AuthState | Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [pw, setPw] = useState('');
  // «غيّر البريد» يعيد النموذج بقيمه — وإرسال جديد يعود لصندوق التحقّق
  const [editing, setEditing] = useState(false);
  const f = state?.fields ?? {};

  if (state?.sent && !editing) return <VerifyEmail email={state.sent} onEdit={() => setEditing(true)} />;

  return (
    <form
      action={(fd) => {
        setEditing(false);
        formAction(fd);
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <GoogleButton />
      <AuthDivider />
      {state?.error && <Alert tone="danger" title={state.error} />}
      <Field>
        <FieldLabel htmlFor="name">الاسم</FieldLabel>
        <InputGroup
          id="name"
          name="name"
          defaultValue={state?.values?.name}
          autoComplete="name"
          start={<UserIcon />}
          maxLength={80}
          aria-invalid={!!f.name}
          aria-describedby="name-err"
        />
        <FieldError id="name-err">{f.name}</FieldError>
      </Field>
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
          maxLength={254}
          aria-invalid={!!f.email}
          aria-describedby="email-err"
        />
        <FieldError id="email-err">{f.email}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          maxLength={128}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          aria-invalid={!!f.password}
          aria-describedby="pw-rules password-err"
        />
        <ul id="pw-rules" className="flex flex-wrap gap-x-4 gap-y-1 text-caption">
          {RULES.map(([label, ok]) => (
            <li
              key={label}
              className={cn('flex items-center gap-1 transition-colors', ok(pw) ? 'text-ok-text' : 'text-tertiary')}
            >
              <CheckIcon className="size-3" />
              {label}
            </li>
          ))}
        </ul>
        <FieldError id="password-err">{f.password}</FieldError>
      </Field>
      <label className="flex items-start gap-2 text-meta text-muted-foreground">
        <Checkbox name="terms" value="on" className="mt-0.5" aria-invalid={!!f.terms} />
        <span>
          أوافق على{' '}
          <Link to="/terms" target="_blank" className="text-foreground underline underline-offset-4 hover:text-primary">
            الشروط والأحكام
          </Link>{' '}
          و
          <Link
            to="/privacy"
            target="_blank"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            سياسة الخصوصية
          </Link>
          .
        </span>
      </label>
      <FieldError>{f.terms}</FieldError>
      <Button type="submit" size="lg" block loading={pending}>
        إنشاء الحساب
      </Button>
    </form>
  );
}
