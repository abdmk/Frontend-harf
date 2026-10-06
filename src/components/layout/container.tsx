import type { ComponentProps, ElementType } from 'react';

import { cn } from '@/lib/utils';

type ContainerProps<T extends ElementType> = { as?: T } & Omit<ComponentProps<T>, 'as'>;

/** الحاوية الموحّدة لعرض الصفحات (1440px بهوامش تكبر مع الشاشة) — راجع container-page في tokens.css */
export function Container<T extends ElementType = 'div'>({ as, className, ...props }: ContainerProps<T>) {
  const Comp: ElementType = as ?? 'div';
  return <Comp className={cn('container-page', className)} {...props} />;
}
