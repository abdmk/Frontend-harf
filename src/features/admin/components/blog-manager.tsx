import { useId, useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  CheckIcon,
  ClockIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { type BlogPost, POST_LIMITS, type PostStatus, usePosts } from '@/lib/blog';
import { formatDateAr } from '@/lib/format';

import { deletePost, savePost, setPostStatus } from '../api/blog';

const STATUS: Record<PostStatus, { label: string; tone: 'neutral' | 'warning' | 'success'; Icon: typeof CheckIcon }> = {
  draft: { label: 'مسودّة', tone: 'neutral', Icon: PencilIcon },
  review: { label: 'قيد المراجعة', tone: 'warning', Icon: ClockIcon },
  published: { label: 'منشور', tone: 'success', Icon: CheckIcon },
};

function PostEditor({ post, onClose }: { post?: BlogPost; onClose: () => void }) {
  const [v, setV] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    body: post?.body.join('\n\n') ?? '',
    author: post?.author ?? '',
  });
  const [error, setError] = useState<{ field: string; message: string }>();
  const id = useId();
  const err = (k: string) => (error?.field === k ? error.message : undefined);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((x) => ({ ...x, [k]: e.target.value }));

  function save(e: React.FormEvent) {
    e.preventDefault();
    const r = savePost({ id: post?.id, ...v });
    if (!r.ok) return setError({ field: 'field' in r ? r.field : '', message: r.error });
    toast({ tone: 'success', title: post ? 'حُفظ المقال' : 'أُنشئ المقال كمسودّة' });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-dialog-lg">
        <div>
          <DialogTitle>{post ? 'تعديل المقال' : 'مقال جديد'}</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            يُعرض نصّاً كما تكتبه. افصل الفقرات بسطر فارغ.
          </DialogDescription>
        </div>
        <form onSubmit={save} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={`${id}-t`} required>
              العنوان
            </FieldLabel>
            <Input id={`${id}-t`} value={v.title} maxLength={POST_LIMITS.title} onChange={set('title')} />
            <FieldError>{err('title')}</FieldError>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${id}-s`} required>
                الرابط
              </FieldLabel>
              <Input
                id={`${id}-s`}
                dir="ltr"
                value={v.slug}
                maxLength={80}
                onChange={set('slug')}
                placeholder="kufi-history"
              />
              <FieldHint dir="ltr" className="text-start">
                /blog/{v.slug || '…'}
              </FieldHint>
              <FieldError>{err('slug')}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-a`}>الكاتب</FieldLabel>
              <Input
                id={`${id}-a`}
                value={v.author}
                maxLength={60}
                onChange={set('author')}
                placeholder="اسمك افتراضياً"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor={`${id}-e`} required>
              الملخّص
            </FieldLabel>
            <Textarea
              id={`${id}-e`}
              value={v.excerpt}
              maxLength={POST_LIMITS.excerpt}
              onChange={set('excerpt')}
              className="min-h-18"
            />
            <FieldError>{err('excerpt')}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-b`} required>
              النصّ
            </FieldLabel>
            <Textarea id={`${id}-b`} value={v.body} onChange={set('body')} className="min-h-56" />
            <FieldError>{err('body')}</FieldError>
          </Field>
          {error && !['title', 'slug', 'excerpt', 'body'].includes(error.field) && (
            <FieldError>{error.message}</FieldError>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePostDialog({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <div>
          <DialogTitle>حذف «{post.title}»؟</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            يُحذف المقال نهائياً{post.status === 'published' ? ' ويختفي من المدونة' : ''}. لا يمكن التراجع.
          </DialogDescription>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deletePost(post.id).ok) toast({ tone: 'info', title: 'حُذف المقال' });
              onClose();
            }}
          >
            <TrashIcon />
            حذف المقال
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** المدونة: المقالات بحالاتها، مع النشر والإرجاع للمراجعة والتعديل والحذف */
export function BlogManager() {
  const posts = usePosts();
  const [filter, setFilter] = useState<'all' | PostStatus>('all');
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null);
  const [removing, setRemoving] = useState<BlogPost | null>(null);
  const count = (s: PostStatus) => posts.filter((p) => p.status === s).length;
  const rows = posts
    .filter((p) => filter === 'all' || p.status === filter)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const move = (p: BlogPost, s: PostStatus, title: string) => {
    if (setPostStatus(p.id, s).ok) toast({ tone: 'success', title });
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 sm:px-5">
        <div role="group" aria-label="حالة المقال" className="flex [scrollbar-width:none] gap-1 overflow-x-auto">
          {(
            [
              ['all', 'الكل', posts.length],
              ['review', 'قيد المراجعة', count('review')],
              ['published', 'منشور', count('published')],
              ['draft', 'مسودّة', count('draft')],
            ] as const
          ).map(([v, label, n]) => (
            <button
              key={v}
              type="button"
              aria-pressed={filter === v}
              onClick={() => setFilter(v)}
              className="relative flex h-13 shrink-0 items-center gap-2 px-3 text-control text-muted-foreground transition-colors hover:text-foreground aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:after:absolute aria-pressed:after:inset-x-2 aria-pressed:after:bottom-0 aria-pressed:after:h-0.5 aria-pressed:after:rounded-full aria-pressed:after:bg-primary-fill"
            >
              {label}
              <span dir="ltr" className="rounded-full bg-sunken px-2 py-0.5 text-caption font-medium tabular-nums">
                {n}
              </span>
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setEditing('new')} className="my-2">
          <PlusIcon />
          مقال جديد
        </Button>
      </div>

      {rows.length ? (
        <ul aria-label="المقالات" className="divide-y">
          {rows.map((p) => {
            const st = STATUS[p.status];
            return (
              <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-control font-semibold">{p.title}</p>
                    <Badge tone={st.tone} icon={<st.Icon />}>
                      {st.label}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-1 text-meta text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-1 text-caption text-tertiary">
                    {p.author} · آخر تعديل {formatDateAr(p.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {p.status === 'published' ? (
                    <>
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/blog/${p.slug}`}>
                          <EyeIcon />
                          عرض
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => move(p, 'draft', 'أُلغي النشر')}>
                        إلغاء النشر
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="bg-ok-700 text-white hover:bg-ok-600"
                        onClick={() => move(p, 'published', `نُشر «${p.title}»`)}
                      >
                        <CheckIcon />
                        نشر
                      </Button>
                      {p.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => move(p, 'review', 'أُرسل للمراجعة')}>
                          <RefreshIcon />
                          للمراجعة
                        </Button>
                      )}
                    </>
                  )}
                  <Button size="icon-sm" variant="ghost" aria-label={`تعديل ${p.title}`} onClick={() => setEditing(p)}>
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label={`حذف ${p.title}`} onClick={() => setRemoving(p)}>
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          className="rounded-none border-0"
          icon={<DocumentIcon />}
          title="لا مقالات هنا"
          description="اكتب مقالاً جديداً أو غيّر التصفية."
        />
      )}

      {editing && <PostEditor post={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {removing && <DeletePostDialog post={removing} onClose={() => setRemoving(null)} />}
    </div>
  );
}
