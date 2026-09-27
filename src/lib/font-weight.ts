import type { CSSProperties } from 'react';

/**
 * خطّ العرض المتاح يصل إلى 600؛ الأوزان الأثقل تُحاكى بحدٍّ خفيف للعرض فقط.
 * في المنتج يُحمَّل ملف كل وزن من الخط نفسه فتُحذف هذه المحاكاة.
 */
export function weightStyle(w: number): CSSProperties {
  const real = w <= 100 ? 250 : w <= 200 ? 270 : Math.min(w, 600);
  return {
    fontWeight: real,
    WebkitTextStroke: w > 600 ? `${(((w - 600) / 100) * 0.3).toFixed(2)}px currentColor` : undefined,
  };
}
