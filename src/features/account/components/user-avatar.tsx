import { cn } from '@/lib/cn';

import type { User } from '@/features/account/types';

/** صورة المستخدم: الحرفان الأوّلان داخل حلقة ذهبية (تُستبدل بالصورة حين تتوفّر) */
export function UserAvatar({ user, className }: { user: Pick<User, 'initials' | 'name'>; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full p-[3px] ring-2 ring-gold-500 ring-offset-0',
        className,
      )}
    >
      <span
        className="grid size-full place-items-center rounded-full bg-harf-500 text-[0.72em] font-medium text-white"
        dir="ltr"
      >
        {user.initials}
      </span>
    </span>
  );
}
