import { MOCK_MANUSCRIPTS } from '@/mocks/manuscripts';
import { MANUSCRIPT_CATEGORIES, type Manuscript, type ManuscriptCategory } from '@/types/domain/manuscript';

export type Sort = 'newest' | 'popular';
export type LicenseFilter = 'all' | Manuscript['license'];
export type ManuscriptQuery = {
  q: string;
  cat: ManuscriptCategory | 'all';
  sort: Sort;
  /** المحفوظة فقط */
  saved: boolean;
  license: LicenseFilter;
  /** معرّفات الخطوط (أيّ منها) */
  fonts: string[];
  /** معرّفات المصمّمين (أيّ منهم) */
  designers: string[];
};

export const DEFAULT_QUERY: ManuscriptQuery = {
  q: '',
  cat: 'all',
  sort: 'newest',
  saved: false,
  license: 'all',
  fonts: [],
  designers: [],
};

/** الخطوط والمصمّمون الموجودون فعلاً في الأعمال — خيارات لوحة التصفية ومرجع التحقّق من الرابط */
export const FONT_OPTIONS = uniq(MOCK_MANUSCRIPTS.flatMap((m) => m.fonts.map((f) => [f.id, f.name] as const)));
export const DESIGNER_OPTIONS = uniq(MOCK_MANUSCRIPTS.map((m) => [m.designer.id, m.designer.nameAr] as const));

function uniq(pairs: (readonly [string, string])[]) {
  return [...new Map(pairs)].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

/** قائمة من الرابط («a,b») لا تقبل إلا القيم المعروفة */
const list = (raw: string | null, known: readonly { id: string }[]) =>
  (raw ?? '').split(',').filter((id, i, all) => known.some((k) => k.id === id) && all.indexOf(id) === i);

/** من الرابط إلى استعلام مضمون — أي قيمة غير معروفة تعود للافتراضي */
export function parseQuery(p: URLSearchParams): ManuscriptQuery {
  const cat = p.get('cat');
  const lic = p.get('lic');
  return {
    q: (p.get('q') ?? '').slice(0, 80),
    cat: (MANUSCRIPT_CATEGORIES as readonly string[]).includes(cat ?? '') ? (cat as ManuscriptCategory) : 'all',
    sort: p.get('sort') === 'popular' ? 'popular' : 'newest',
    saved: p.get('view') === 'saved',
    license: lic === 'personal' || lic === 'commercial' ? lic : 'all',
    fonts: list(p.get('font'), FONT_OPTIONS),
    designers: list(p.get('by'), DESIGNER_OPTIONS),
  };
}

/** الاستعلام إلى معاملات الرابط — الافتراضي يُحذف ليبقى الرابط قصيراً */
export function toParams(q: Partial<ManuscriptQuery>): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  if ('q' in q) out.q = q.q || null;
  if ('cat' in q) out.cat = q.cat === 'all' ? null : q.cat!;
  if ('sort' in q) out.sort = q.sort === 'newest' ? null : q.sort!;
  if ('saved' in q) out.view = q.saved ? 'saved' : null;
  if ('license' in q) out.lic = q.license === 'all' ? null : q.license!;
  if ('fonts' in q) out.font = q.fonts!.length ? q.fonts!.join(',') : null;
  if ('designers' in q) out.by = q.designers!.length ? q.designers!.join(',') : null;
  return out;
}

/** عدد ما تغيّر في لوحة التصفية — يظهر على زرّ «تصفية» */
export const activeFilterCount = (q: ManuscriptQuery) =>
  Number(q.saved) + Number(q.license !== 'all') + q.fonts.length + q.designers.length;

/** يزيل التشكيل والتطويل ويوحّد الهمزات — «رمضان» تطابق «رَمَضان» */
const normalize = (s: string) =>
  s
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();

/** اليوم من البيانات التجريبية، ولاحقاً من الـAPI بالواجهة نفسها. `savedIds` من التخزين المحلي */
export function getManuscripts(q: ManuscriptQuery, savedIds: ReadonlySet<string> = new Set()): Manuscript[] {
  const needle = normalize(q.q);
  return MOCK_MANUSCRIPTS.filter(
    (m) =>
      (q.cat === 'all' || m.category === q.cat) &&
      (!q.saved || savedIds.has(m.id)) &&
      (q.license === 'all' || m.license === q.license) &&
      (!q.fonts.length || m.fonts.some((f) => q.fonts.includes(f.id))) &&
      (!q.designers.length || q.designers.includes(m.designer.id)) &&
      (!needle ||
        normalize(m.title).includes(needle) ||
        normalize(m.designer.nameAr).includes(needle) ||
        m.fonts.some((f) => normalize(f.name).includes(needle))),
  ).sort((a, b) => (q.sort === 'popular' ? b.downloads - a.downloads : b.createdAt.localeCompare(a.createdAt)));
}

export function countByCategory() {
  const out = new Map<ManuscriptCategory | 'all', number>([['all', MOCK_MANUSCRIPTS.length]]);
  for (const m of MOCK_MANUSCRIPTS) out.set(m.category, (out.get(m.category) ?? 0) + 1);
  return out;
}
