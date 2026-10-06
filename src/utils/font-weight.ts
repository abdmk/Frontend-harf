import type { CSSProperties } from 'react';

import type { LiveFace } from '@/types/domain/font';

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

/** أقرب وزن موجود فعلاً في الخط */
export function nearestWeight(face: LiveFace, w: number) {
  return face.weights.reduce((best, x) => (Math.abs(x - w) < Math.abs(best - w) ? x : best), face.weights[0]!);
}

/**
 * أسلوب النصّ بخط حقيقي إن وُجد (بأقرب وزن موجود فيه — بلا محاكاة)، وإلا بخط الموقع كما في weightStyle.
 */
export function faceStyle(face: LiveFace | undefined, w: number): CSSProperties {
  if (!face) return weightStyle(w);
  return { fontFamily: `'${face.family}', var(--font-sans)`, fontWeight: nearestWeight(face, w) };
}
