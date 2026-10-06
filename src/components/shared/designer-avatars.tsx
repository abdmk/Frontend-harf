import { cn } from '@/lib/utils';
import type { Designer } from '@/types/domain/font';

import { Avatar } from './avatar';

/** صور المصمّمين متراكبة، ومؤشّر «N+» حين يزيدون عن الحدّ */
export function DesignerAvatars({
  designers,
  max = 2,
  className,
}: {
  designers: Designer[];
  max?: number;
  className?: string;
}) {
  const shown = designers.slice(0, max);
  const more = designers.length - shown.length;
  return (
    <span aria-hidden className={cn('flex shrink-0', className)}>
      {shown.map((d, i) => (
        <Avatar
          key={d.id}
          initials={d.initials}
          seed={d.id}
          size="xs"
          className={cn('ring-2 ring-card', i > 0 && '-ms-1.5')}
        />
      ))}
      {more > 0 && (
        <i
          dir="ltr"
          className="-ms-1.5 grid size-5 place-items-center rounded-full bg-inset text-3xs font-semibold text-foreground not-italic ring-2 ring-card"
        >
          {more}+
        </i>
      )}
    </span>
  );
}
