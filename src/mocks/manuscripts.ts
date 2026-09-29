/* مخطوطات تجريبية مولَّدة من خطوط مكتبة حرف المجانية (scripts/generate-manuscripts.mjs)
   حتى تُرفع الأعمال الحقيقية. أرقام التحميل والتواريخ تجريبية. */
import type { Manuscript, ManuscriptCategory } from '@/types/domain/manuscript';

import { MOCK_DESIGNERS } from './designers';
import data from './manuscripts.data.json';

const DAY = 864e5;
const seed = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// المصمّمون من ملفات المصمّمين التجريبية — ثابتون لكل عمل
const PEOPLE = MOCK_DESIGNERS.filter((d) => d.id !== 'harf-type').map(({ id, nameAr, nameEn, initials }) => ({
  id,
  nameAr,
  nameEn,
  initials,
}));

export const MOCK_MANUSCRIPTS: Manuscript[] = data.map((m, i) => ({
  ...m,
  designer: PEOPLE[seed(m.id) % PEOPLE.length]!,
  category: m.category as ManuscriptCategory,
  url: `/manuscripts/${m.id}.svg`,
  downloads: 40 + (seed(m.id) % 2400),
  createdAt: new Date(Date.now() - (i * 3 + (seed(m.id) % 3)) * DAY).toISOString(),
  license: i % 3 === 0 ? 'commercial' : 'personal',
}));
