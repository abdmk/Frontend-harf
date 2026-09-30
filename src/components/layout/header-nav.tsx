import { useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';

import { mainNav } from '@/config/site';
import { cn } from '@/lib/cn';

/** «خطوط مجانية» تشمل الرئيسية وصفحات الخطوط، و«خطوط مدفوعة» هي المكتبة بفلتر المدفوع */
function isActive(href: string, pathname: string, paid: boolean) {
  if (href === '/') return !paid && (pathname === '/' || pathname.startsWith('/fonts'));
  if (href.startsWith('/?')) return paid && pathname === '/';
  return href !== '#' && pathname.startsWith(href);
}

export function HeaderNav({
  className,
  onIntent,
}: {
  className?: string;
  /** مرور المؤشّر أو التركيز على رابط — لبدء تنزيل حزمة الصفحة مسبقاً (من طبقة التطبيق) */
  onIntent?: (href: string) => void;
}) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const paid = searchParams.get('license') === 'paid';
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
    // على الجوال الشريط يتمرّر أفقياً: أظهر القسم الحالي كي يعرف الزائر أين هو
    const current = nav.querySelector('[aria-current="page"]');
    if (current && nav.scrollWidth > nav.clientWidth) {
      const n = nav.getBoundingClientRect();
      const r = current.getBoundingClientRect();
      if (r.left < n.left || r.right > n.right) {
        nav.scrollTo({ left: nav.scrollLeft + r.left - n.left - (n.width - r.width) / 2 });
      }
    }
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
  }, [pathname, paid]);

  return (
    <nav
      ref={navRef}
      aria-label="الأقسام"
      className={cn(
        'relative flex [scrollbar-width:none] items-stretch overflow-x-auto [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {mainNav.map((item) => {
        const active = isActive(item.href, pathname, paid);
        return (
          <Link
            key={item.label}
            to={item.href}
            aria-current={active ? 'page' : undefined}
            // تبدأ حزمة الصفحة الثقيلة بالتنزيل قبل النقر — فيكون الانتقال شبه فوري
            onPointerEnter={() => onIntent?.(item.href)}
            onFocus={() => onIntent?.(item.href)}
            className={cn(
              'flex shrink-0 items-center px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground',
              active && 'font-medium text-primary hover:text-primary',
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <span
        ref={indRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-t-sm bg-primary-fill opacity-0 transition-[transform,width,opacity] duration-(--dur-slow) ease-out-quint"
      />
    </nav>
  );
}
