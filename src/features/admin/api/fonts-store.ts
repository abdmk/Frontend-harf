import { z } from 'zod';

import { MOCK_FONTS } from '@/mocks/fonts';
import {
  applyEdit,
  type CatalogOverrides,
  FONT_NAME_MAX,
  getCatalogOverrides,
  saveCatalogOverrides,
  TAG_MAX,
  useCatalogOverrides,
} from '@/stores/catalog-overrides';
import { CATEGORIES, type Font } from '@/types/domain/font';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/**
 * «مخزن الخطوط»: كل خطوط المكتبة مع قرارات الإدارة وإحصاءاتها.
 * الإخفاء والحذف والتعديل تمرّ على catalog-overrides فيقرأها الموقع العام مباشرة.
 */
export type Visibility = 'visible' | 'hidden' | 'deleted';
export type FontStats = {
  views: number;
  downloads: number;
  favorites: number;
  sales: number;
  revenue: number;
  /** تحميلات يومية — آخر 30 يوماً */
  daily: number[];
};
export type StoreFont = { font: Font; original: Font; visibility: Visibility; featured: boolean; stats: FontStats };

/** أرقام تجريبية ثابتة لكل خط (مشتقّة من معرّفه وشعبيته) — في المنتج من جدول الإحصاءات */
export function fontStats(f: Font): FontStats {
  let h = 0;
  for (const c of f.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  // عشوائي ثابت بين 0 و1 لكل خط
  const r = () => ((h = (h * 1103515245 + 12345) >>> 0) % 10_000) / 10_000;
  const base = Math.max(40, f.popularity);
  const downloads = f.type === 'paid' ? Math.round(base * 0.4) : Math.round(base * (38 + r() * 20));
  const sales = f.type === 'paid' ? Math.round(base * (0.08 + r() * 0.06)) : 0;
  const daily = Array.from({ length: 30 }, (_, i) =>
    Math.max(0, Math.round((downloads / 30) * (0.6 + r() * 0.8) * (0.8 + (i / 30) * 0.4))),
  );
  return {
    views: Math.round(downloads * (3 + r() * 3)) + 200,
    downloads,
    favorites: Math.round(downloads * (0.05 + r() * 0.06)),
    sales,
    revenue: sales * f.price,
    daily,
  };
}

function visibilityOf(id: string, o: CatalogOverrides): Visibility {
  return o.deleted.includes(id) ? 'deleted' : o.hidden.includes(id) ? 'hidden' : 'visible';
}

export function useStoreFonts(): StoreFont[] {
  const o = useCatalogOverrides();
  return MOCK_FONTS.map((f) => ({
    font: applyEdit(f, o),
    original: f,
    visibility: visibilityOf(f.id, o),
    featured: o.featured.includes(f.id),
    stats: fontStats(f),
  }));
}

const KNOWN = new Set(MOCK_FONTS.map((f) => f.id));
const nameOf = (id: string) => applyEdit(MOCK_FONTS.find((f) => f.id === id)!).name;
const without = (list: string[], id: string) => list.filter((x) => x !== id);

function mutate(id: string, action: string, fn: (o: CatalogOverrides) => CatalogOverrides): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  if (!KNOWN.has(id)) return { ok: false, error: 'الخط غير موجود.' };
  if (!saveCatalogOverrides(fn(getCatalogOverrides()))) return { ok: false, error: 'تعذّر الحفظ.' };
  logAdmin(admin.name, action, nameOf(id));
  return { ok: true };
}

export function setHidden(id: string, hidden: boolean): AdminResult {
  return mutate(id, hidden ? 'إخفاء خط' : 'إظهار خط', (o) => ({
    ...o,
    hidden: hidden ? [...without(o.hidden, id), id] : without(o.hidden, id),
  }));
}

export function setFeatured(id: string, featured: boolean): AdminResult {
  return mutate(id, featured ? 'تمييز خط' : 'إلغاء تمييز خط', (o) => ({
    ...o,
    featured: featured ? [...without(o.featured, id), id] : without(o.featured, id),
  }));
}

/** الحذف ناعم ويتطلّب كتابة اسم الخط تأكيداً — يُسترجع من «المحذوفة» */
export function deleteFont(id: string, confirmName: string): AdminResult {
  if (KNOWN.has(id) && confirmName.trim() !== nameOf(id)) return { ok: false, error: 'اكتب اسم الخط كما هو للتأكيد.' };
  return mutate(id, 'حذف خط', (o) => ({
    ...o,
    deleted: [...without(o.deleted, id), id],
    featured: without(o.featured, id),
  }));
}

export function restoreFont(id: string): AdminResult {
  return mutate(id, 'استرجاع خط', (o) => ({ ...o, deleted: without(o.deleted, id) }));
}

export const editSchema = z.object({
  name: z.string().trim().min(2, 'الاسم قصير جداً.').max(FONT_NAME_MAX, `${FONT_NAME_MAX} حرفاً على الأكثر.`),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().min(0, 'سعر غير صالح.').max(10_000, 'سعر غير صالح.'),
  tags: z
    .string()
    .max(400)
    .transform((s) =>
      s
        .split(/[،,]/)
        .map((t) => t.trim())
        .filter(Boolean),
    )
    .refine((t) => t.length <= 12, '12 وسماً على الأكثر.')
    .refine((t) => t.every((x) => x.length <= TAG_MAX), `كل وسم ${TAG_MAX} حرفاً على الأكثر.`),
});

export type EditResult = AdminResult | { ok: false; error: string; field: string };

export function editFont(id: string, input: unknown): EditResult {
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i?.message ?? 'بيانات غير صالحة.', field: String(i?.path[0] ?? '') };
  }
  const font = MOCK_FONTS.find((f) => f.id === id);
  const { name, category, price, tags } = parsed.data;
  return mutate(id, 'تعديل خط', (o) => ({
    ...o,
    edits: {
      ...o.edits,
      [id]: { name, category, tags, ...(font && font.type !== 'free' ? { price } : {}) },
    },
  }));
}
