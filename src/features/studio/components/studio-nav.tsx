import { Link, useLocation } from 'react-router';

import { paths } from '@/config/paths';

import { FINANCE_TABS } from '../config/nav';

/** القسم الحالي من المسار: '' للنظرة العامة، 'finance/sales'… */
export function useStudioSection() {
  const { pathname } = useLocation();
  return pathname.replace(/^\/studio\/?/, '').replace(/\/$/, '');
}

const TAB =
  'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-control whitespace-nowrap text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:font-medium aria-[current=page]:text-background';

/** تبويبات المالية — نفس الصفّ في الصفحات الثلاث، ويتمرّر أفقياً على الجوال */
export function FinanceTabs() {
  const current = useStudioSection();
  return (
    <nav
      aria-label="أقسام المالية"
      className="-mx-4 mb-6 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {FINANCE_TABS.map((t) => (
        <Link
          key={t.section}
          to={paths.studio.getHref(t.section)}
          aria-current={current === t.section ? 'page' : undefined}
          className={TAB}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
