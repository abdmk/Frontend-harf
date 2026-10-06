import { useId, useRef, useState } from 'react';
import { Link } from 'react-router';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PostBlocks } from '@/components/shared/post-blocks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  PictureIcon,
  PlayIcon,
  TextIcon,
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
import { deleteVideo, storeVideo } from '@/lib/media-store';
import { type BlogPost, POST_LIMITS, type PostBlock, type PostStatus, usePosts } from '@/stores/blog';
import { formatDateAr } from '@/utils/format';
import { prepareImage } from '@/utils/image-upload';

import { deletePost, savePost, setPostStatus } from '../api/blog';

const STATUS: Record<PostStatus, { label: string; tone: 'neutral' | 'warning' | 'success'; Icon: typeof CheckIcon }> = {
  draft: { label: 'مسودّة', tone: 'neutral', Icon: PencilIcon },
  review: { label: 'قيد المراجعة', tone: 'warning', Icon: ClockIcon },
  published: { label: 'منشور', tone: 'success', Icon: CheckIcon },
};

type Draft = PostBlock & { key: string };
const keyed = (b: PostBlock): Draft => ({ ...b, key: Math.random().toString(36).slice(2) });

/** محرّر كتل بسيط: فقرة، صورة، فيديو — مع ترتيب وحذف. لا محرّر HTML (لا حقن). */
function PostEditor({ post, onClose }: { post?: BlogPost; onClose: () => void }) {
  const [v, setV] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    author: post?.author ?? '',
  });
  const [cover, setCover] = useState<string | undefined>(post?.cover);
  const [blocks, setBlocks] = useState<Draft[]>(() => (post?.body ?? [{ t: 'p', text: '' } as PostBlock]).map(keyed));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: string; message: string }>();
  const id = useId();
  const coverRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const err = (k: string) => (error?.field === k ? error.message : undefined);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((x) => ({ ...x, [k]: e.target.value }));
  const patch = (i: number, p: Partial<PostBlock>) =>
    setBlocks((xs) => xs.map((x, k) => (k === i ? ({ ...x, ...p } as Draft) : x)));
  const move = (i: number, d: -1 | 1) =>
    setBlocks((xs) => {
      const n = [...xs];
      [n[i], n[i + d]] = [n[i + d]!, n[i]!];
      return n;
    });

  async function pickImage(file: File | undefined, target: 'cover' | 'block') {
    if (!file) return;
    setBusy(true);
    const r = await prepareImage(file, { maxBytes: 8 * 1024 * 1024, maxSide: 1600, minSide: 320, quality: 0.8 });
    setBusy(false);
    if (!r.ok) return setError({ field: 'media', message: r.error });
    setError(undefined);
    if (target === 'cover') setCover(r.url);
    else setBlocks((xs) => [...xs, keyed({ t: 'img', src: r.url, alt: '' })]);
  }

  async function pickVideo(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const r = await storeVideo(file);
    setBusy(false);
    if (!r.ok) return setError({ field: 'media', message: r.error });
    setError(undefined);
    setBlocks((xs) => [...xs, keyed({ t: 'video', media: r.id })]);
  }

  // فيديوهات أُزيلت من المسودّة — تُحذف من التخزين عند الحفظ لا قبله
  const [droppedVideos, setDroppedVideos] = useState<string[]>([]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const body = blocks.map((b) => {
      const { key, ...block } = b;
      void key;
      return block as PostBlock;
    });
    const r = savePost({ id: post?.id, ...v, cover, body });
    if (!r.ok) return setError({ field: 'field' in r ? r.field : '', message: r.error });
    for (const id of droppedVideos) void deleteVideo(id);
    toast({ tone: 'success', title: post ? 'حُفظ المقال' : 'أُنشئ المقال كمسودّة' });
    onClose();
  }

  const fileInput = (ref: React.RefObject<HTMLInputElement | null>, accept: string, onPick: (f?: File) => void) => (
    <input
      ref={ref}
      type="file"
      accept={accept}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        onPick(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-dialog-lg">
        <div>
          <DialogTitle>{post ? 'تعديل المقال' : 'مقال جديد'}</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            غلاف، ثم كتل: فقرات وصور وفيديو بالترتيب الذي تريده.
          </DialogDescription>
        </div>
        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          {/* الغلاف */}
          <div>
            <p className="mb-1.5 text-meta font-medium text-muted-foreground">صورة الغلاف</p>
            {cover ? (
              <div className="relative overflow-hidden rounded-lg border">
                <img src={cover} alt="" className="aspect-[2/1] w-full object-cover" />
                <div className="absolute end-2 top-2 flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-card"
                    onClick={() => coverRef.current?.click()}
                  >
                    تغيير
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-card"
                    onClick={() => setCover(undefined)}
                  >
                    إزالة
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-sunken/50 text-meta text-muted-foreground transition-colors hover:border-strong hover:text-foreground"
              >
                <PictureIcon className="size-6" />
                أضف صورة غلاف
                <span className="text-caption text-tertiary">PNG أو JPG أو WebP · تظهر فوق البطاقة وأعلى المقال</span>
              </button>
            )}
            {fileInput(coverRef, 'image/png,image/jpeg,image/webp', (f) => pickImage(f, 'cover'))}
          </div>

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

          {/* الكتل */}
          <div className="flex flex-col gap-3">
            <p className="text-meta font-medium text-muted-foreground">نصّ المقال</p>
            <ol className="flex flex-col gap-3">
              {blocks.map((b, i) => (
                <li key={b.key} className="rounded-lg border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-caption font-medium text-tertiary">
                      {b.t === 'p' ? (
                        <TextIcon className="size-3.5" />
                      ) : b.t === 'img' ? (
                        <PictureIcon className="size-3.5" />
                      ) : (
                        <PlayIcon className="size-3.5" />
                      )}
                      {b.t === 'p' ? 'فقرة' : b.t === 'img' ? 'صورة' : 'فيديو'}
                    </span>
                    <span className="flex gap-0.5">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        aria-label="تقديم"
                      >
                        <ArrowUpIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={i === blocks.length - 1}
                        onClick={() => move(i, 1)}
                        aria-label="تأخير"
                      >
                        <ArrowDownIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="حذف الكتلة"
                        onClick={() => {
                          // الملف يُحذف بعد الحفظ فقط — «إلغاء» يُبقي المقال المحفوظ سليماً
                          if (b.t === 'video') setDroppedVideos((xs) => [...xs, b.media]);
                          setBlocks((xs) => xs.filter((_, k) => k !== i));
                        }}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </span>
                  </div>
                  {b.t === 'p' ? (
                    <Textarea
                      aria-label={`الفقرة ${i + 1}`}
                      value={b.text}
                      maxLength={POST_LIMITS.paragraph}
                      onChange={(e) => patch(i, { text: e.target.value })}
                      className="min-h-24"
                    />
                  ) : b.t === 'img' ? (
                    <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <img src={b.src} alt="" className="aspect-video w-full rounded-md border object-cover" />
                      <div className="flex flex-col gap-2">
                        <Input
                          aria-label="وصف الصورة"
                          placeholder="وصف الصورة (لقارئ الشاشة)"
                          value={b.alt}
                          maxLength={POST_LIMITS.caption}
                          onChange={(e) => patch(i, { alt: e.target.value })}
                        />
                        <Input
                          aria-label="تعليق تحت الصورة"
                          placeholder="تعليق اختياري"
                          value={b.caption ?? ''}
                          maxLength={POST_LIMITS.caption}
                          onChange={(e) => patch(i, { caption: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <PostBlocks blocks={[{ t: 'video', media: b.media }]} />
                      <Input
                        aria-label="تعليق تحت الفيديو"
                        placeholder="تعليق اختياري"
                        value={b.caption ?? ''}
                        maxLength={POST_LIMITS.caption}
                        onChange={(e) => patch(i, { caption: e.target.value })}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setBlocks((xs) => [...xs, keyed({ t: 'p', text: '' })])}
              >
                <TextIcon />
                فقرة
              </Button>
              <Button type="button" size="sm" variant="outline" loading={busy} onClick={() => imgRef.current?.click()}>
                <PictureIcon />
                صورة
              </Button>
              <Button type="button" size="sm" variant="outline" loading={busy} onClick={() => vidRef.current?.click()}>
                <PlayIcon />
                فيديو
              </Button>
            </div>
            <FieldHint>الصور تُعاد معالجتها وتُزال بياناتها الوصفية · الفيديو MP4 أو WebM حتى 50 ميغابايت.</FieldHint>
            {fileInput(imgRef, 'image/png,image/jpeg,image/webp', (f) => pickImage(f, 'block'))}
            {fileInput(vidRef, 'video/mp4,video/webm', pickVideo)}
            <FieldError>{err('media') ?? err('body')}</FieldError>
          </div>

          {error && !['title', 'slug', 'excerpt', 'body', 'media'].includes(error.field) && (
            <FieldError>{error.message}</FieldError>
          )}
          <div className="sticky bottom-0 -mx-1 flex justify-end gap-2 bg-card/95 px-1 pt-2 backdrop-blur-sm">
            <Button type="button" variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={busy}>
              حفظ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePostDialog({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  return (
    <ConfirmDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`حذف «${post.title}»؟`}
      description={`يُحذف المقال نهائياً${post.status === 'published' ? ' ويختفي من المدونة' : ''}. لا يمكن التراجع.`}
      confirmLabel="حذف المقال"
      icon={<TrashIcon />}
      onConfirm={() => {
        if (deletePost(post.id).ok) toast({ tone: 'info', title: 'حُذف المقال' });
        onClose();
      }}
    />
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
