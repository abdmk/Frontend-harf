import type { Money } from './commerce';

export type Range = '7' | '30' | '365';

export type Kpi = { label: string; value: number; delta?: number; hint: string; trend: number[] };

export type AdminAnalytics = {
  updatedAt: string;
  kpis: { accounts: Kpi; visitors: Kpi; downloads: Kpi; subscribers: Kpi };
  revenue: {
    sales: {
      month: Money;
      delta: number;
      orders: number;
      avgOrder: Money;
      trend: number[];
      split: { label: string; value: number }[];
    };
    subscriptions: {
      mrr: Money;
      delta: number;
      arr: Money;
      trend: number[];
      split: { label: string; value: number }[];
    };
  };
  months: string[];
  salesByMonth: number[];
  subsByMonth: number[];
  days: string[];
  visitsByDay: number[];
  signupsByDay: number[];
  plans: { label: string; value: number }[];
  devices: { label: string; value: number }[];
  users: { id: string; name: string; email: string; plan: 'free' | 'basic' | 'studio'; joined: string }[];
  coverage: { complete: number; total: number };
  countries: { label: string; value: number }[];
  ages: { label: string; value: number }[];
  topWorks: { label: string; value: number }[];
  transactions: { id: string; buyer: string; kind: 'sale' | 'subscription'; when: string; amount: Money }[];
};

/** مدى تحليلات الاستوديو بالأيام */
export type StudioRange = '7' | '30' | '90';
export type StudioSeries = { labels: string[]; downloads: number[]; visits: number[]; users: number[] };

export type StudioAnalytics = {
  followers: Kpi;
  /** التغيّر ٪ مقارنةً بالمدّة السابقة لكل مدى */
  deltas: Record<StudioRange, { downloads: number; visits: number; users: number }>;
  series: Record<StudioRange, StudioSeries>;
  earnings: {
    available: Money;
    total: Money;
    pending: Money;
    paid: Money;
    nextPayout: string;
    lastPayout: string;
    bankLast4: string;
    minPayout: Money;
  };
};
