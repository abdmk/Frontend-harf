/** المستخدم كما تعيده طبقة المصادقة — نوع مشترك بين lib والـfeatures */
export type Plan = 'free' | 'studio';

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  plan: Plan;
  stats: { library: number; favorites: number; purchases: number; usagePct: number };
};
