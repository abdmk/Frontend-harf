import Link from 'next/link';

import { ChevronLeftIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export type Crumb = { label: string; href?: string; ltr?: boolean };

/** مسار التنقّل: الروابط رمادية، والصفحة الحالية أخيرة بلا رابط (aria-current) */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="مسار التنقّل" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-meta text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {last || !c.href ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  dir={c.ltr ? 'ltr' : undefined}
                  className={cn(last && 'font-medium text-foreground')}
                >
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              )}
              {!last && <ChevronLeftIcon aria-hidden className="size-3.5" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
