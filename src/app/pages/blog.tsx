import { Link, Navigate, useParams } from 'react-router';

import { Container } from '@/components/layout/container';
import { ContentPage } from '@/components/layout/content-page';
import { PageMeta } from '@/components/shared/page-meta';
import { ChevronRightIcon } from '@/components/ui/icons';
import { usePublishedPosts } from '@/lib/blog';
import { formatDateAr } from '@/lib/format';

import { ComingSoonPage } from './coming-soon';

/** المدونة: المقالات المنشورة من لوحة الإدارة — وبلا مقالات تبقى صفحة «قريباً» */
export function BlogPage() {
  const posts = usePublishedPosts();
  if (!posts.length) return <ComingSoonPage page="blog" />;
  return (
    <ContentPage title="المدونة" lead="مقالات عن الخط العربي وتصميم الحروف وقصص المصمّمين والمسابك." wide>
      <ul className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              to={`/blog/${p.slug}`}
              className="group flex h-full flex-col gap-3 rounded-xl border bg-card p-6 transition-[border-color,transform,box-shadow] duration-(--dur-slow) hover:-translate-y-0.5 hover:border-strong hover:shadow-float"
            >
              <p className="text-caption text-tertiary">
                {p.author} · {formatDateAr(p.publishedAt ?? p.updatedAt)}
              </p>
              <h2 className="text-xl leading-snug font-bold group-hover:text-primary">{p.title}</h2>
              <p className="text-meta leading-relaxed text-muted-foreground">{p.excerpt}</p>
              <span className="mt-auto pt-2 text-meta font-medium">اقرأ المقال</span>
            </Link>
          </li>
        ))}
      </ul>
    </ContentPage>
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
        <p className="mt-8 text-lead leading-relaxed">{post.excerpt}</p>
        <div className="mt-8 flex flex-col gap-5 border-t pt-8 text-control leading-loose text-muted-foreground">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </Container>
  );
}
