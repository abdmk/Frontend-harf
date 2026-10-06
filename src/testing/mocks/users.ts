/* بيانات تجريبية — تُستبدل بجلسة حقيقية (انظر src/lib/auth.ts).
   الحدود (تحميلات/مطابقات) أمثلة للعرض، لا قرارات. */
import type { User } from '@/types/domain/user';

export const MOCK_USERS = {
  free: {
    id: 'u-heba',
    name: 'هبة عبدالحميد',
    email: 'heda.abed@gmail.com',
    initials: 'HA',
    avatarUrl: '/avatars/heba.webp',
    plan: 'free',
    role: 'user',
    profession: 'مصممة جرافيك',
    location: 'بغداد، العراق',
    memberSince: '2026-03-12',
    stats: { library: 12, favorites: 32, purchases: 4, usagePct: 65 },
    usage: { downloads: { used: 5, limit: 5 }, matching: { used: 2, limit: 3 }, resetsInHours: 3 },
  },
  basic: {
    id: 'u-saad',
    name: 'سعد زياد',
    email: 's.zeyad@gmail.com',
    initials: 'SZ',
    plan: 'basic',
    role: 'user',
    profession: 'مصمم هويات',
    location: 'أربيل، العراق',
    memberSince: '2025-11-02',
    stats: { library: 12, favorites: 32, purchases: 4, usagePct: 65 },
    usage: { downloads: { used: 38, limit: null }, matching: { used: 11, limit: null }, resetsInHours: 3 },
  },
  studio: {
    id: 'u-abdmk',
    name: 'عبدالملك جاسم',
    email: 'abdmk.jassim@gmail.com',
    initials: 'AJ',
    avatarUrl: '/avatars/abdulmalik.webp',
    plan: 'studio',
    role: 'user',
    profession: 'مصمم جرافيك وهويات',
    location: 'بغداد، العراق',
    website: 'https://harf.co',
    memberSince: '2025-07-27',
    stats: { library: 12, favorites: 32, purchases: 4, usagePct: 65 },
    usage: { downloads: { used: 52, limit: null }, matching: { used: 20, limit: null }, resetsInHours: 3 },
  },
  // مشرف المنصّة — حساب منفصل: خطة الاستوديو لا تمنح صلاحيات الإدارة
  admin: {
    id: 'u-admin',
    name: 'فريق حرف',
    email: 'admin@harf.co',
    initials: 'HF',
    plan: 'studio',
    role: 'admin',
    profession: 'إدارة المنصّة',
    location: 'بغداد، العراق',
    website: 'https://harf.co',
    memberSince: '2025-01-01',
    stats: { library: 0, favorites: 0, purchases: 0, usagePct: 0 },
    usage: { downloads: { used: 0, limit: null }, matching: { used: 0, limit: null }, resetsInHours: 3 },
  },
} as const satisfies Record<string, User>;

/** الحساب المجاني نفسه بعد ترقيته إلى الاستوديو: ناشر جديد لم يوثّق استوديوه ولم ينشر بعد */
export const MOCK_NEW_STUDIO = {
  ...MOCK_USERS.free,
  plan: 'studio',
  usage: { downloads: { used: 5, limit: null }, matching: { used: 2, limit: null }, resetsInHours: 3 },
} as const satisfies User;
