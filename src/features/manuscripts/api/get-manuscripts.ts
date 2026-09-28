import { MOCK_MANUSCRIPTS } from '@/mocks/manuscripts';
import { MANUSCRIPT_CATEGORIES, type Manuscript, type ManuscriptCategory } from '@/types/domain/manuscript';

export type Sort = 'newest' | 'popular';
export type ManuscriptQuery = { q: string; cat: ManuscriptCategory | 'all'; sort: Sort };

export const DEFAULT_QUERY: ManuscriptQuery = { q: '', cat: 'all', sort: 'newest' };

/** من الرابط إلى استعلام مضمون — أي قيمة غير معروفة تعود للافتراضي */
export function parseQuery(p: URLSearchParams): ManuscriptQuery {
  const cat = p.get('cat');
  return {
    q: (p.get('q') ?? '').slice(0, 80),
    cat: (MANUSCRIPT_CATEGORIES as readonly string[]).includes(cat ?? '') ? (cat as ManuscriptCategory) : 'all',
    sort: p.get('sort') === 'popular' ? 'popular' : 'newest',
  };
}

/** يزيل التشكيل والتطويل ويوحّد الهمزات — «رمضان» تطابق «رَمَضان» */
const normalize = (s: string) =>
  s
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();

/** اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها */
export function getManuscripts(q: ManuscriptQuery): Manuscript[] {
  const needle = normalize(q.q);
  return MOCK_MANUSCRIPTS.filter(
    (m) =>
      (q.cat === 'all' || m.category === q.cat) &&
      (!needle || normalize(m.title).includes(needle) || m.fonts.some((f) => normalize(f.name).includes(needle))),
  ).sort((a, b) => (q.sort === 'popular' ? b.downloads - a.downloads : b.createdAt.localeCompare(a.createdAt)));
}

export function countByCategory() {
  const out = new Map<ManuscriptCategory | 'all', number>([['all', MOCK_MANUSCRIPTS.length]]);
  for (const m of MOCK_MANUSCRIPTS) out.set(m.category, (out.get(m.category) ?? 0) + 1);
  return out;
}
