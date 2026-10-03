import { type ReactNode, useState } from 'react';
import { Link } from 'react-router';

import { Avatar } from '@/components/shared/avatar';
import { HarfMark } from '@/components/shared/harf-logo';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, MenuIcon } from '@/components/ui/icons';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { paths } from '@/config/paths';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/cn';

import { useAdminSection } from './admin-nav';
import { usePendingCount } from '../api/review';
import { usePendingStudios } from '../api/studios';
import { ADMIN_GROUPS, ADMIN_NAV } from '../config/nav';

/** القائمة الجانبية الكاملة: الهوية، مجموعات الأقسام بعناوينها، ثم بطاقة المشرف في الأسفل */
function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const current = useAdminSection();
  const pending = usePendingCount();
  const pendingStudios = usePendingStudios();
  const user = useCurrentUser();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <span className="grid size-10 place-items-center rounded-lg border bg-card text-primary shadow-soft">
          <HarfMark className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-control font-bold">مكتبة حرف</p>
          <p className="text-caption text-muted-foreground">لوحة الإدارة</p>
        </div>
      </div>

      <nav aria-label="أقسام الإدارة" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-2">
        {ADMIN_GROUPS.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 px-3 text-caption font-medium text-tertiary">{g.title}</p>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((section) => {
                const item = ADMIN_NAV.find((n) => n.section === section)!;
                const on = (section ?? '') === current;
                return (
                  <li key={item.label}>
                    <Link
                      to={paths.admin.getHref(section ?? undefined)}
                      onClick={onNavigate}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'group/it flex h-11 items-center gap-3 rounded-md px-3 text-control transition-colors duration-(--dur-fast)',
                        on
                          ? 'border bg-card font-semibold text-foreground shadow-soft'
                          : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
                      )}
                    >
                      <item.Icon
                        filled={on}
                        className={cn(
                          'size-5 shrink-0 transition-transform duration-(--dur-base) ease-pop group-hover/it:scale-110',
                          on && 'text-primary',
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {section === 'review' && pending > 0 && (
                        <span
                          dir="ltr"
                          aria-label={`${pending} بانتظار المراجعة`}
                          className="grid h-5.5 min-w-5.5 place-items-center rounded-full bg-primary-fill px-1.5 text-caption font-semibold text-primary-foreground tabular-nums"
                        >
                          {pending}
                        </span>
                      )}
                      {section === 'studios' && pendingStudios > 0 && (
                        <span
                          dir="ltr"
                          aria-label={`${pendingStudios} طلبات توثيق`}
                          className="grid h-5.5 min-w-5.5 place-items-center rounded-full bg-primary-fill px-1.5 text-caption font-semibold text-primary-foreground tabular-nums"
                        >
                          {pendingStudios}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t p-3">
        <Link
          to={paths.home.getHref()}
          onClick={onNavigate}
          className="flex h-10 items-center gap-3 rounded-md px-3 text-control text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4.5 rotate-180" />
          العودة إلى الموقع
        </Link>
        {user && (
          <Link
            to={paths.account.getHref('')}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg border bg-card p-2.5 transition-colors hover:border-strong"
          >
            <Avatar initials={user.initials} seed={user.id} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-control font-semibold">{user.name}</span>
              <span dir="ltr" className="block truncate text-end text-caption text-muted-foreground">
                {user.email}
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * غلاف لوحة الإدارة كتطبيق مستقلّ: عمود جانبي بطول الشاشة، وشريط علوي داخل منطقة المحتوى،
 * ومحتوى على أرضية رمادية هادئة تبرز فوقها البطاقات — بمساحات أوسع من صفحات الموقع.
 */
export function AdminShell({ actions, children }: { actions: ReactNode; children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="min-h-dvh bg-sunken/60 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-e bg-sunken lg:block">
        <SideNav />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-lg sm:px-6 lg:px-10">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="قائمة الإدارة"
            onClick={() => setMenu(true)}
          >
            <MenuIcon className="size-5" />
          </Button>
          <Link to={paths.admin.getHref()} className="flex items-center gap-2 font-bold lg:hidden">
            <HarfMark className="size-6 text-primary" />
            الإدارة
          </Link>
          <div className="ms-auto flex items-center gap-1">{actions}</div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="right" className="w-72 bg-sunken p-0">
          <SheetTitle className="sr-only">قائمة الإدارة</SheetTitle>
          <SideNav onNavigate={() => setMenu(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
