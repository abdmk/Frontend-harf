import type { ComponentProps, ElementType } from 'react';

import { cn } from '@/lib/cn';

type ContainerProps<T extends ElementType> = { as?: T } & Omit<ComponentProps<T>, 'as'>;

/** الحاوية الموحّدة لعرض الصفحات (1120px مع هوامش الجوال) — راجع container-page في tokens.css */
export function Container<T extends ElementType = 'div'>({ as, className, ...props }: ContainerProps<T>) {
  const Comp: ElementType = as ?? 'div';
  return <Comp className={cn('container-page', className)} {...props} />;
}
