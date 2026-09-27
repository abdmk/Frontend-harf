/** المستخدم كما تعيده طبقة المصادقة — نوع مشترك بين lib والـfeatures */
export const PLANS = ['free', 'basic', 'studio'] as const;
export type Plan = (typeof PLANS)[number];

/** عدّاد استخدام بحدّ دوري (يُحسب على الخادم) */
export type UsageMeter = { used: number; limit: number | null };

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  /** صورة شخصية (مسار داخلي) — بدونها تُعرض الأحرف الأولى */
  avatarUrl?: string;
  plan: Plan;
  profession?: string;
  location?: string;
  website?: string;
  memberSince: string;
  stats: { library: number; favorites: number; purchases: number; usagePct: number };
  usage: { downloads: UsageMeter; matching: UsageMeter; resetsInHours: number };
};
