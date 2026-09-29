import type { Designer } from './font';

export const MANUSCRIPT_CATEGORIES = [
  'panels',
  'ramadan',
  'eid',
  'mawlid',
  'jumua',
  'hijri',
  'greetings',
  'occasions',
] as const;
export type ManuscriptCategory = (typeof MANUSCRIPT_CATEGORIES)[number];

export const MANUSCRIPT_CATEGORY_LABEL: Record<ManuscriptCategory, string> = {
  panels: 'لوحات',
  ramadan: 'رمضان',
  eid: 'عيد',
  mawlid: 'مولد نبوي',
  jumua: 'جمعة',
  hijri: 'هجري',
  greetings: 'تهاني',
  occasions: 'مناسبات',
};

/** مخطوطة: عمل خطّي متجه (SVG) جاهز للتحميل — كلها مجانية حالياً */
export type Manuscript = {
  id: string;
  title: string;
  category: ManuscriptCategory;
  /** أبعاد الرسم — تحدّد ارتفاع البطاقة في التخطيط المتدفّق */
  width: number;
  height: number;
  bytes: number;
  url: string;
  /** الخطوط التي كُتب بها العمل (من مكتبة حرف) */
  fonts: { id: string; name: string }[];
  /** الخطّاط/المصمّم صاحب العمل */
  designer: Designer;
  downloads: number;
  createdAt: string;
  license: 'personal' | 'commercial';
};
