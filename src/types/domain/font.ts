export const LANGS = ['ar', 'ku', 'fa', 'ur', 'la'] as const;
export const CATEGORIES = ['classic', 'headline', 'text', 'decorative', 'modern'] as const;
export const LICENSE_TYPES = ['free', 'trial', 'paid'] as const;

export type Lang = (typeof LANGS)[number];
export type Category = (typeof CATEGORIES)[number];
export type LicenseType = (typeof LICENSE_TYPES)[number];
/** personal: شخصي فقط — commercial: تجاري وشخصي */
export type Usage = 'personal' | 'commercial';

export type Designer = {
  id: string;
  nameAr: string;
  nameEn: string;
  initials: string;
};

/** خط له ملفات معاينة في الموقع: يُعرض بخطه الحقيقي (بطاقة، معرض، مختبر، أوزان) */
export type LiveFace = {
  /** اسم العائلة في CSS — يطابق @font-face في assets/fonts/library */
  family: string;
  nameAr: string;
  /** الأوزان الموجودة فعلاً — لا يُطلب غيرها */
  weights: number[];
};

export type Font = {
  id: string;
  name: string;
  designers: Designer[];
  /** عنوان المصمّمين كما يريده صاحب الخط (اختياري) */
  designerLabel?: string;
  weights: number;
  /** ملف متغيّر (Variable) — يُظهر عنوان «خط متغيّر» فوق شلال الأوزان */
  variable?: boolean;
  langs: Lang[];
  type: LicenseType;
  usage: Usage;
  category: Category;
  /** ISO date */
  releasedAt: string;
  popularity: number;
  /** بالدولار — 0 للمجاني */
  price: number;
  /** سعر قبل الخصم (للعرض) */
  compareAtPrice?: number;
  style?: string;
  tags?: string[];
  description?: string[];
  face?: LiveFace;
  /** ملف التحميل الكامل — للخطوط المجانية فقط (المدفوعة تُحمَّل بعد الشراء من الخادم) */
  download?: { url: string; bytes: number };
};
