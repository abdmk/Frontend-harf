import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** يدمج أصناف Tailwind ويحلّ التعارض بينها (القاعدة الأخيرة تغلب) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
