/**
 * تنزيل حزمة الصفحة قبل النقر — عند مرور المؤشّر أو التركيز على رابطها في الترويسة، فيكون الانتقال شبه فوري.
 * الصفحات العامة فقط: الاستوديو والإدارة لا تُسبق (ولا تدخل في التخطيطات التي تستورد هذا الملف — بلا دوائر).
 */
export const loaders = {
  '/tools/nasaq': () => import('./pages/nasaq'),
  '/tools/font-lab': () => import('./pages/font-lab'),
  '/tools/font-matching': () => import('./pages/font-matching'),
  '/tools/reverse-text': () => import('./pages/reverse-text'),
  '/manuscripts': () => import('./pages/manuscripts'),
  '/blog': () => import('./pages/blog'),
  '/cart': () => import('./pages/cart'),
  '/checkout': () => import('./pages/checkout'),
  '/notifications': () => import('./pages/notifications'),
  '/login': () => import('./pages/login'),
  '/register': () => import('./pages/register'),
} as const;

const started = new Set<string>();
export function preloadPage(href: string) {
  const path = href.split('?')[0]!;
  if (!(path in loaders) || started.has(path)) return;
  const key = path as keyof typeof loaders;
  started.add(key);
  void loaders[key]().catch(() => started.delete(key));
}
