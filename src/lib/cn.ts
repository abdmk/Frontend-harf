import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge لا يعرف أسماء رموز حرف المخصّصة؛ بدونها يظنّ مثلاً أنّ text-caption لون
 * فيحذفه عند وجود text-white. أي رمز جديد في tokens.css من هذه الفئات يُضاف هنا.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['3xs', '2xs', 'micro', 'caption', 'meta', 'control', 'lead', 'specimen', 'title', 'display'],
      shadow: ['soft', 'float', 'overlay', 'focus'],
      ease: ['out-quint', 'pop', 'in-out-strong'],
      breakpoint: ['xs'],
      container: ['page'],
    },
  },
});

/** يدمج أصناف Tailwind ويحلّ التعارض بينها (القاعدة الأخيرة تغلب) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
