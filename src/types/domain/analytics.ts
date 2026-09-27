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

export type StudioAnalytics = {
  downloads: Kpi;
  followers: Kpi;
  published: { total: number; free: number; paid: number };
  rating: { value: number; count: number };
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
  days: string[];
  downloadsByDay: number[];
  topFonts: { label: string; value: number }[];
};
