/* ══ بيانات تجريبية للاستوديو والتحليلات — أرقام عرض فقط ══════════════════
   الأسماء والبريد خياليّة تماماً (example.com) — لا تُنسخ بيانات أشخاص حقيقيين إلى الشيفرة. */
import type { AdminAnalytics, StudioAnalytics } from '@/types/domain/analytics';
import { cents } from '@/types/domain/commerce';
import type { Foundry, StudioFont } from '@/types/domain/foundry';

/** سلسلة زمنية ثابتة (بلا عشوائية) كي لا تختلف بين الخادم والمتصفّح */
function wave(n: number, base: number, amp: number, seed: number, peakAt?: number) {
  return Array.from({ length: n }, (_, i) => {
    const v = base + amp * Math.sin((i + seed) / 3.1) + amp * 0.4 * Math.cos((i * seed) / 5.3);
    const spike = peakAt !== undefined && Math.abs(i - peakAt) < 2 ? amp * (2.6 - Math.abs(i - peakAt)) : 0;
    return Math.max(0, Math.round(v + spike));
  });
}

/** اتجاه صاعد بتذبذب خفيف — لخطوط الاتجاه في بطاقات الأرقام */
function rising(n: number, from: number, to: number, seed: number) {
  return Array.from({ length: n }, (_, i) =>
    Math.round(from + ((to - from) * i) / (n - 1) + Math.sin(i * seed) * (to - from) * 0.08),
  );
}

const DAYS_AR = Array.from({ length: 30 }, (_, i) => `${((i + 9) % 30) + 1} ${i < 21 ? 'آب' : 'أيلول'}`);

export const MOCK_FOUNDRY: Foundry = {
  id: 'tajarib',
  name: 'مسبك تجاريب',
  nameEn: 'Tajarib Type Foundry',
  mark: 'ت',
  location: 'بغداد، العراق',
  langs: ['ar', 'ku', 'la'],
  bio: 'استوديو عربي مستقلّ متخصّص في خطوط العناوين والهوية البصرية. نصمّم عائلات عربية معاصرة تُوازن بين أصالة الحرف ومتطلّبات الشاشة، ونتعاون مع علامات إقليمية على هويّاتها الكتابية.',
  followers: 12480,
  links: { website: 'https://harf.co', instagram: 'https://instagram.com/', behance: 'https://behance.net/' },
  verified: true,
};

export const MOCK_STUDIO_FONTS: StudioFont[] = [
  {
    id: 'tajarib',
    name: 'تجاريب',
    status: 'published',
    type: 'free',
    weights: 5,
    updatedAt: '2026-09-02',
    downloads: 21340,
    visits: 64120,
    favorites: 3210,
    rating: { value: 4.9, count: 612 },
  },
  {
    id: 'nuqta',
    name: 'نقطة',
    status: 'published',
    type: 'free',
    weights: 6,
    updatedAt: '2026-08-12',
    downloads: 17595,
    visits: 51870,
    favorites: 2455,
    rating: { value: 4.7, count: 388 },
  },
  {
    id: 'rawi',
    name: 'رواق',
    status: 'published',
    type: 'paid',
    price: 420,
    weights: 9,
    updatedAt: '2026-08-21',
    downloads: 8420,
    visits: 38450,
    favorites: 1890,
    rating: { value: 4.8, count: 142 },
    sales: 38,
    revenueCents: 1_311_800,
  },
  {
    id: 'naskh',
    name: 'نسخ الحديث',
    status: 'published',
    type: 'paid',
    price: 49,
    weights: 4,
    updatedAt: '2026-07-30',
    downloads: 5485,
    visits: 22760,
    favorites: 940,
    rating: { value: 4.6, count: 62 },
    sales: 121,
    revenueCents: 578_200,
  },
  {
    id: 'naqsh',
    name: 'نقش',
    status: 'review',
    type: 'paid',
    price: 260,
    weights: 3,
    updatedAt: '2026-09-20',
    downloads: 0,
    visits: 0,
    favorites: 0,
  },
  {
    id: 'midad',
    name: 'مِداد',
    status: 'rejected',
    type: 'free',
    weights: 2,
    updatedAt: '2026-09-11',
    note: 'ملف Bold ناقص المحارف الكردية.',
    downloads: 0,
    visits: 0,
    favorites: 0,
  },
  {
    id: 'tufula',
    name: 'خطّ طفولة',
    status: 'draft',
    type: 'free',
    weights: 4,
    updatedAt: '2026-09-25',
    downloads: 0,
    visits: 0,
    favorites: 0,
  },
];

/** سلسلة يومية تنتهي اليوم (30 سبتمبر 2026) — التسميات «يوم شهر» بالعربية */
function studioSeries(days: number, seed: number) {
  const end = Date.UTC(2026, 8, 30);
  const labels = Array.from({ length: days }, (_, i) =>
    new Date(end - (days - 1 - i) * 86_400_000).toLocaleDateString('ar', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    }),
  );
  const downloads = wave(days, 1700, 260, seed, days > 20 ? days - 6 : undefined);
  return {
    labels,
    downloads,
    visits: downloads.map((d, i) => Math.round(d * (3.4 + 0.35 * Math.sin((i + seed) / 4)))),
    users: downloads.map((d, i) => Math.round(d * (0.62 + 0.05 * Math.cos((i * seed) / 6)))),
  };
}

export const MOCK_STUDIO_ANALYTICS: StudioAnalytics = {
  followers: { label: 'المتابعون', value: 12480, delta: 312, hint: 'خلال آخر 30 يوماً', trend: rising(12, 25, 35, 5) },
  deltas: {
    '7': { downloads: 4.1, visits: 6.3, users: 3.2 },
    '30': { downloads: 9.2, visits: 11.8, users: 7.5 },
    '90': { downloads: 21.4, visits: 18.9, users: 16.2 },
  },
  series: { '7': studioSeries(7, 1), '30': studioSeries(30, 1), '90': studioSeries(90, 2) },
  earnings: {
    available: cents(128450),
    total: cents(1894000),
    pending: cents(0),
    paid: cents(1765550),
    nextPayout: '2026-10-11',
    lastPayout: '2026-09-27',
    bankLast4: '4471',
    minPayout: cents(5000),
  },
};

const NAMES = [
  ['نور الهدى سالم', 'studio'],
  ['Lina Haddad', 'free'],
  ['كريم يوسف', 'basic'],
  ['Omar Farouk', 'free'],
  ['سارة منصور', 'free'],
  ['Yara Khalil', 'basic'],
  ['حسين عادل', 'free'],
  ['Maya Saad', 'free'],
  ['رنا طارق', 'studio'],
  ['Ali Hameed', 'free'],
  ['دينا فؤاد', 'free'],
  ['Zaid Kareem', 'free'],
  ['ليلى جواد', 'basic'],
  ['Sami Nour', 'free'],
] as const;

export const MOCK_ADMIN_ANALYTICS: AdminAnalytics = {
  updatedAt: '2026-09-27T08:40:00Z',
  kpis: {
    accounts: {
      label: 'الحسابات',
      value: 1500,
      delta: 1465,
      hint: '1,465 حساباً جديداً خلال 30 يوماً',
      trend: rising(12, 8, 32, 3),
    },
    visitors: { label: 'الزوار', value: 1402, hint: '2,232 جلسة · 1.6 جلسة لكل زائر', trend: rising(12, 20, 40, 7) },
    downloads: { label: 'التحميلات', value: 46250, hint: '31 تحميلاً لكل حساب وسطياً', trend: rising(12, 44, 56, 4) },
    subscribers: {
      label: 'المشتركون',
      value: 88,
      hint: '68 على الأساسية · 20 استوديو · 5.9% من الحسابات',
      trend: rising(12, 4, 8, 9),
    },
  },
  revenue: {
    sales: {
      month: cents(346000),
      delta: 11,
      orders: 214,
      avgOrder: cents(1600),
      trend: rising(12, 22, 34, 1),
      split: [
        { label: 'خطوط', value: 2740 },
        { label: 'مخطوطات', value: 720 },
      ],
    },
    subscriptions: {
      mrr: cents(84000),
      delta: 8,
      arr: cents(1008000),
      trend: rising(12, 17, 23, 6),
      split: [
        { label: 'الأساسية', value: 340 },
        { label: 'الاستوديو', value: 500 },
      ],
    },
  },
  months: ['أبريل', 'مايو', 'يونيو', 'يوليو', 'آب', 'أيلول'],
  salesByMonth: [1810, 2140, 1990, 2720, 3110, 3460],
  subsByMonth: [420, 480, 530, 610, 780, 840],
  days: DAYS_AR,
  visitsByDay: wave(30, 60, 25, 2, 21),
  signupsByDay: wave(30, 40, 18, 4, 18),
  plans: [
    { label: 'مجانية', value: 1412 },
    { label: 'الأساسية', value: 68 },
    { label: 'الاستوديو', value: 20 },
  ],
  devices: [
    { label: 'حاسوب', value: 1709 },
    { label: 'جوال', value: 523 },
  ],
  users: NAMES.map(([name, plan], i) => ({
    id: `u${i + 1}`,
    name,
    email: `user${i + 1}@example.com`,
    plan,
    joined: `2026-09-${String(8 - (i % 7)).padStart(2, '0')}`,
  })),
  coverage: { complete: 225, total: 1500 },
  countries: [
    { label: 'العراق', value: 61 },
    { label: 'السعودية', value: 54 },
    { label: 'مصر', value: 38 },
    { label: 'الأردن', value: 17 },
    { label: 'المغرب', value: 14 },
    { label: 'الإمارات', value: 11 },
  ],
  ages: [
    { label: '18–24', value: 96 },
    { label: '25–34', value: 95 },
    { label: '35–44', value: 24 },
    { label: '45+', value: 10 },
  ],
  topWorks: [
    { label: 'تجاريب', value: 920 },
    { label: 'رواق', value: 640 },
    { label: 'Naskh Hadith', value: 410 },
    { label: 'مخطوطة «أثر»', value: 260 },
  ],
  transactions: [
    { id: 'T-1042', buyer: 'كريم يوسف', kind: 'sale', when: 'قبل ساعة', amount: cents(4900) },
    { id: 'T-1041', buyer: 'Yara Khalil', kind: 'subscription', when: 'قبل 3 ساعات', amount: cents(1000) },
    { id: 'T-1040', buyer: 'رنا طارق', kind: 'subscription', when: 'أمس', amount: cents(2000) },
    { id: 'T-1039', buyer: 'Omar Farouk', kind: 'sale', when: 'أمس', amount: cents(1800) },
    { id: 'T-1038', buyer: 'ليلى جواد', kind: 'sale', when: 'قبل يومين', amount: cents(6400) },
  ],
};

/* ══ مبيعات ودفعات المسبك — أرقام عرض فقط ══════════════════════════════════ */

export type MockSale = {
  id: string;
  fontId: string;
  fontName: string;
  license: string;
  /** المشتري مقنّع — الناشر لا يرى بيانات المشترين كاملة (تقليل البيانات) */
  buyer: string;
  /** YYYY-MM-DD */
  date: string;
  grossCents: number;
  status: 'completed' | 'pending' | 'refunded';
};

export const MOCK_SALES: MockSale[] = [
  {
    id: 'S-24931',
    fontId: 'rawi',
    fontName: 'رواق',
    license: 'تجاري',
    buyer: 'ن*** س.',
    date: '2026-09-29',
    grossCents: 42000,
    status: 'pending',
  },
  {
    id: 'S-24918',
    fontId: 'naskh',
    fontName: 'نسخ الحديث',
    license: 'شخصي',
    buyer: 'L*** H.',
    date: '2026-09-27',
    grossCents: 4900,
    status: 'pending',
  },
  {
    id: 'S-24880',
    fontId: 'rawi',
    fontName: 'رواق',
    license: 'هوية بصرية',
    buyer: 'ك*** ي.',
    date: '2026-09-22',
    grossCents: 84000,
    status: 'pending',
  },
  {
    id: 'S-24811',
    fontId: 'naskh',
    fontName: 'نسخ الحديث',
    license: 'تجاري',
    buyer: 'O*** F.',
    date: '2026-09-15',
    grossCents: 18000,
    status: 'completed',
  },
  {
    id: 'S-24790',
    fontId: 'rawi',
    fontName: 'رواق',
    license: 'شخصي',
    buyer: 'س*** م.',
    date: '2026-09-12',
    grossCents: 21000,
    status: 'refunded',
  },
  {
    id: 'S-24702',
    fontId: 'rawi',
    fontName: 'رواق',
    license: 'تجاري',
    buyer: 'Y*** K.',
    date: '2026-09-08',
    grossCents: 42000,
    status: 'completed',
  },
  {
    id: 'S-24655',
    fontId: 'naskh',
    fontName: 'نسخ الحديث',
    license: 'مواقع إلكترونية',
    buyer: 'ح*** ع.',
    date: '2026-09-03',
    grossCents: 35000,
    status: 'completed',
  },
  {
    id: 'S-24590',
    fontId: 'rawi',
    fontName: 'رواق',
    license: 'هوية بصرية',
    buyer: 'M*** S.',
    date: '2026-08-28',
    grossCents: 84000,
    status: 'completed',
  },
  {
    id: 'S-24533',
    fontId: 'naskh',
    fontName: 'نسخ الحديث',
    license: 'شخصي',
    buyer: 'ر*** ط.',
    date: '2026-08-21',
    grossCents: 4900,
    status: 'completed',
  },
  {
    id: 'S-24470',
    fontId: 'rawi',
    fontName: 'رواق',
    license: 'تجاري',
    buyer: 'A*** H.',
    date: '2026-08-14',
    grossCents: 42000,
    status: 'completed',
  },
];

export type MockPayout = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  amountCents: number;
  status: 'paid' | 'processing' | 'failed';
};

export const MOCK_PAYOUTS: MockPayout[] = [
  { id: 'P-1108', date: '2026-09-27', amountCents: 116900, status: 'paid' },
  { id: 'P-1093', date: '2026-09-13', amountCents: 142300, status: 'paid' },
  { id: 'P-1071', date: '2026-08-30', amountCents: 98750, status: 'paid' },
  { id: 'P-1052', date: '2026-08-16', amountCents: 121500, status: 'paid' },
  { id: 'P-1034', date: '2026-08-02', amountCents: 87400, status: 'failed' },
  { id: 'P-1033', date: '2026-08-04', amountCents: 87400, status: 'paid' },
];
