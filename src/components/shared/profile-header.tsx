import type { ReactNode } from 'react';

import { FollowButton } from '@/components/shared/follow-button';
import { SocialIcon } from '@/components/shared/social-icons';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { Button } from '@/components/ui/button';
import { GlobeIcon, MapPinIcon, ShareIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

type Links = { website?: string; instagram?: string; behance?: string; x?: string; linkedin?: string };

/**
 * رأس الملف العام — مشترك بين صفحة المسبك وصفحة المصمّم حتى تبدوا زوجاً واحداً:
 * غلاف، شارة (شعار مربّع للمسبك، صورة دائرية للمصمّم)، الاسم مع التوثيق، سطر تعريف،
 * شرائح، نبذة، روابط — وعلى الطرف الآخر المتابعة والمشاركة والأرقام.
 */
export function ProfileHeader({
  titleId,
  mark,
  name,
  nameEn,
  verified,
  location,
  chips,
  chipsLabel,
  bio,
  links,
  stats,
  aside,
  cover,
  kindLabel,
}: {
  titleId: string;
  /** الشعار أو الصورة — يتداخل مع الغلاف */
  mark: ReactNode;
  name: string;
  nameEn?: string;
  verified?: boolean;
  location: string;
  chips?: string[];
  chipsLabel?: string;
  bio: string;
  links: Links;
  stats: readonly (readonly [string, number])[];
  /** محتوى إضافي تحت الأرقام (مثل «ينشر مع») */
  aside?: ReactNode;
  /** صورة الغلاف (مُعاد ترميزها) — بدونها سطح هادئ */
  cover?: string;
  /** «مسبك» أو «مصمّم مستقلّ» — بجانب الاسم */
  kindLabel?: string;
}) {
  const items = [
    links.website && { href: links.website, label: 'الموقع', icon: <GlobeIcon className="size-4.5" /> },
    links.instagram && {
      href: links.instagram,
      label: 'Instagram',
      icon: <SocialIcon label="Instagram" className="size-4.5" />,
    },
    links.behance && {
      href: links.behance,
      label: 'Behance',
      icon: <SocialIcon label="Behance" className="h-4.5 w-auto" />,
    },
    links.x && { href: links.x, label: 'X', icon: <SocialIcon label="X" className="size-4" /> },
    links.linkedin && {
      href: links.linkedin,
      label: 'LinkedIn',
      icon: <SocialIcon label="LinkedIn" className="size-4" />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[];

  return (
    <section aria-labelledby={titleId} className="overflow-hidden rounded-xl border bg-card">
      {/* غلاف مسطّح هادئ بلا تدرّج */}
      {cover ? (
        <img src={cover} alt="" className="h-32 w-full object-cover sm:h-52" />
      ) : (
        <div aria-hidden className="h-28 bg-sunken sm:h-40" />
      )}
      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        {/* صفّ أوّل: الشعار يتداخل مع الغلاف، والمتابعة والمشاركة على الطرف الآخر من السطر نفسه */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="-mt-12 sm:-mt-16">{mark}</div>
          <div className="flex gap-2">
            <FollowButton name={name} className="h-10 min-w-28" />
            <Button variant="outline" className="h-10" onClick={() => share(name)} aria-label={`مشاركة ${name}`}>
              <ShareIcon />
              <span className="hidden sm:inline">مشاركة</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 id={titleId} className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
            {name}
            {verified && <VerifiedBadge className="size-5" />}
          </h1>
          {kindLabel && (
            <span className="rounded-full bg-sunken px-2.5 py-0.5 text-caption font-medium text-muted-foreground">
              {kindLabel}
            </span>
          )}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted-foreground">
          {nameEn && nameEn !== name && (
            <>
              <span dir="ltr" className="font-medium text-foreground">
                {nameEn}
              </span>
              {location && <span aria-hidden>·</span>}
            </>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-4" />
              {location}
            </span>
          )}
        </p>

        {/* الأرقام سطراً واحداً — بلا صندوق منفصل يترك فراغاً في الوسط */}
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {stats.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-1.5">
              <dd dir="ltr" className="text-lead font-semibold tabular-nums">
                {v.toLocaleString('en-US')}
              </dd>
              <dt className="text-meta text-muted-foreground">{k}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <div className="min-w-0">
            {chips && chips.length > 0 && (
              <ul aria-label={chipsLabel} className="mb-4 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <li key={c} className="rounded-full bg-tint-brand px-3 py-1 text-caption text-primary">
                    {c}
                  </li>
                ))}
              </ul>
            )}
            {bio && <p className="max-w-[62ch] text-control leading-relaxed text-muted-foreground">{bio}</p>}
            {items.length > 0 && (
              <ul aria-label={`روابط ${name}`} className="mt-5 flex flex-wrap gap-2">
                {items.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={l.label}
                      className="grid size-10 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-strong hover:text-foreground"
                    >
                      {l.icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {aside && <aside className="flex flex-col gap-3">{aside}</aside>}
        </div>
      </div>
    </section>
  );
}

/** مشاركة الصفحة: قائمة النظام إن توفّرت، وإلا نسخ الرابط */
async function share(name: string) {
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title: name, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast({ tone: 'success', title: 'نُسخ رابط الصفحة' });
  } catch (e) {
    if ((e as DOMException)?.name !== 'AbortError') toast({ tone: 'danger', title: 'تعذّرت المشاركة' });
  }
}
