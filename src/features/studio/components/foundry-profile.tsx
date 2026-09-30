import { ProfileHeader } from '@/components/shared/profile-header';
import { LANG_LABEL } from '@/lib/labels';
import type { Foundry } from '@/types/domain/foundry';

/** رأس صفحة المسبك (تصميم 20-09 «مسبك تجاريب») — شعار مربّع، لغات الخطوط، وأرقام المسبك */
export function FoundryProfile({
  foundry,
  stats,
  cover,
  avatar,
}: {
  foundry: Foundry;
  stats: { fonts: number; downloads: number };
  cover?: string;
  avatar?: string;
}) {
  return (
    <ProfileHeader
      titleId="foundry-name"
      cover={cover}
      mark={
        avatar ? (
          <img
            src={avatar}
            alt={`شعار ${foundry.name}`}
            className="size-24 rounded-lg border-4 border-card object-cover shadow-soft sm:size-28"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-24 place-items-center rounded-lg border-4 border-card bg-sunken text-4xl font-semibold text-muted-foreground shadow-soft sm:size-28"
          >
            {foundry.mark}
          </span>
        )
      }
      name={foundry.name}
      nameEn={foundry.nameEn}
      verified={foundry.verified}
      location={foundry.location}
      chips={foundry.langs.map((l) => LANG_LABEL[l])}
      chipsLabel="لغات الخطوط"
      bio={foundry.bio}
      links={foundry.links}
      stats={[
        ['خطوط', stats.fonts],
        ['تحميل', stats.downloads],
        ['متابع', foundry.followers],
      ]}
    />
  );
}
