import { getPosts, postSchema, type PostStatus, savePosts } from '@/lib/blog';

import { logAdmin } from './audit';
import { adminOrNull, type AdminResult, DENIED } from './guard';

/** إدارة المدونة: إنشاء وتعديل، نقل بين الحالات (مسودّة/مراجعة/منشور)، وحذف — كلّها بعد التحقّق من الدور */
const today = () => new Date().toISOString().slice(0, 10);

function commit(action: string, title: string, next: ReturnType<typeof getPosts>): AdminResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  if (!savePosts(next)) return { ok: false, error: 'تعذّر الحفظ.' };
  logAdmin(admin.name, action, title);
  return { ok: true };
}

const ACTION: Record<PostStatus, string> = {
  published: 'نشر مقال',
  review: 'إرجاع مقال للمراجعة',
  draft: 'إلغاء نشر مقال',
};

export function setPostStatus(id: string, status: PostStatus): AdminResult {
  if (!adminOrNull()) return DENIED;
  const post = getPosts().find((p) => p.id === id);
  if (!post) return { ok: false, error: 'المقال غير موجود.' };
  return commit(
    ACTION[status],
    post.title,
    getPosts().map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            updatedAt: today(),
            publishedAt: status === 'published' ? (p.publishedAt ?? today()) : p.publishedAt,
          }
        : p,
    ),
  );
}

export function deletePost(id: string): AdminResult {
  if (!adminOrNull()) return DENIED;
  const post = getPosts().find((p) => p.id === id);
  if (!post) return { ok: false, error: 'المقال غير موجود.' };
  return commit(
    'حذف مقال',
    post.title,
    getPosts().filter((p) => p.id !== id),
  );
}

export type PostInput = { id?: string; title: string; slug: string; excerpt: string; body: string; author: string };
export type PostResult = AdminResult | { ok: false; error: string; field: string };

/** إنشاء أو تعديل — النصّ فقرات مفصولة بسطر فارغ، ويُعرض نصّاً لا HTML */
export function savePost(input: PostInput): PostResult {
  const admin = adminOrNull();
  if (!admin) return DENIED;
  const posts = getPosts();
  const existing = input.id ? posts.find((p) => p.id === input.id) : undefined;
  if (input.id && !existing) return { ok: false, error: 'المقال غير موجود.' };
  const candidate = {
    id: existing?.id ?? `p-${Date.now().toString(36)}`,
    slug: input.slug.trim().toLowerCase(),
    title: input.title,
    excerpt: input.excerpt,
    body: input.body
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean),
    author: input.author || admin.name,
    status: existing?.status ?? 'draft',
    updatedAt: today(),
    ...(existing?.publishedAt ? { publishedAt: existing.publishedAt } : {}),
  };
  const r = postSchema.safeParse(candidate);
  if (!r.success) {
    const i = r.error.issues[0];
    return { ok: false, error: i?.message ?? 'بيانات غير صالحة.', field: String(i?.path[0] ?? '') };
  }
  if (posts.some((p) => p.slug === r.data.slug && p.id !== r.data.id))
    return { ok: false, error: 'هذا الرابط مستعمل لمقال آخر.', field: 'slug' };
  return commit(
    existing ? 'تعديل مقال' : 'إنشاء مقال',
    r.data.title,
    existing ? posts.map((p) => (p.id === r.data.id ? r.data : p)) : [r.data, ...posts],
  );
}
