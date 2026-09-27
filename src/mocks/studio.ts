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
  { id: 'tajarib', name: 'تجاريب', status: 'published', weights: 5, downloads: 21340, updatedAt: '2026-09-02' },
  { id: 'rawi', name: 'رواق', status: 'published', weights: 7, downloads: 13905, updatedAt: '2026-08-21' },
  { id: 'naqsh', name: 'نقش', status: 'review', weights: 3, downloads: 0, updatedAt: '2026-09-20' },
  {
    id: 'midad',
    name: 'مِداد',
    status: 'rejected',
    weights: 2,
    downloads: 0,
    updatedAt: '2026-09-11',
    note: 'ملف Bold ناقص المحارف الكردية.',
  },
  { id: 'tufula', name: 'خطّ طفولة', status: 'draft', weights: 4, downloads: 0, updatedAt: '2026-09-25' },
];

export const MOCK_STUDIO_ANALYTICS: StudioAnalytics = {
  downloads: {
    label: 'تحميلات خطوطه',
    value: 52840,
    delta: 9.2,
    hint: 'مقارنةً بالشهر الماضي',
    trend: rising(12, 32, 48, 2),
  },
  followers: { label: 'المتابعون', value: 12480, delta: 312, hint: 'خلال آخر 30 يوماً', trend: rising(12, 25, 35, 5) },
  published: { total: 18, free: 4, paid: 14 },
  rating: { value: 4.8, count: 1204 },
  earnings: {
    available: cents(128450),
    total: cents(1894000),
    pending: cents(0),
    paid: cents(1765550),
    nextPayout: '2026-09-27',
    lastPayout: '2026-09-13',
    bankLast4: '4471',
    minPayout: cents(5000),
  },
  days: DAYS_AR,
  downloadsByDay: wave(30, 1700, 260, 1, 24),
  topFonts: [
    { label: 'تجاريب', value: 21340 },
    { label: 'رواق', value: 13905 },
    { label: 'نقش', value: 9120 },
    { label: 'مِداد', value: 5410 },
  ],
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
  months: ['نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول'],
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
