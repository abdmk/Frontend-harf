import { Link } from 'react-router';

import { Avatar } from '@/components/shared/avatar';
import { ProfileHeader } from '@/components/shared/profile-header';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import type { DesignerProfile } from '@/types/domain/designer';
import type { Foundry } from '@/types/domain/foundry';

/**
 * رأس صفحة المصمّم — نفس هيكل رأس المسبك (زوج واحد)، لكن بصورة دائرية بدل الشعار،
 * ودوره بدل اللغات، وبطاقة «ينشر مع» تقود إلى مسبكه.
 */
export function DesignerProfileHeader({
  designer,
  foundry,
  stats,
}: {
  designer: DesignerProfile;
  foundry: Foundry | null;
  stats: { fonts: number; weights: number };
}) {
  return (
    <ProfileHeader
      titleId="designer-name"
      mark={
        <Avatar
          initials={designer.initials}
          seed={designer.id}
          size="xl"
          className="size-24 text-2xl shadow-soft ring-4 ring-card sm:size-28"
        />
      }
      name={designer.nameAr}
      kindLabel="مصمّم"
      nameEn={designer.nameEn}
      verified={designer.verified}
      location={designer.location}
      chips={[designer.role]}
      chipsLabel="الدور"
      bio={designer.bio}
      links={designer.links}
      stats={[
        ['خطوط', stats.fonts],
        ['أوزان', stats.weights],
        ['متابع', designer.followers],
      ]}
      aside={
        foundry && (
          <Link
            to={paths.foundry.getHref(foundry.id)}
            className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-strong"
          >
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-sm bg-sunken text-lg font-semibold text-muted-foreground"
            >
              {foundry.mark}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-caption text-tertiary">ينشر مع</span>
              <span className="block truncate text-control font-medium">{foundry.name}</span>
            </span>
            <ChevronLeftIcon className="size-4 text-tertiary transition-transform group-hover:-translate-x-0.5" />
          </Link>
        )
      }
    />
  );
}
