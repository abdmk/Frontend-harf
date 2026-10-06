import { Link, Navigate, useParams } from 'react-router';

import { Container } from '@/components/layout/container';
import { ToolHero } from '@/components/layout/tool-hero';
import { PageMeta } from '@/components/shared/page-meta';
import { PostBlocks } from '@/components/shared/post-blocks';
import { ChevronRightIcon, DocumentIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { type BlogPost, usePublishedPosts } from '@/stores/blog';
import { formatDateAr } from '@/utils/format';

import { ComingSoonPage } from './coming-soon';

/** غلاف المقال، وبلا صورة أرضية اللحظة اللونية بأول حرف من العنوان — كي لا تبدو البطاقة فارغة */
function Cover({ post, className }: { post: BlogPost; className?: string }) {
  return post.cover ? (
    <img src={post.cover} alt="" loading="lazy" decoding="async" className={cn('w-full object-cover', className)} />
  ) : (
    <div aria-hidden className={cn('grid w-full place-items-center moment', className)}>
      <span className="text-6xl font-bold" style={{ color: 'var(--grad-dawn-ink)' }}>
        {post.title.trim()[0]}
      </span>
    </div>
  );
}

/** المدونة: المقالات المنشورة من لوحة الإدارة — بعنوان صفحات الأدوات نفسه، وبلا مقالات تبقى صفحة «قريباً» */
export function BlogPage() {
  const posts = usePublishedPosts();
  if (!posts.length) return <ComingSoonPage page="blog" />;
  return (
    <Container as="main" id="main" className="py-10 sm:py-14">
      <PageMeta title="المدونة" description="مقالات عن الخط العربي وتصميم الحروف وقصص المصمّمين والمسابك." />
      <ToolHero
        icon={<DocumentIcon />}
        name="المدونة"
        title="قصص الحرف"
        highlight="من الفكرة إلى الخط"
        lead="مقالات عن الخط العربي وتصميم الحروف، وقصص المصمّمين والمسابك."
        noteIcon={<DocumentIcon />}
        note={posts.length === 1 ? 'مقال منشور' : `${posts.length.toLocaleString('ar')} مقالات منشورة`}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              to={`/blog/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,transform,box-shadow] duration-(--dur-slow) hover:-translate-y-0.5 hover:border-strong hover:shadow-float"
            >
              <Cover post={p} className="aspect-[16/9] border-b" />
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="text-caption text-tertiary">
                  {p.author} · {formatDateAr(p.publishedAt ?? p.updatedAt)}
                </p>
                <h2 className="text-xl leading-snug font-bold group-hover:text-primary">{p.title}</h2>
                <p className="text-meta leading-relaxed text-muted-foreground">{p.excerpt}</p>
                <span className="mt-auto pt-2 text-meta font-medium">اقرأ المقال</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}

/** مقال واحد — نصّ عادي (لا HTML)، فلا مجال لحقن سكربت من محتوى المقال */
export function BlogPostPage() {
  const { slug } = useParams();
  const post = usePublishedPosts().find((p) => p.slug === slug);
  if (!post) return <Navigate to="/blog" replace />;
  return (
    <Container as="main" id="main" className="py-12 sm:py-20">
      <PageMeta title={post.title} description={post.excerpt} />
      <article className="mx-auto max-w-2xl">
        <Link
          to="/blog"
          className="mb-6 inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-foreground"
        >
          <ChevronRightIcon className="size-4" />
          المدونة
        </Link>
        <h1 className="animate-fade-up text-display leading-tight font-bold">{post.title}</h1>
        <p className="mt-4 text-meta text-muted-foreground">
          {post.author} · {formatDateAr(post.publishedAt ?? post.updatedAt)}
        </p>
        {post.cover && <Cover post={post} className="mt-8 aspect-[2/1] rounded-xl border" />}
        <p className="mt-8 text-lead leading-relaxed">{post.excerpt}</p>
        <div className="mt-8 border-t pt-8">
          <PostBlocks blocks={post.body} />
        </div>
      </article>
    </Container>
  );
}
