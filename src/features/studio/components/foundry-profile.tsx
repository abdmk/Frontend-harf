import { FollowButton } from '@/components/shared/follow-button';
import { SocialIcon } from '@/components/shared/social-icons';
import { GlobeIcon, MapPinIcon } from '@/components/ui/icons';
import { LANG_LABEL } from '@/lib/labels';
import type { Foundry } from '@/types/domain/foundry';

/** رأس صفحة المسبك (تصميم 20-09 «مسبك تجاريب»): غلاف، شعار، لغات، موقع، نبذة، روابط، متابعون */
export function FoundryProfile({ foundry }: { foundry: Foundry }) {
  const links = [
    foundry.links.website && { href: foundry.links.website, label: 'الموقع', icon: <GlobeIcon className="size-4" /> },
    foundry.links.instagram && {
      href: foundry.links.instagram,
      label: 'Instagram',
      icon: <SocialIcon label="Instagram" className="size-4" />,
    },
    foundry.links.behance && {
      href: foundry.links.behance,
      label: 'Behance',
      icon: <span className="text-caption font-bold">Bē</span>,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div aria-hidden className="h-32 bg-(image:--grad-ink) sm:h-40" />
      <div className="relative px-6 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
          <span
            aria-hidden
            className="grid size-24 place-items-center rounded-lg border-4 border-card bg-sunken text-4xl font-semibold text-muted-foreground shadow-soft"
          >
            {foundry.mark}
          </span>
          <FollowButton name={foundry.name} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{foundry.name}</h1>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {foundry.langs.map((l) => (
            <li key={l} className="rounded-full bg-tint-brand px-2.5 py-0.5 text-caption text-primary">
              {LANG_LABEL[l]}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-meta text-muted-foreground">
          <MapPinIcon className="size-4" />
          {foundry.location}
        </p>
        <p className="mt-1 text-meta">
          <span className="text-muted-foreground">المسبك: </span>
          <span dir="ltr" className="font-medium">
            {foundry.nameEn}
          </span>
        </p>
        <p className="mt-4 max-w-[70ch] text-control leading-relaxed text-muted-foreground">{foundry.bio}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={l.label}
              className="grid size-10 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-strong hover:text-foreground"
            >
              {l.icon}
            </a>
          ))}
          <span className="ms-2 text-meta">
            <strong dir="ltr">{foundry.followers.toLocaleString('en-US')}</strong> متابعاً
          </span>
        </div>
      </div>
    </section>
  );
}
