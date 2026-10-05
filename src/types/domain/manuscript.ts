import type { Designer } from './font';

/**
 * التصنيفات بسؤال المستخدم «لأيّ مناسبة؟» — خمسة لا تتداخل:
 * آيات وأذكار (لوحات تصلح لكل وقت) · رمضان · العيد · مناسبات إسلامية (المولد، الهجرة، الجمعة…) · تهاني ومناسبات.
 * التفصيل الأدقّ (جمعة، هجري…) يصل إليه البحث بالعنوان.
 */
export const MANUSCRIPT_CATEGORIES = ['panels', 'ramadan', 'eid', 'islamic', 'greetings'] as const;
export type ManuscriptCategory = (typeof MANUSCRIPT_CATEGORIES)[number];

export const MANUSCRIPT_CATEGORY_LABEL: Record<ManuscriptCategory, string> = {
  panels: 'آيات وأذكار',
  ramadan: 'رمضان',
  eid: 'العيد',
  islamic: 'مناسبات إسلامية',
  greetings: 'تهاني ومناسبات',
};

/** تصنيفات سابقة دُمجت — روابطها المشارَكة (?cat=) تفتح التصنيف الذي صارت فيه */
export const LEGACY_MANUSCRIPT_CATEGORY: Record<string, ManuscriptCategory> = {
  mawlid: 'islamic',
  hijri: 'islamic',
  jumua: 'islamic',
  occasions: 'greetings',
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
