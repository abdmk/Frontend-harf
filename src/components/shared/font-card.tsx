import Link from 'next/link';
import type { ReactNode } from 'react';

import { CheckIcon, ClockIcon, CrownIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { weightsLabel } from '@/lib/format';
import { TYPE_LABEL, USAGE_LABEL } from '@/lib/labels';
import type { Font } from '@/types/domain/font';

import { DesignerAvatars } from './designer-avatars';
import { DownloadButton } from './download-button';

const BADGE = {
  free: { cls: 'bg-ok-600 text-white', Icon: CheckIcon },
  trial: { cls: 'bg-trial-500 text-white', Icon: ClockIcon },
  paid: { cls: 'bg-gold-500 text-gold-foreground', Icon: CrownIcon },
} as const;

function Byline({ font }: { font: Font }) {
  const first = font.designers[0];
  if (font.designerLabel)
    return (
      <span className="truncate" dir="ltr">
        {font.designerLabel}
      </span>
    );
  if (!first) return null;
  if (font.designers.length > 2)
    return (
      <span className="truncate">
        {first.nameAr}{' '}
        <small className="text-meta font-normal text-muted-foreground">و{font.designers.length - 1} آخرين</small>
      </span>
    );
  const latin = /^[A-Za-z]/.test(first.nameEn) && font.designers.length === 1;
  return (
    <span className="truncate" dir={latin ? 'ltr' : undefined}>
      {latin ? first.nameEn : first.nameAr}
    </span>
  );
}

/** بطاقة الخط: شارة الترخيص والمفضّلة فوق الصورة، ثم الاسم والأوزان والمصمّمون والترخيص والتحميل */
export function FontCard({
  font,
  favorite,
  className,
}: {
  font: Font;
  /** زرّ المفضّلة — يأتي من طبقة التطبيق */ favorite?: ReactNode;
  className?: string;
}) {
  const badge = BADGE[font.type];
  return (
    <article
      className={cn(
        'group/card relative flex flex-col overflow-hidden rounded-lg border bg-card transition-[transform,box-shadow,border-color] duration-300 ease-out-quint hover:-translate-y-1 hover:border-strong hover:shadow-float',
        className,
      )}
    >
      <div aria-hidden className="relative aspect-[7/5] overflow-hidden border-b bg-sunken">
        <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[.03] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
      </div>
      <span
        className={cn(
          'absolute end-4 top-4 z-10 inline-flex h-6 items-center gap-1 rounded-full px-2 text-caption leading-none font-medium',
          badge.cls,
        )}
      >
        <badge.Icon className="size-3" />
        {TYPE_LABEL[font.type]}
      </span>
      {favorite && <div className="absolute start-4 top-4 z-10">{favorite}</div>}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <Link
            href={paths.font.getHref(font.id)}
            dir="ltr"
            className="truncate text-xl font-semibold tracking-tight after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            {font.name}
          </Link>
          <span className="shrink-0 text-meta text-muted-foreground">{weightsLabel(font.weights)}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <DesignerAvatars designers={font.designers} />
          <Byline font={font} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-lic">{USAGE_LABEL[font.usage]}</span>
          <DownloadButton fontName={font.name} />
        </div>
      </div>
    </article>
  );
}
