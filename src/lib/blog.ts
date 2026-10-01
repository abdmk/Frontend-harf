import { z } from 'zod';

import { SEED_POSTS } from '@/mocks/blog';

import { asObject, createJsonStore } from './json-store';

/**
 * مقالات المدونة: مسودّة ← قيد المراجعة ← منشور. الموقع يعرض المنشور وحده.
 * ⚠️ عرض: في المنتج تُحفظ على الخادم، ويُنقّى النصّ هناك أيضاً (نعرضه نصّاً لا HTML، فلا XSS).
 */
export const POST_STATUSES = ['draft', 'review', 'published'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_LIMITS = { title: 120, excerpt: 280, paragraph: 2000, paragraphs: 60 };

export const postSchema = z.object({
  id: z.string().regex(/^p-[a-z0-9-]{1,60}$/),
  slug: z.string().regex(/^[a-z0-9-]{3,80}$/, 'الرابط: أحرف لاتينية صغيرة وأرقام وشرطات فقط.'),
  title: z.string().trim().min(5, 'العنوان قصير جداً.').max(POST_LIMITS.title),
  excerpt: z.string().trim().min(10, 'الملخّص قصير جداً.').max(POST_LIMITS.excerpt),
  body: z
    .array(z.string().trim().min(1).max(POST_LIMITS.paragraph))
    .min(1, 'اكتب نصّ المقال.')
    .max(POST_LIMITS.paragraphs),
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
