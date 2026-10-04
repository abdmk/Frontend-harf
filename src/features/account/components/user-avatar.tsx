import type { User } from '@/features/account/types';
import { useAccountPhoto } from '@/lib/account-photo';
import { cn } from '@/lib/cn';

/**
 * صورة المستخدم داخل حلقة ذهبية: الصورة الشخصية إن وُجدت، وإلا الحرفان الأوّلان.
 * صورة واحدة في كل الموقع مربوطة بالحساب (لا بالخطة): ما يُرفع في «الملف الشخصي» يظهر هنا أيضاً.
 */
export function UserAvatar({
  user,
  className,
}: {
  user: Pick<User, 'id' | 'initials' | 'name' | 'avatarUrl'>;
  className?: string;
}) {
  const src = useAccountPhoto(user.id) ?? user.avatarUrl;
  return (
    <span
      aria-hidden
      className={cn(
        // overflow-hidden وصورة مربّعة: أي صورة (طولية أو عرضية) تُقصّ داخل الدائرة ولا تخرج من الحلقة
        'grid size-9 shrink-0 place-items-center overflow-hidden rounded-full p-0.75 ring-2 ring-gold-500 ring-offset-0',
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={96}
          height={96}
          className="aspect-square size-full min-h-0 min-w-0 rounded-full bg-tint-info object-cover"
        />
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
