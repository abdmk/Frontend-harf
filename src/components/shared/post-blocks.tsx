import { useVideoUrl } from '@/lib/media-store';
import type { PostBlock } from '@/stores/blog';

function Video({ id, caption }: { id: string; caption?: string }) {
  const url = useVideoUrl(id);
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-video overflow-hidden rounded-xl border bg-sunken">
        {url && <video src={url} controls playsInline preload="metadata" className="size-full bg-ink object-contain" />}
      </div>
      {caption && <figcaption className="text-center text-caption text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

/** نصّ المقال: فقرات وصور وفيديو — كل شيء نصّ أو وسيط موثوق، لا HTML (فلا مجال لحقن) */
export function PostBlocks({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="flex flex-col gap-6 text-control leading-loose text-muted-foreground">
      {blocks.map((b, i) =>
        b.t === 'p' ? (
          <p key={i}>{b.text}</p>
        ) : b.t === 'img' ? (
          <figure key={i} className="flex flex-col gap-2">
            <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="w-full rounded-xl border" />
            {b.caption && <figcaption className="text-center text-caption">{b.caption}</figcaption>}
          </figure>
        ) : (
          <Video key={i} id={b.media} caption={b.caption} />
        ),
      )}
    </div>
  );
}
