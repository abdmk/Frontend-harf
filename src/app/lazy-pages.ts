import { lazy } from 'react';

/**
 * الصفحات الثقيلة في حزم منفصلة — لا تُحمَّل إلا لمن يفتحها. `preloadPage` يبدأ تنزيل الحزمة
 * عند مرور المؤشّر أو التركيز على رابطها، فيكون الانتقال شبه فوري.
 */
const loaders = {
  '/tools/nasaq': () => import('./pages/nasaq').then((m) => ({ default: m.NasaqPage })),
  '/tools/font-lab': () => import('./pages/font-lab').then((m) => ({ default: m.FontLabPage })),
  '/tools/font-matching': () => import('./pages/font-matching').then((m) => ({ default: m.FontMatchingPage })),
} as const;

export const NasaqPage = lazy(loaders['/tools/nasaq']);
export const FontLabPage = lazy(loaders['/tools/font-lab']);
export const FontMatchingPage = lazy(loaders['/tools/font-matching']);

const started = new Set<string>();
export function preloadPage(href: string) {
  const path = href.split('?')[0] as keyof typeof loaders;
  if (!(path in loaders) || started.has(path)) return;
  started.add(path);
  void loaders[path]().catch(() => started.delete(path));
}
