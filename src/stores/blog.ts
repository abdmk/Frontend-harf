import { z } from 'zod';

import { asObject, createJsonStore } from '@/lib/json-store';
import { SEED_POSTS } from '@/testing/mocks/blog';
import { isSafeImageUrl } from '@/utils/image-upload';

/**
 * مقالات المدونة: مسودّة ← قيد المراجعة ← منشور. الموقع يعرض المنشور وحده.
 * ⚠️ عرض: في المنتج تُحفظ على الخادم، ويُنقّى النصّ هناك أيضاً (نعرضه نصّاً لا HTML، فلا XSS).
 */
export const POST_STATUSES = ['draft', 'review', 'published'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_LIMITS = { title: 120, excerpt: 280, paragraph: 2000, blocks: 60, caption: 200 };

/** معرّف فيديو مخزّن محلياً (lib/media-store) */
const VIDEO_ID = /^v-[a-z0-9]{6,40}$/;

/** كتل نصّ المقال: فقرة، صورة (JPEG مُعاد ترميزه)، أو فيديو مرفوع — لا HTML إطلاقاً */
export const blockSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('p'), text: z.string().trim().min(1).max(POST_LIMITS.paragraph) }),
  z.object({
    t: z.literal('img'),
    src: z.string().refine(isSafeImageUrl, 'صورة غير صالحة.'),
    alt: z.string().trim().min(3, 'صف الصورة لقارئ الشاشة.').max(POST_LIMITS.caption),
    caption: z.string().trim().max(POST_LIMITS.caption).optional(),
  }),
  z.object({
    t: z.literal('video'),
    media: z.string().regex(VIDEO_ID),
    caption: z.string().trim().max(POST_LIMITS.caption).optional(),
  }),
]);
export type PostBlock = z.infer<typeof blockSchema>;

export const postSchema = z.object({
  id: z.string().regex(/^p-[a-z0-9-]{1,60}$/),
  slug: z.string().regex(/^[a-z0-9-]{3,80}$/, 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات فقط.'),
  title: z.string().trim().min(5, 'العنوان قصير جداً.').max(POST_LIMITS.title),
  excerpt: z.string().trim().min(10, 'الملخّص قصير جداً.').max(POST_LIMITS.excerpt),
  /** صورة الغلاف — فوق البطاقة وأعلى المقال */
  cover: z.string().refine(isSafeImageUrl, 'صورة غلاف غير صالحة.').optional(),
  body: z
    // الصيغة الأولى (فقرات نصّية) تُقرأ كفقرات
    .array(z.preprocess((b) => (typeof b === 'string' ? { t: 'p', text: b } : b), blockSchema))
    .min(1, 'أضف فقرة واحدة على الأقل.')
    .max(POST_LIMITS.blocks, `${POST_LIMITS.blocks} كتلة على الأكثر.`),
  author: z.string().trim().min(2).max(60),
  status: z.enum(POST_STATUSES),
  updatedAt: z.string().max(40),
  publishedAt: z.string().max(40).optional(),
});
export type BlogPost = z.infer<typeof postSchema>;

const seed: BlogPost[] = SEED_POSTS;

const store = createJsonStore<BlogPost[] | null>(
  'harf_blog',
  (x) =>
    Array.isArray(x)
      ? x
          .map((p) => postSchema.safeParse(asObject(p)))
          .flatMap((r) => (r.success ? [r.data] : []))
          .slice(0, 500)
      : null,
  null,
);

export const getPosts = (): BlogPost[] => store.get() ?? seed;
export const savePosts = (posts: BlogPost[]) => store.set(posts);
export function usePosts(): BlogPost[] {
  return store.use() ?? seed;
}
export const usePublishedPosts = () =>
  usePosts()
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
