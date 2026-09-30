/* ══ دليل الحسابات والمسابك للإشارة (@) عند النشر — للعرض فقط ══════════════
   في المنتج: بحث في الخادم عن حسابات الاستوديو والمسابك الموثّقة، بحدّ للنتائج. */
import { MOCK_DESIGNERS } from './designers';
import { MOCK_FOUNDRY } from './studio';

export type DirectoryEntry = { id: string; name: string; handle: string; sub?: string };

const handleOf = (en: string) =>
  en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');

export const PEOPLE: DirectoryEntry[] = MOCK_DESIGNERS.map((d) => ({
  id: d.id,
  name: d.nameAr,
  handle: handleOf(d.nameEn),
  sub: d.role,
}));

export const FOUNDRIES: DirectoryEntry[] = [
  { id: MOCK_FOUNDRY.id, name: MOCK_FOUNDRY.name, handle: 'tajarib', sub: MOCK_FOUNDRY.location },
  { id: 'warraq', name: 'مسبك الورّاق', handle: 'warraq', sub: 'القاهرة، مصر' },
  { id: 'satr', name: 'استوديو سطر', handle: 'satr.studio', sub: 'عمّان، الأردن' },
  { id: 'kalima', name: 'Kalima Type', handle: 'kalima.type', sub: 'الرياض، السعودية' },
];
