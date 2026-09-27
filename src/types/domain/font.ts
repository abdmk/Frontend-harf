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

export type Font = {
  id: string;
  name: string;
  designers: Designer[];
  /** عنوان المصمّمين كما يريده صاحب الخط (اختياري) */
  designerLabel?: string;
  weights: number;
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
};
