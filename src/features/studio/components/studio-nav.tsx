import { Fragment } from 'react';
import { Link, useLocation } from 'react-router';

import { sideNavIcon, sideNavRow } from '@/components/shared/side-nav';
import { MyVerifiedBadge } from '@/components/shared/verified-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ChevronRightIcon, CloudUploadIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { paths, type StudioSection } from '@/config/paths';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAccountPhoto } from '@/lib/account-photo';
import { cn } from '@/lib/cn';
import { markOf, useProfileIncomplete, usePublicProfile } from '@/lib/public-profile';
import { type PublicStatus, useMyVerification } from '@/lib/studio-verification';
import type { Foundry } from '@/types/domain/foundry';

import { STUDIO_NAV, STUDIO_PROFILE_ITEM } from '../config/nav';

/** القسم الحالي من المسار: '' للنظرة العامة، 'finance/sales'… */
export function useStudioSection() {
  const { pathname } = useLocation();
  return pathname.replace(/^\/studio\/?/, '').replace(/\/$/, '');
}

const isOn = (current: string, section: StudioSection | null, exact = false) =>
  section === null
    ? current === ''
    : exact
      ? current === section
      : current === section || current.startsWith(`${section}/`);

/** حالة التوثيق على عنصر القائمة — لون ونصّ معاً، لا لون وحده */
const VERIFY_BADGE: Record<PublicStatus, { text: string; cls: string }> = {
  none: { text: 'غير موثّق', cls: 'bg-tint-warn text-warn-text' },
  draft: { text: 'غير مكتمل', cls: 'bg-tint-warn text-warn-text' },
  pending: { text: 'قيد المراجعة', cls: 'bg-tint-info text-info-text' },
  rejected: { text: 'يحتاج تعديلاً', cls: 'bg-tint-dgr text-dgr-text' },
  approved: { text: 'موثّق', cls: 'bg-tint-ok text-ok-text' },
};

function VerifyLink() {
  const rec = useMyVerification();
  const b = VERIFY_BADGE[rec?.status ?? 'none'];
  return (
    <Link to={paths.studio.getHref('verify')} className={sideNavRow(false)}>
      <ShieldCheckIcon className={sideNavIcon(false)} />
      <span className="flex-1">توثيق الحساب</span>
      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', b.cls)}>{b.text}</span>
    </Link>
  );
}

function IncompleteBadge() {
  return <span className="rounded-full bg-tint-warn px-2.5 py-0.5 text-xs font-medium text-warn-text">غير مكتمل</span>;
}

/** الاسم الظاهر: ما كتبه صاحب الاستوديو في ملفه العام، وإلا اسم الاستوديو */
function useStudioName(foundry: Foundry) {
  return usePublicProfile().name || foundry.name;
}

function StudioMark({ foundry, className }: { foundry: Foundry; className?: string }) {
  const profile = usePublicProfile();
  const account = useCurrentUser();
  // صورة واحدة في كل الموقع: صورة الملف الشخصي، وإلا صورة الحساب نفسها — ثم الحرف
  const accountPhoto = useAccountPhoto(account?.id);
  const photo = profile.avatar ?? accountPhoto ?? account?.avatarUrl;
  // الشكل يتبع نوع الصفحة: شعار مربّع للمسبك، صورة دائرية للمصمّم
  const shape = profile.kind === 'designer' ? 'rounded-full' : 'rounded-md';
  return photo ? (
    <img src={photo} alt="" className={cn('shrink-0 object-cover', shape, className)} />
  ) : (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center bg-card font-semibold text-muted-foreground', shape, className)}
    >
      {profile.name ? markOf(profile.name) : foundry.mark}
    </span>
  );
}

/**
 * العمود الجانبي لمساحة الاستوديو — منفصل عن الحساب الشخصي: هويّة الاستوديو، «رفع خط»،
 * الأقسام الأربعة (والمالية تفتح أقسامها حين تكون فيها)، ثم الملف العام والعودة إلى الحساب.
 */
export function StudioSidebar({ foundry }: { foundry: Foundry }) {
  const name = useStudioName(foundry);
  const current = useStudioSection();
  const incomplete = useProfileIncomplete();
  const profileOn = isOn(current, STUDIO_PROFILE_ITEM.section);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-lg bg-sunken p-5">
        <StudioMark foundry={foundry} className="size-14 text-2xl" />
        <div className="min-w-0 flex-1">
          <p className="text-caption text-tertiary">الاستوديو</p>
          <p className="flex items-center gap-1.5 text-base font-semibold">
            <span className="truncate">{name}</span>
            <MyVerifiedBadge />
          </p>
          <Link
            to={paths.foundry.getHref(foundry.id)}
            className="mt-0.5 inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-primary"
          >
            صفحتك العامة
            <ArrowLeftIcon className="size-3.5" />
          </Link>
        </div>
      </div>

      <Button asChild className="h-11">
        <Link to={paths.studio.getHref('publish')}>
          <CloudUploadIcon />
          رفع خط
        </Link>
      </Button>

      <nav aria-label="أقسام الاستوديو" className="flex flex-col">
        <ul className="flex flex-col gap-0.5">
          {STUDIO_NAV.map(({ section, label, Icon, children }) => {
            const on = isOn(current, section);
            const open = !!children && on;
            return (
              <li key={label}>
                <Link
                  to={paths.studio.getHref(section ?? undefined)}
                  aria-current={on && !children ? 'page' : undefined}
                  className={sideNavRow(on && !open)}
                >
                  <Icon filled={on} className={sideNavIcon(on)} />
                  <span className="flex-1">{label}</span>
                </Link>
                {open && (
                  <ul className="mt-0.5 flex flex-col gap-0.5">
                    {children.map((c) => {
                      const cOn = isOn(current, c.section, true);
                      return (
                        <li key={c.section}>
                          <Link
                            to={paths.studio.getHref(c.section)}
                            aria-current={cOn ? 'page' : undefined}
                            className={sideNavRow(cOn, 'sub')}
                          >
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <hr className="my-4 border-border" />
        <Link
          to={paths.studio.getHref(STUDIO_PROFILE_ITEM.section)}
          aria-current={profileOn ? 'page' : undefined}
          className={sideNavRow(profileOn)}
        >
          <STUDIO_PROFILE_ITEM.Icon filled={profileOn} className={sideNavIcon(profileOn)} />
          <span className="flex-1">{STUDIO_PROFILE_ITEM.label}</span>
          {incomplete && <IncompleteBadge />}
        </Link>
        <VerifyLink />
        <Link
          to={paths.account.getHref('')}
          className="mt-0.5 flex h-11 items-center gap-4 rounded-sm px-4 text-lead text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          <ChevronRightIcon className="size-5" />
          حسابك الشخصي
        </Link>
      </nav>
    </div>
  );
}

const TAB =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:font-medium aria-[current=page]:text-background';

/** على الشاشات الصغيرة: اسم الاستوديو وصفّ أقسام يتمرّر أفقياً، وصفّ ثانٍ لأقسام المالية */
export function StudioTabs({ foundry }: { foundry: Foundry }) {
  const name = useStudioName(foundry);
  const current = useStudioSection();
  const incomplete = useProfileIncomplete();
  const finance = STUDIO_NAV.find((n) => n.children)!;
  const inFinance = isOn(current, 'finance');
  return (
    <div className="flex flex-col gap-3 lg:hidden">
      <div className="flex items-center gap-3">
        <StudioMark foundry={foundry} className="size-10 bg-sunken text-lg" />
        <p className="flex min-w-0 flex-1 items-center gap-1.5 font-semibold">
          <span className="truncate">{name}</span>
          <MyVerifiedBadge />
        </p>
        <Button asChild size="sm">
          <Link to={paths.studio.getHref('publish')}>
            <CloudUploadIcon />
            رفع خط
          </Link>
        </Button>
      </div>
      <nav
        aria-label="أقسام الاستوديو"
        className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
      >
        {[...STUDIO_NAV, STUDIO_PROFILE_ITEM].map((n) => (
          <Fragment key={n.label}>
            <Link
              to={paths.studio.getHref(n.section ?? undefined)}
              aria-current={isOn(current, n.section) ? 'page' : undefined}
              className={TAB}
            >
              {n.label}
              {n.section === 'profile' && incomplete && <span className="size-1.5 rounded-full bg-warn-500" />}
            </Link>
          </Fragment>
        ))}
      </nav>
      {inFinance && (
        <nav
          aria-label="أقسام المالية"
          className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto border-t px-4 pt-3 [&::-webkit-scrollbar]:hidden"
        >
          {finance.children!.map((c) => (
            <Link
              key={c.section}
              to={paths.studio.getHref(c.section)}
              aria-current={isOn(current, c.section, true) ? 'page' : undefined}
              className={TAB}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
