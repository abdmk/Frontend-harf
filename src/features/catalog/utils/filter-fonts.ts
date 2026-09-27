import type { CatalogQuery } from '@/features/catalog/types/catalog-query';
import type { Font } from '@/types/domain/font';

const DAY = 864e5;

/** يطابق الخطوط مع الاستعلام ويرتّبها. دالة نقية: تُستعمل على الخادم وتُختبر وحدها. */
export function filterFonts(fonts: readonly Font[], q: CatalogQuery, now: Date = new Date()): Font[] {
  const needle = q.q.toLowerCase();
  const out = fonts.filter((f) => {
    if (q.cat !== 'all' && f.category !== q.cat) return false;
    if (needle) {
      const hay = [f.name, f.designerLabel ?? '', ...f.designers.flatMap((d) => [d.nameAr, d.nameEn])]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (q.license === 'personal' && f.usage !== 'personal') return false;
    if (q.license === 'commercial' && f.usage !== 'commercial') return false;
    if (q.license === 'paid' && f.type === 'free') return false;
    if (q.lang.length && !q.lang.every((l) => f.langs.includes(l))) return false;
    if (q.date !== 'all') {
      const released = new Date(f.releasedAt);
      if (q.date === 'year') {
        if (released.getUTCFullYear() !== now.getUTCFullYear()) return false;
      } else if ((now.getTime() - released.getTime()) / DAY > Number(q.date)) return false;
    }
    if (q.price && (f.price < q.price[0] || f.price > q.price[1])) return false;
    if (q.weights && (f.weights < q.weights[0] || f.weights > q.weights[1])) return false;
    return true;
  });
  return out.sort((a, b) =>
    q.sort === 'newest' ? Date.parse(b.releasedAt) - Date.parse(a.releasedAt) : b.popularity - a.popularity,
  );
}

/** عدد الفلاتر المفعّلة في لوحة التصفية (لا يشمل التصنيف والبحث والترتيب) */
export function activeFilterCount(q: CatalogQuery): number {
  return (
    q.lang.length + Number(q.license !== 'all') + Number(q.date !== 'all') + Number(!!q.price) + Number(!!q.weights)
  );
}
