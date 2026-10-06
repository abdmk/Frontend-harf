import { ProfileHeader } from '@/components/shared/profile-header';
import { cn } from '@/lib/utils';
import { KIND_LABEL, type ProfileKind } from '@/stores/public-profile';
import type { Foundry } from '@/types/domain/foundry';
import { LANG_LABEL } from '@/utils/labels';

/**
 * رأس صفحة الاستوديو — صاحبها يختار نوعها: مسبك (شعار مربّع) أو مصمّم مستقلّ (صورة دائرية).
 * البنية واحدة، والفرق في الشكل والتسمية فقط.
 */
export function FoundryProfile({
  foundry,
  stats,
  cover,
  avatar,
  kind = 'foundry',
}: {
  foundry: Foundry;
  stats: { fonts: number; downloads: number };
  cover?: string;
  avatar?: string;
  kind?: ProfileKind;
}) {
  const shape = kind === 'designer' ? 'rounded-full' : 'rounded-lg';
  return (
    <ProfileHeader
      titleId="foundry-name"
      cover={cover}
      mark={
        avatar ? (
          <img
            src={avatar}
            alt={kind === 'designer' ? foundry.name : `شعار ${foundry.name}`}
            className={cn('size-24 border-4 border-card object-cover shadow-soft sm:size-28', shape)}
          />
        ) : (
          <span
            aria-hidden
            className={cn(
              'grid size-24 place-items-center border-4 border-card bg-sunken text-4xl font-semibold text-muted-foreground shadow-soft sm:size-28',
              shape,
            )}
          >
            {foundry.mark}
          </span>
        )
      }
      name={foundry.name}
      kindLabel={KIND_LABEL[kind]}
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
