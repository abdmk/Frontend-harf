import { FollowButton } from '@/components/shared/follow-button';
import { SocialIcon } from '@/components/shared/social-icons';
import { VerifiedBadge } from '@/components/shared/verified-badge';
import { Button } from '@/components/ui/button';
import { GlobeIcon, MapPinIcon, ShareIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';
import { LANG_LABEL } from '@/lib/labels';
import type { Foundry } from '@/types/domain/foundry';

/**
 * رأس صفحة المسبك (تصميم 20-09 «مسبك تجاريب»): غلاف، شعار، الاسم مع التوثيق، اللغات، الموقع، نبذة، روابط —
 * وعلى الطرف الآخر المتابعة والمشاركة وأرقام المسبك (خطوط، تحميلات، متابعون) بدل مساحة فارغة.
 */
export function FoundryProfile({ foundry, stats }: { foundry: Foundry; stats: { fonts: number; downloads: number } }) {
  const links = [
    foundry.links.website && { href: foundry.links.website, label: 'الموقع', icon: <GlobeIcon className="size-4.5" /> },
    foundry.links.instagram && {
      href: foundry.links.instagram,
      label: 'Instagram',
      icon: <SocialIcon label="Instagram" className="size-4.5" />,
    },
    foundry.links.behance && {
      href: foundry.links.behance,
      label: 'Behance',
      icon: <span className="text-caption font-bold">Bē</span>,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  const numbers = [
    ['خطوط', stats.fonts],
    ['تحميل', stats.downloads],
    ['متابع', foundry.followers],
  ] as const;

  return (
    <section aria-labelledby="foundry-name" className="overflow-hidden rounded-xl border bg-card">
      <div aria-hidden className="h-28 bg-(image:--grad-cover) sm:h-40" />
      <div className="grid gap-6 px-5 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div className="min-w-0">
          <span
            aria-hidden
            className="-mt-12 grid size-24 place-items-center rounded-lg border-4 border-card bg-sunken text-4xl font-semibold text-muted-foreground shadow-soft sm:-mt-14 sm:size-28"
          >
            {foundry.mark}
          </span>
          <h1 id="foundry-name" className="mt-4 flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
            {foundry.name}
            {foundry.verified && <VerifiedBadge className="size-5" />}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-muted-foreground">
            <span dir="ltr" className="font-medium text-foreground">
              {foundry.nameEn}
            </span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-4" />
              {foundry.location}
            </span>
          </p>
          <ul aria-label="لغات الخطوط" className="mt-3 flex flex-wrap gap-1.5">
            {foundry.langs.map((l) => (
              <li key={l} className="rounded-full bg-tint-brand px-3 py-1 text-caption text-primary">
                {LANG_LABEL[l]}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[62ch] text-control leading-relaxed text-muted-foreground">{foundry.bio}</p>
          {links.length > 0 && (
            <ul aria-label="روابط المسبك" className="mt-5 flex flex-wrap gap-2">
              {links.map((l) => (
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
            <FollowButton name={foundry.name} className="h-11 flex-1" />
            <Button variant="outline" className="h-11" onClick={() => share(foundry.name)}>
              <ShareIcon />
              مشاركة
            </Button>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-border rounded-lg bg-sunken py-4 text-center">
            {numbers.map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse gap-0.5">
                <dt className="text-caption text-muted-foreground">{k}</dt>
                <dd dir="ltr" className="text-lg font-semibold tabular-nums">
                  {v.toLocaleString('en-US')}
                </dd>
              </div>
            ))}
          </dl>
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
