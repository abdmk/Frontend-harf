import { ArrowLeftIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { Banner, BannerTone } from '@/lib/site-content';

/** أرضيّات البنر النصّي — تدرّجات نظام التصميم، تعمل في الوضعين */
export const BANNER_TONE_CLASS: Record<BannerTone, string> = {
  dawn: '[background:var(--grad-dawn-wide)]',
  brand: 'moment',
  gold: '[background:var(--grad-plan-basic)]',
  trial: '[background:var(--grad-plan-studio)]',
};

export const BANNER_TONE_LABEL: Record<BannerTone, string> = {
  dawn: 'فجر',
  brand: 'حرف',
  gold: 'ذهبي',
  trial: 'سماوي',
};

/**
 * محتوى شريحة واحدة: الصورة إن وُجدت، وإلا عنوان وسطر على أرضيّة لونية.
 * compact لمعاينة المحرّر الصغيرة.
 */
export function BannerSlide({ banner, linked, compact }: { banner: Banner; linked?: boolean; compact?: boolean }) {
  if (banner.image)
    return <img src={banner.image} alt={banner.alt} className="size-full object-cover" draggable={false} />;
  return (
    <div
      className={cn(
        'flex size-full flex-col justify-center',
        compact ? 'gap-1 px-4' : 'gap-2 px-6 sm:gap-3 sm:px-14',
        BANNER_TONE_CLASS[banner.tone],
      )}
    >
      <p className={cn('font-bold tracking-tight text-foreground', compact ? 'text-control' : 'text-2xl sm:text-4xl')}>
        {banner.title}
      </p>
      {banner.text && (
        <p
          className={cn(
            'max-w-2xl text-muted-foreground',
            compact ? 'line-clamp-1 text-caption' : 'text-control sm:text-lead',
          )}
        >
          {banner.text}
        </p>
      )}
      {linked && !compact && (
        <span className="mt-1 inline-flex items-center gap-1.5 text-control font-medium text-foreground">
          اكتشف
          <ArrowLeftIcon className="size-4" />
        </span>
      )}
    </div>
  );
}
