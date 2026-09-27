import { type ComponentProps, useState } from 'react';

import { EyeIcon, EyeOffIcon, LockIcon } from '@/components/ui/icons';
import { InputGroup } from '@/components/ui/input';

/** كلمة المرور مع زرّ إظهار/إخفاء (بعنوان مقروء لقارئ الشاشة) */
export function PasswordInput(props: Omit<ComponentProps<typeof InputGroup>, 'type' | 'start' | 'end'>) {
  const [show, setShow] = useState(false);
  return (
    <InputGroup
      {...props}
      type={show ? 'text' : 'password'}
      dir="ltr"
      start={<LockIcon />}
      end={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-pressed={show}
          className="grid size-7 place-items-center rounded-xs transition-colors hover:bg-sunken hover:text-foreground"
        >
          {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      }
    />
  );
}
