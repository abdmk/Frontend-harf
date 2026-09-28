import { useSyncExternalStore } from 'react';

import { MoonIcon, SunIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

const THEME_STORAGE_KEY = 'harf-theme';

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => obs.disconnect();
}
const isDark = () => document.documentElement.classList.contains('dark');

/** يبدّل الفاتح/الداكن، يحفظ الاختيار، وينقل الألوان بنعومة لحظة التبديل فقط */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const label = dark ? 'الوضع النهاري' : 'الوضع الليلي';

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains('dark');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-anim');
      window.setTimeout(() => root.classList.remove('theme-anim'), 420);
    }
    root.classList.toggle('dark', next);
    root.style.colorScheme = next ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      /* التخزين غير متاح — يبقى الاختيار لهذه الجلسة */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-9 place-items-center rounded-sm text-muted-foreground transition-[background-color,color,transform] duration-(--dur-fast) hover:bg-sunken hover:text-foreground active:scale-90',
        className,
      )}
    >
      {dark ? (
        <SunIcon className="size-4.5 animate-in fade-in spin-in-45" />
      ) : (
        <MoonIcon className="size-4.5 animate-in fade-in spin-in-45" />
      )}
    </button>
  );
}
