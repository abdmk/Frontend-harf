import { useSyncExternalStore } from 'react';
import { z } from 'zod';

import { createLocalStoreSignal } from '@/lib/local-store-signal';
import { isSafeImageUrl } from '@/utils/image-upload';

/**
 * الملف العام لحساب الاستوديو (صفحة المسبك/المصمّم): الشعار، الغلاف، النبذة، وحسابات التواصل.
 * ⚠️ عرض: يُحفظ في هذا المتصفّح؛ مع الخادم يُرسل للتحقّق نفسه وتُرفع الصور إلى تخزين خاص
 * يعيد ترميزها. الروابط تُبنى من «اسم المستخدم» فقط — لا يُقبل رابط حرّ غير الموقع (https).
 */

export const SOCIALS = {
  instagram: { label: 'Instagram', prefix: 'instagram.com/' },
  x: { label: 'X', prefix: 'x.com/' },
  behance: { label: 'Behance', prefix: 'behance.net/' },
  linkedin: { label: 'LinkedIn', prefix: 'linkedin.com/in/' },
} as const;
export type SocialKey = keyof typeof SOCIALS;

/** نوع الصفحة يختاره صاحبها: مسبك (فريق ينشر لعدّة مصمّمين) أو مصمّم مستقلّ */
export const PROFILE_KINDS = ['foundry', 'designer'] as const;
export type ProfileKind = (typeof PROFILE_KINDS)[number];
export const KIND_LABEL: Record<ProfileKind, string> = { foundry: 'مسبك', designer: 'مصمّم مستقلّ' };

/** حرف الشعار المؤقّت: أوّل حرف من الاسم بعد الكلمات العامة («مسبك تجاريب» ← «ت») */
export function markOf(name: string) {
  const core = name.trim().replace(/^(مسبك|استوديو|ستوديو|دار)\s+/, '');
  return (core || name).trim().slice(0, 1);
}

export type PublicProfile = {
  kind: ProfileKind;
  /** الاسم الظاهر — عربي، ومعه اللاتيني اختيارياً */
  name: string;
  nameEn: string;
  location: string;
  avatar?: string;
  cover?: string;
  bio: string;
  website: string;
  social: Partial<Record<SocialKey, string>>;
};

const HANDLE = /^[A-Za-z0-9._-]{1,40}$/;
export const BIO_MIN = 40;
export const BIO_MAX = 300;

export const profileSchema = z.object({
  kind: z.enum(PROFILE_KINDS),
  name: z.string().trim().min(2, 'اكتب الاسم الظاهر في صفحتك.').max(60),
  nameEn: z
    .string()
    .trim()
    .max(60)
    .refine((v) => !v || /^[A-Za-z0-9 .,'&-]+$/.test(v), 'الاسم اللاتيني بحروف لاتينية فقط.'),
  location: z.string().trim().max(60),
  bio: z.string().trim().max(BIO_MAX, `النبذة أقصر من ${BIO_MAX} حرف.`),
  website: z
    .string()
    .trim()
    .max(200)
    .refine((v) => !v || /^https:\/\/[^\s/$.?#][^\s]*$/i.test(v), 'الرابط يجب أن يبدأ بـ https://'),
  ...Object.fromEntries(
    Object.keys(SOCIALS).map((k) => [
      k,
      z
        .string()
        .trim()
        .transform((v) => v.replace(/^@/, ''))
        .refine((v) => !v || HANDLE.test(v), 'اسم المستخدم فقط — حروف لاتينية وأرقام و . _ -'),
    ]),
  ),
});

/** الرابط الكامل لحساب تواصل — يُبنى من اسم مستخدم تحقّقنا منه */
export function socialUrl(k: SocialKey, handle: string) {
  return `https://${SOCIALS[k].prefix}${encodeURIComponent(handle)}`;
}

const KEY = 'harf_public_profile';
const EMPTY: PublicProfile = { kind: 'foundry', name: '', nameEn: '', location: '', bio: '', website: '', social: {} };
const signal = createLocalStoreSignal();
let cache: { raw: string | null; value: PublicProfile | null } = { raw: null, value: null };

function read(): PublicProfile | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cache.value;
  }
  if (raw === cache.raw) return cache.value;
  let value: PublicProfile | null = null;
  try {
    const x = JSON.parse(raw ?? 'null') as Record<string, unknown> | null;
    if (x && typeof x === 'object') {
      const social: PublicProfile['social'] = {};
      const s = (x.social ?? {}) as Record<string, unknown>;
      for (const k of Object.keys(SOCIALS) as SocialKey[])
        if (typeof s[k] === 'string' && HANDLE.test(s[k])) social[k] = s[k];
      const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
      value = {
        kind: x.kind === 'designer' ? 'designer' : 'foundry',
        name: str(x.name, 60),
        nameEn: str(x.nameEn, 60),
        location: str(x.location, 60),
        avatar: isSafeImageUrl(x.avatar) ? x.avatar : undefined,
        cover: isSafeImageUrl(x.cover) ? x.cover : undefined,
        bio: typeof x.bio === 'string' ? x.bio.slice(0, BIO_MAX) : '',
        website: typeof x.website === 'string' && /^https:\/\//i.test(x.website) ? x.website.slice(0, 200) : '',
        social,
      };
    }
  } catch {
    value = null;
  }
  cache = { raw, value };
  return value;
}

export function getPublicProfile(): PublicProfile | null {
  return read();
}

/** يعيد false إن امتلأ التخزين (صور كبيرة) — ليُعرض خطأ واضح بدل فقدان صامت */
export function savePublicProfile(p: PublicProfile): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    return false;
  }
  signal.notify();
  return true;
}

function usePublicProfile(fallback: PublicProfile = EMPTY): PublicProfile {
  return useSyncExternalStore(signal.subscribe, read, () => null) ?? fallback;
}

/** عناصر اكتمال الملف العام — «غير مكتمل» حتى تكتمل كلّها */
export function profileChecklist(p: PublicProfile) {
  return [
    { key: 'name', label: 'الاسم الظاهر', done: p.name.trim().length >= 2 },
    { key: 'avatar', label: p.kind === 'designer' ? 'صورتك الشخصية' : 'شعار المسبك', done: !!p.avatar },
    { key: 'cover', label: 'صورة الغلاف', done: !!p.cover },
    { key: 'bio', label: `نبذة (${BIO_MIN} حرفاً على الأقل)`, done: p.bio.trim().length >= BIO_MIN },
    {
      key: 'social',
      label: 'حساب تواصل واحد على الأقل',
      done: !!p.website || Object.values(p.social).some(Boolean),
    },
  ];
}

export function useProfileIncomplete(fallback?: PublicProfile) {
  return profileChecklist(usePublicProfile(fallback)).some((c) => !c.done);
}
