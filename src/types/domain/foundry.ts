import type { Lang } from './font';

export type Foundry = {
  id: string;
  name: string;
  nameEn: string;
  mark: string;
  location: string;
  langs: Lang[];
  bio: string;
  followers: number;
  links: { website?: string; instagram?: string; behance?: string; x?: string; linkedin?: string };
  verified?: boolean;
};

export type ReviewStatus = 'published' | 'review' | 'rejected' | 'draft';

export type StudioFont = {
  id: string;
  name: string;
  status: ReviewStatus;
  /** المجاني لا يُعرض له بيع ولا أرباح */
  type: 'free' | 'paid';
  /** سعر الترخيص الأساسي بالدولار (للمدفوع) */
  price?: number;
  weights: number;
  updatedAt: string;
  note?: string;
  /** أرقام منذ النشر */
  downloads: number;
  visits: number;
  favorites: number;
  rating?: { value: number; count: number };
  sales?: number;
  revenueCents?: number;
};
