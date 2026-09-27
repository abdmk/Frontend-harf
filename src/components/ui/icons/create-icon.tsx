import * as React from 'react';

import { cn } from '@/lib/cn';

type Shape = 'path' | 'rect' | 'circle' | 'ellipse' | 'polygon';
type IconNode = readonly [Shape, Readonly<Record<string, string>>];

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'children'> & {
  /** نصّ بديل؛ بدونه تُعدّ الأيقونة زخرفية وتُخفى عن قارئ الشاشة */
  title?: string;
};

/** يصنع مكوّن أيقونة من أشكال SVG بلون currentColor ومقاس 1em افتراضياً */
export function createIcon(name: string, viewBox: string, nodes: readonly IconNode[]) {
  function Icon({ className, title, ...props }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        fill="currentColor"
        width="1em"
        height="1em"
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        focusable="false"
        data-icon={name}
        className={cn('shrink-0', className)}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {nodes.map(([Tag, attrs], i) => React.createElement(Tag, { key: i, ...attrs }))}
      </svg>
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
