import { asObject, asStrings, createJsonStore } from '@/lib/json-store';
import { CATEGORIES, type Category, type Font } from '@/types/domain/font';


/**
 * قرارات الإدارة على خطوط المكتبة (مخزن الخطوط): الإخفاء، الحذف، التمييز، والتعديلات.
 * المكتبة العامة وصفحة الخط تقرآن من هنا، فيظهر أثر قرار المشرف فوراً في الموقع.
 * ⚠️ عرض: في المنتج هذه أعمدة في قاعدة البيانات، والخادم وحده يغيّرها بعد التحقّق من دور المشرف.
 */
export type FontEdit = { name?: string; category?: Category; price?: number; tags?: string[] };
export type CatalogOverrides = {
  hidden: string[];
  /** حذف ناعم: يختفي من الموقع ويبقى قابلاً للاسترجاع من «المحذوفة» */
  deleted: string[];
  featured: string[];
  edits: Record<string, FontEdit>;
};

export const EMPTY_OVERRIDES: CatalogOverrides = { hidden: [], deleted: [], featured: [], edits: {} };
export const FONT_NAME_MAX = 60;
export const TAG_MAX = 24;

function parseEdit(x: unknown): FontEdit {
  const o = asObject(x);
  const e: FontEdit = {};
  if (typeof o.name === 'string' && o.name.trim() && o.name.length <= FONT_NAME_MAX) e.name = o.name.trim();
  if (typeof o.category === 'string' && (CATEGORIES as readonly string[]).includes(o.category))
    e.category = o.category as Category;
  if (typeof o.price === 'number' && Number.isFinite(o.price) && o.price >= 0 && o.price <= 10_000) e.price = o.price;
  if (Array.isArray(o.tags))
    e.tags = o.tags.filter((t): t is string => typeof t === 'string' && t.length <= TAG_MAX).slice(0, 12);
  return e;
}

const store = createJsonStore<CatalogOverrides>(
  'harf_catalog_overrides',
  (x) => {
    const o = asObject(x);
    const edits: Record<string, FontEdit> = {};
    for (const [id, e] of Object.entries(asObject(o.edits)).slice(0, 500))
      if (/^[a-z0-9-]{1,64}$/.test(id)) edits[id] = parseEdit(e);
    return { hidden: asStrings(o.hidden), deleted: asStrings(o.deleted), featured: asStrings(o.featured), edits };
  },
  EMPTY_OVERRIDES,
);

export const getCatalogOverrides = store.get;
export const saveCatalogOverrides = store.set;
export const useCatalogOverrides = store.use;

/** الخط بعد تعديلات الإدارة */
export function applyEdit(font: Font, o: CatalogOverrides = store.get()): Font {
  const e = o.edits[font.id];
  if (!e) return font;
  return {
    ...font,
    ...(e.name ? { name: e.name } : {}),
    ...(e.category ? { category: e.category } : {}),
    ...(e.price !== undefined && font.type !== 'free' ? { price: e.price } : {}),
    ...(e.tags ? { tags: e.tags } : {}),
  };
}

/** ما يراه الزوّار: بلا المخفي والمحذوف، وبالتعديلات */
export function publicFonts(all: Font[]): Font[] {
  const o = store.get();
  const off = new Set([...o.hidden, ...o.deleted]);
  return all.filter((f) => !off.has(f.id)).map((f) => applyEdit(f, o));
}

export function isPubliclyVisible(id: string): boolean {
  const o = store.get();
  return !o.hidden.includes(id) && !o.deleted.includes(id);
}
