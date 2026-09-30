import { z } from 'zod';

import { isSafeImageUrl } from './image-upload';
import { asObject, createJsonStore } from './json-store';

/**
 * محتوى الموقع الذي تديره الإدارة (صفحة «المحتوى»): بنرات الشريحة الرئيسية، شريط الإعلان،
 * ودعوة «تبحث عن خط خاص؟». الموقع يقرأ من هنا مباشرة.
 * ⚠️ عرض: في المنتج يُحفظ على الخادم، والصور ترفع إلى تخزين الملفات بعد فحصها هناك أيضاً.
 */

/** رابط آمن للمحتوى: مسار داخلي («/…» لا «//») أو https فقط — لا javascript: ولا data: */
export function safeContentLink(v: string | undefined): string | undefined {
  if (!v) return undefined;
  if (/^\/(?![/\\])[^\s]*$/.test(v)) return v;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}
export const isExternalLink = (href: string) => href.startsWith('https://');

export const BANNERS_MAX = 6;
export const LIMITS = { alt: 120, title: 60, text: 140, ctaTitle: 40, ctaLead: 220, ctaButton: 24, href: 300 };

const link = z
  .string()
  .trim()
  .max(LIMITS.href)
  .refine((v) => !v || !!safeContentLink(v), 'رابط داخلي يبدأ بـ«/» أو رابط https فقط.');

export const bannerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  image: z.string().refine(isSafeImageUrl, 'الصورة مطلوبة.'),
  alt: z.string().trim().min(3, 'صف الصورة لقارئ الشاشة (3 أحرف على الأقل).').max(LIMITS.alt),
  href: link,
  active: z.boolean(),
});
export const announcementSchema = z.object({
  active: z.boolean(),
  text: z.string().trim().max(LIMITS.text),
  href: link,
});
export const ctaSchema = z.object({
  title: z.string().trim().min(2, 'العنوان مطلوب.').max(LIMITS.ctaTitle),
  lead: z.string().trim().min(10, 'النص قصير جداً.').max(LIMITS.ctaLead),
  button: z.string().trim().min(2, 'نص الزرّ مطلوب.').max(LIMITS.ctaButton),
});

export type Banner = z.infer<typeof bannerSchema>;
export type Announcement = z.infer<typeof announcementSchema>;
export type Cta = z.infer<typeof ctaSchema>;
export type SiteContent = { banners: Banner[]; announcement: Announcement; cta: Cta };

export const DEFAULT_CTA: Cta = {
  title: 'تبحث عن خط خاص؟',
  lead: 'احجز جلسة سريعة مع فريقنا، نساعدك تختار الخط الأنسب لمشروعك أو نخصص لك خط يعكس هويتك بشكل أوضح وأميز.',
  button: 'تحدث مع فريقنا',
};
export const DEFAULT_CONTENT: SiteContent = {
  banners: [],
  announcement: { active: false, text: '', href: '' },
  cta: DEFAULT_CTA,
};

const store = createJsonStore<SiteContent>(
  'harf_site_content',
  (x) => {
    const o = asObject(x);
    const banners = Array.isArray(o.banners)
      ? o.banners
          .map((b) => bannerSchema.safeParse(b))
          .flatMap((r) => (r.success ? [r.data] : []))
          .slice(0, BANNERS_MAX)
      : [];
    const a = announcementSchema.safeParse(o.announcement);
    const c = ctaSchema.safeParse(o.cta);
    return {
      banners,
      announcement: a.success ? a.data : DEFAULT_CONTENT.announcement,
      cta: c.success ? c.data : DEFAULT_CTA,
    };
  },
  DEFAULT_CONTENT,
);

export const getSiteContent = store.get;
export const saveSiteContent = store.set;
export const useSiteContent = store.use;
