import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { HarfLockup, HarfMark } from '@/components/shared/harf-logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { paths } from '@/config/paths';

import { HeaderNav } from './header-nav';

const NAV_CLASS =
  'col-span-2 -mx-4 h-12 border-t border-subtle px-1 lg:mx-0 lg:h-full lg:flex-1 lg:justify-center lg:border-0 lg:px-0';

type SiteHeaderProps = {
  /** أزرار الترويسة القادمة من الـfeatures (السلة، الإشعارات، الحساب) */
  actions?: ReactNode;
};

/** الترويسة بعرض عمود المحتوى نفسه في كل الصفحات */
export function SiteHeader({ actions }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-subtle bg-background/90 backdrop-blur-lg backdrop-saturate-150">
      <a
        href="#main"
        className="absolute start-4 -top-16 z-50 rounded-sm bg-ink px-4 py-2 text-sm text-ink-foreground transition-[top] focus:top-3"
      >
        تخطَّ إلى المحتوى
      </a>
      <div className="container-page mx-auto grid grid-cols-[auto_1fr] items-center gap-x-6 lg:flex lg:h-18">
        <Link
          to={paths.home.getHref()}
          aria-label="مكتبة حرف — الرئيسية"
          className="flex h-16 items-center text-primary"
        >
          <HarfLockup className="hidden h-8.5 sm:block" />
          <HarfMark className="sm:hidden" />
        </Link>
        <div className="col-start-2 row-start-1 flex items-center justify-end gap-1 lg:order-3">
          <ThemeToggle />
          {actions}
        </div>
        {/* useSearchParams يحتاج حدّ Suspense في الصفحات الثابتة */}
        <Suspense fallback={<div className={NAV_CLASS} />}>
          <HeaderNav className={NAV_CLASS} />
        </Suspense>
      </div>
    </header>
  );
}
