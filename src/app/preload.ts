/**
 * تنزيل حزمة الصفحة قبل النقر — عند مرور المؤشّر أو التركيز على رابطها في الترويسة، فيكون الانتقال شبه فوري.
 * الصفحات العامة فقط: الاستوديو والإدارة لا تُسبق (ولا تدخل في التخطيطات التي تستورد هذا الملف — بلا دوائر).
 */
export const loaders = {
  '/tools/nasaq': () => import('./routes/nasaq'),
  '/tools/font-lab': () => import('./routes/font-lab'),
  '/tools/font-matching': () => import('./routes/font-matching'),
  '/tools/reverse-text': () => import('./routes/reverse-text'),
  '/manuscripts': () => import('./routes/manuscripts'),
  '/blog': () => import('./routes/blog'),
  '/cart': () => import('./routes/cart'),
  '/checkout': () => import('./routes/checkout'),
  '/notifications': () => import('./routes/notifications'),
  '/login': () => import('./routes/login'),
  '/register': () => import('./routes/register'),
} as const;

const started = new Set<string>();
export function preloadPage(href: string) {
  const path = href.split('?')[0]!;
  if (!(path in loaders) || started.has(path)) return;
  const key = path as keyof typeof loaders;
  started.add(key);
  void loaders[key]().catch(() => started.delete(key));
}
