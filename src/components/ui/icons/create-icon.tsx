import * as React from 'react';

import { cn } from '@/lib/utils';

type Shape = 'path' | 'rect' | 'circle' | 'ellipse' | 'polygon';
type IconNode = readonly [Shape, Readonly<Record<string, string>>];

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'children'> & {
  /** نصّ بديل؛ بدونه تُعدّ الأيقونة زخرفية وتُخفى عن قارئ الشاشة */
  title?: string;
  /**
   * النسخة المصمتة للعنصر المختار/المفعّل (رابط حالي، زرّ مضغوط، قائمة مفتوحة) — خطّية في غيره.
   * 'auto': تتبع حالة العنصر الأب المباشر (aria-pressed/current/expanded، data-state) عبر CSS —
   * للمكوّنات العامة التي لا تعرف حالتها (أزرار تفتح نافذة، SegmentedControl).
   */
  filled?: boolean | 'auto';
};

/** يصنع مكوّن أيقونة من أشكال SVG بلون currentColor ومقاس 1em افتراضياً */
export function createIcon(name: string, viewBox: string, nodes: readonly IconNode[], solid?: readonly IconNode[]) {
  function Icon({ className, title, filled, ...props }: IconProps) {
    const draw = (list: readonly IconNode[]) =>
      list.map(([Tag, attrs], i) => React.createElement(Tag, { key: i, ...attrs }));
    const auto = filled === 'auto' && !!solid;
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
        data-filled={filled === true && solid ? '' : undefined}
        data-auto-fill={auto ? '' : undefined}
        className={cn('shrink-0', className)}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {auto ? (
          <>
            <g data-v="line">{draw(nodes)}</g>
            <g data-v="solid">{draw(solid)}</g>
          </>
        ) : (
          draw(filled === true && solid ? solid : nodes)
        )}
      </svg>
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
