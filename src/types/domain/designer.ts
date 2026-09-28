import type { Designer } from './font';

/** ملف المصمّم العام — يمتدّ من اسم المصمّم في بيانات الخط */
export type DesignerProfile = Designer & {
  role: string;
  location: string;
  bio: string;
  followers: number;
  verified?: boolean;
  /** المسبك الذي ينشر معه (إن وُجد) */
  foundryId?: string;
  links: { website?: string; instagram?: string; behance?: string };
};
