import type { User } from '@/features/account/types';
import { cn } from '@/lib/cn';
import { usePublicProfile } from '@/lib/public-profile';

/**
 * صورة المستخدم داخل حلقة ذهبية: الصورة الشخصية إن وُجدت، وإلا الحرفان الأوّلان.
 * للاستوديو صورة واحدة في كل الموقع: ما يرفعه في «الملف الشخصي» يظهر هنا أيضاً.
 */
export function UserAvatar({
  user,
  className,
}: {
  user: Pick<User, 'initials' | 'name' | 'avatarUrl'> & { plan?: User['plan'] };
  className?: string;
}) {
  const own = usePublicProfile();
  const src = (user.plan === 'studio' && own.avatar) || user.avatarUrl;
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full p-0.75 ring-2 ring-gold-500 ring-offset-0',
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" width={96} height={96} className="size-full rounded-full bg-tint-info object-cover" />
      ) : (
        <span
          className="grid size-full place-items-center rounded-full bg-harf-600 text-[0.72em] font-medium text-white"
          dir="ltr"
        >
          {user.initials}
        </span>
      )}
    </span>
  );
}
