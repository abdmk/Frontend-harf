'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useLayoutEffect, useRef } from 'react';

import { mainNav } from '@/config/site';
import { cn } from '@/lib/cn';

/** «خطوط مجانية» تشمل الرئيسية وصفحات الخطوط */
function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/fonts');
  return href !== '#' && pathname.startsWith(href);
}

export function HeaderNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);

  // المؤشّر الأحمر ينزلق إلى الرابط الحالي (وإلى الرابط تحت المؤشّر عند المرور)
  useLayoutEffect(() => {
    const nav = navRef.current;
    const ind = indRef.current;
    if (!nav || !ind) return;
    const place = (a: Element | null) => {
      if (!a) {
        ind.style.opacity = '0';
        return;
      }
      const n = nav.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      ind.style.opacity = '1';
      ind.style.width = `${r.width - 24}px`;
      ind.style.transform = `translateX(${r.left - n.left + nav.scrollLeft + 12}px)`;
    };
    const home = () => place(nav.querySelector('[aria-current="page"]'));
    home();
    const over = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a');
      if (a && !matchMedia('(prefers-reduced-motion: reduce)').matches) place(a);
    };
    const ro = new ResizeObserver(home);
    ro.observe(nav);
    nav.addEventListener('mouseover', over);
    nav.addEventListener('mouseleave', home);
    return () => {
      ro.disconnect();
      nav.removeEventListener('mouseover', over);
      nav.removeEventListener('mouseleave', home);
    };
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="الأقسام"
      className={cn(
        'relative flex [scrollbar-width:none] items-stretch overflow-x-auto [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {mainNav.map((group, g) => (
        <Fragment key={g}>
          {g > 0 && <span aria-hidden className="mx-3 h-5 w-px shrink-0 self-center bg-border" />}
          {group.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-150 hover:text-foreground',
                  active && 'font-medium text-primary hover:text-primary',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </Fragment>
      ))}
      <span
        ref={indRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-t-sm bg-primary opacity-0 transition-[transform,width,opacity] duration-300 ease-out-quint"
      />
    </nav>
  );
}
