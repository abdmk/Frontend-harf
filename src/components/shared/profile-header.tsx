import type { ReactNode } from 'react';

import { FollowButton } from '@/components/shared/follow-button';
import { SocialIcon } from '@/components/shared/social-icons';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { Button } from '@/components/ui/button';
import { GlobeIcon, MapPinIcon, ShareIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

type Links = { website?: string; instagram?: string; behance?: string };

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
      icon: <span className="text-caption font-bold">Bē</span>,
    },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[];

  return (
    <section aria-labelledby={titleId} className="overflow-hidden rounded-xl border bg-card">
      {/* غلاف مسطّح هادئ بلا تدرّج */}
      <div aria-hidden className="h-24 bg-sunken sm:h-32" />
      <div className="grid gap-6 px-5 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div className="min-w-0">
          <div className="-mt-12 sm:-mt-14">{mark}</div>
          <h1 id={titleId} className="mt-4 flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
            {name}
            {verified && <VerifiedBadge className="size-5" />}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted-foreground">
            {nameEn && nameEn !== name && (
              <>
                <span dir="ltr" className="font-medium text-foreground">
                  {nameEn}
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-4" />
              {location}
            </span>
          </p>
          {chips && chips.length > 0 && (
            <ul aria-label={chipsLabel} className="mt-3 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <li key={c} className="rounded-full bg-tint-brand px-3 py-1 text-caption text-primary">
                  {c}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 max-w-[62ch] text-control leading-relaxed text-muted-foreground">{bio}</p>
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

        <aside className="flex flex-col gap-3 lg:pt-6">
          <div className="flex gap-2">
            <FollowButton name={name} className="h-11 flex-1" />
            <Button variant="outline" className="h-11" onClick={() => share(name)}>
              <ShareIcon />
              مشاركة
            </Button>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-border rounded-lg bg-sunken py-4 text-center">
            {stats.map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse gap-0.5">
                <dt className="text-caption text-muted-foreground">{k}</dt>
                <dd dir="ltr" className="text-lg font-semibold tabular-nums">
                  {v.toLocaleString('en-US')}
                </dd>
              </div>
            ))}
          </dl>
          {aside}
        </aside>
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
