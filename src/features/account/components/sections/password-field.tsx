import { LockIcon } from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';

/** حقل كلمة مرور بسيط لنماذج الحساب */
export function PasswordField({
  id,
  name,
  autoComplete,
  invalid,
}: {
  id: string;
  name: string;
  autoComplete: string;
  invalid?: string;
}) {
  return (
    <InputGroup
      id={id}
      name={name}
      type="password"
      dir="ltr"
      autoComplete={autoComplete}
      maxLength={128}
      start={<LockIcon />}
      aria-invalid={!!invalid}
    />
  );
}
