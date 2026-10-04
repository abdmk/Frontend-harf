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

/** إطار البنر — نفسه في المكتبة وفي الصفحات التي تبدأ ببنر (المخطوطات) */
export const BANNER_FRAME = 'aspect-video rounded-lg sm:aspect-[1120/290]';

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

/**
 * بنر ثابت في رأس الصفحة بشكل شريحة المكتبة نفسها: الأرضيّة اللونية، العنوان (h1 للصفحة) وسطر تحته.
 * يُستعمل حيث تريد الصفحة أن تبدو أختاً لصفحة الخطوط.
 */
export function PageBanner({
  title,
  lead,
  tone = 'dawn',
  className,
}: {
  title: string;
  lead?: string;
  tone?: BannerTone;
  className?: string;
}) {
  return (
    <header
      className={cn(
        BANNER_FRAME,
        'flex animate-fade-up flex-col justify-center gap-2 overflow-hidden px-6 sm:gap-3 sm:px-14',
        BANNER_TONE_CLASS[tone],
        className,
      )}
    >
      <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">{title}</h1>
      {lead && <p className="max-w-2xl text-control text-pretty text-muted-foreground sm:text-lead">{lead}</p>}
    </header>
  );
}
