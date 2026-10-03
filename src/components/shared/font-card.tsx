import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { faceStyle } from '@/lib/font-weight';
import { weightsLabel } from '@/lib/format';
import { USAGE_LABEL } from '@/lib/labels';
import type { Font } from '@/types/domain/font';

import { DesignerAvatars } from './designer-avatars';
import { DownloadButton } from './download-button';
import { FontTypeBadge } from './font-type-badge';

/** اسم المصمّم تحت اسم الخط — رابط لصفحته، فوق رابط البطاقة الممتدّ (z-10) */
function Byline({ font }: { font: Font }) {
  const first = font.designers[0];
  if (!first) return font.designerLabel ? <span className="truncate">{font.designerLabel}</span> : null;
  const link = 'relative z-10 truncate underline-offset-4 transition-colors hover:text-primary hover:underline';
  const to = paths.designer.getHref(first.id);
  if (font.designerLabel)
    return (
      <Link to={to} dir="ltr" className={link}>
        {font.designerLabel}
      </Link>
    );
  if (font.designers.length > 2)
    return (
      <span className="truncate">
        <Link to={to} className={link}>
          {first.nameAr}
        </Link>{' '}
        <small className="text-meta font-normal text-muted-foreground">و{font.designers.length - 1} آخرين</small>
      </span>
    );
  const latin = /^[A-Za-z]/.test(first.nameEn) && font.designers.length === 1;
  return (
    <Link to={to} dir={latin ? 'ltr' : undefined} className={link}>
      {latin ? first.nameEn : first.nameAr}
    </Link>
  );
}

/** بطاقة الخط: شارة الترخيص والمفضّلة فوق الصورة، ثم الاسم والأوزان والمصمّمون والترخيص والتحميل */
export function FontCard({
  font,
  favorite,
  action,
  specimen,
  meta,
  extra,
  className,
}: {
  font: Font;
  /** زرّ المفضّلة — يأتي من طبقة التطبيق */ favorite?: ReactNode;
  /** سطر الأفعال للخطوط المدفوعة/التجريبية — يأتي من طبقة التطبيق؛ بدونه: الرخصة + تحميل */
  action?: ReactNode;
  /** عيّنة مخصّصة بدل اسم الخط (مثل نصّ المستخدم في «عين») */
  specimen?: { text: string; weight: number };
  /** بدل «N أوزان» بجانب الاسم */
  meta?: ReactNode;
  /** سطر إضافي فوق سطر الترخيص */
  extra?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'group/card relative flex flex-col overflow-hidden rounded-lg border bg-card transition-[transform,box-shadow,border-color] duration-(--dur-slow) ease-out-quint hover:-translate-y-1 hover:border-strong hover:shadow-float',
        className,
      )}
    >
      <div
        aria-hidden
        className="relative grid aspect-[7/5] place-items-center overflow-hidden border-b bg-sunken px-6"
      >
        {font.face && (
          <span
            className="line-clamp-2 text-center text-5xl leading-snug text-foreground transition-transform duration-(--dur-xslow) ease-out-quint group-hover/card:scale-[1.04]"
            style={faceStyle(font.face, specimen?.weight ?? 700)}
          >
            {specimen?.text ?? font.face.nameAr}
          </span>
        )}
      </div>
      <FontTypeBadge type={font.type} className="absolute end-4 top-4 z-10" />
      {favorite && <div className="absolute start-4 top-4 z-10">{favorite}</div>}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <Link
            to={paths.font.getHref(font.id)}
            dir="ltr"
            className="truncate text-xl font-semibold tracking-tight after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            {font.name}
          </Link>
          <span className="shrink-0 text-meta text-muted-foreground">{meta ?? weightsLabel(font.weights)}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <DesignerAvatars designers={font.designers} />
          <Byline font={font} />
        </div>
        {extra}
        {action ?? (
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-lic">{USAGE_LABEL[font.usage]}</span>
            <DownloadButton fontName={font.name} file={font.download} />
          </div>
        )}
      </div>
    </article>
  );
}
