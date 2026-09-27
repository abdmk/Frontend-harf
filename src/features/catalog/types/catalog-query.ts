import { z } from 'zod';

import { CATEGORIES, LANGS } from '@/types/domain/font';

export const PRICE_STOPS = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] as const;
export const WEIGHT_STOPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const DATE_RANGES = ['all', '7', '30', '180', 'year'] as const;
export const LICENSE_FILTERS = ['all', 'personal', 'commercial', 'paid'] as const;
export const SORTS = ['popular', 'newest'] as const;

export type DateRange = (typeof DATE_RANGES)[number];
export type LicenseFilter = (typeof LICENSE_FILTERS)[number];
export type Sort = (typeof SORTS)[number];

/** «lo-hi» داخل حدود معروفة، وإلا فلا فلتر */
const range = (stops: readonly number[]) =>
  z
    .string()
    .regex(/^\d{1,4}-\d{1,4}$/)
    .transform((v) => v.split('-').map(Number) as [number, number])
    .refine(([lo, hi]) => stops.includes(lo) && stops.includes(hi) && lo <= hi)
    .optional()
    .catch(undefined);

/**
 * يقرأ معاملات الرابط ويتحقّق منها على الخادم. أي قيمة غير صالحة تُهمَل بصمت
 * (تعود للافتراضي) — الرابط مدخل من المستخدم ولا يُوثق به.
 */
export const catalogQuerySchema = z.object({
  cat: z.enum(['all', ...CATEGORIES]).catch('all'),
  q: z
    .string()
    .trim()
    .max(80)
    .catch('')
    .transform((v) => v.slice(0, 80)),
  sort: z.enum(SORTS).catch('popular'),
  license: z.enum(LICENSE_FILTERS).catch('all'),
  lang: z
    .string()
    .transform((v) => v.split(',').filter((x): x is (typeof LANGS)[number] => (LANGS as readonly string[]).includes(x)))
    .catch([]),
  date: z.enum(DATE_RANGES).catch('all'),
  price: range(PRICE_STOPS),
  weights: range(WEIGHT_STOPS),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export function parseCatalogQuery(raw: Record<string, string | string[] | undefined>): CatalogQuery {
  const flat = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return catalogQuerySchema.parse({
    cat: flat.cat ?? 'all',
    q: flat.q ?? '',
    sort: flat.sort ?? 'popular',
    license: flat.license ?? 'all',
    lang: flat.lang ?? '',
    date: flat.date ?? 'all',
    price: flat.price,
    weights: flat.weights,
  });
}

/** يحوّل الحالة إلى معاملات رابط، ويحذف الافتراضي ليبقى الرابط نظيفاً */
export function toSearchParams(q: CatalogQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.cat !== 'all') p.set('cat', q.cat);
  if (q.q) p.set('q', q.q);
  if (q.sort !== 'popular') p.set('sort', q.sort);
  if (q.license !== 'all') p.set('license', q.license);
  if (q.lang.length) p.set('lang', q.lang.join(','));
  if (q.date !== 'all') p.set('date', q.date);
  if (q.price) p.set('price', q.price.join('-'));
  if (q.weights) p.set('weights', q.weights.join('-'));
  return p;
}

export const DEFAULT_QUERY: CatalogQuery = parseCatalogQuery({});
