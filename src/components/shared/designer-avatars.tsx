import { cn } from '@/lib/cn';
import type { Designer } from '@/types/domain/font';

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
        <i
          key={d.id}
          dir="ltr"
          className={cn(
            'grid size-5 place-items-center rounded-full text-3xs font-semibold text-white not-italic ring-2 ring-card',
            i > 0 && '-ms-1.5',
          )}
          style={{ background: d.color }}
        >
          {d.initials}
        </i>
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
