import type { LucideIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'children' | 'ref'> & {
  /** نصّ بديل؛ بدونه تُعدّ الأيقونة زخرفية وتُخفى عن قارئ الشاشة */
  title?: string;
  /**
   * حالة العنصر المختار/المفعّل (رابط حالي، زرّ مضغوط، قائمة مفتوحة): الأشكال المغلقة (قلب، نجمة،
   * جرس…) تُملأ، والبقية يثقل خطّها. 'auto': تتبع حالة الأب المباشر عبر CSS (globals.css).
   */
  filled?: boolean | 'auto';
};

/** سُمك خطّ lucide في حرف — أنحف قليلاً من الافتراضي (2) ليتّسق مع خطّ الواجهة */
const ICON_STROKE = 1.75;

/**
 * أيقونة حرف من lucide بنفس الواجهة في كل الموقع: مقاس 1em ولون currentColor، وfilled للحالة المختارة.
 * `fillable`: شكل مغلق يحسن ملؤه؛ غيره يثقل خطّه بدل الملء (lucide بلا نسخ مصمتة).
 */
export function createIcon(Lucide: LucideIcon, name: string, opts: { fillable?: boolean; solid?: boolean } = {}) {
  function Icon({ className, title, filled, ...props }: IconProps) {
    const on = opts.solid || filled === true;
    return (
      <Lucide
        size="1em"
        strokeWidth={on && !opts.fillable && !opts.solid ? 2.25 : ICON_STROKE}
        fill={on && (opts.fillable || opts.solid) ? 'currentColor' : 'none'}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        aria-label={title}
        focusable="false"
        data-icon={name}
        data-filled={on ? '' : undefined}
        data-auto-fill={filled === 'auto' ? (opts.fillable ? 'fill' : 'bold') : undefined}
        className={cn('shrink-0', className)}
        {...props}
      />
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
