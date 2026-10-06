import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type CarouselProps = {
  slides: ReactNode[];
  label: string;
  /** مللي ثانية — التقلّب التلقائي (يتوقّف عند المرور والتركيز، ويُلغى مع تقليل الحركة) */
  autoPlay?: number;
  index?: number;
  onIndexChange?: (i: number) => void;
  className?: string;
  slideClassName?: string;
  /** عناصر إضافية فوق الشريحة (مثل زرّ ملء الشاشة) */
  overlay?: ReactNode;
};

export function Carousel({
  slides,
  label,
  autoPlay,
  index,
  onIndexChange,
  className,
  slideClassName,
  overlay,
}: CarouselProps) {
  const n = slides.length;
  const [inner, setInner] = useState(0);
  const current = index ?? inner;
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (k: number) => {
      const next = (k + n) % n;
      setInner(next);
      onIndexChange?.(next);
    },
    [n, onIndexChange],
  );

  useEffect(() => {
    // مع «تقليل الحركة» يبقى التقلّب لكن بلا انزلاق (التحريك يُلغى من globals.css) — والمرور يوقفه
    if (!autoPlay || n < 2) return;
    const t = window.setInterval(() => {
      if (!paused.current && !document.hidden) go(current + 1);
    }, autoPlay);
    return () => window.clearInterval(t);
  }, [autoPlay, current, go, n]);

  return (
    <div
      role="region"
      aria-roledescription="شريحة عرض"
      aria-label={label}
      tabIndex={0}
      className={cn('group/car relative isolate overflow-hidden bg-sunken outline-offset-4', className)}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      // التركيز بلوحة المفاتيح يوقف التقلّب؛ النقر على الأسهم لا يوقفه إلى الأبد
      onFocus={(e) => (paused.current = (e.target as HTMLElement).matches(':focus-visible'))}
      onBlur={() => (paused.current = false)}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest('input,[contenteditable]')) return;
        // في العربية: اليسار = التالي
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(current + 1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          go(current - 1);
        }
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') touchX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (touchX.current == null) return;
        const dx = e.clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
      }}
    >
      <div
        className="flex h-full transition-transform duration-(--dur-xslow) ease-in-out-strong will-change-transform"
        style={{ transform: `translateX(${current * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="شريحة"
            aria-label={`${i + 1} من ${n}`}
            aria-hidden={i !== current}
            inert={i !== current}
            className={cn('h-full w-full shrink-0', slideClassName)}
          >
            {s}
          </div>
        ))}
      </div>

      {overlay}

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="السابق"
            onClick={() => go(current - 1)}
            className="absolute start-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-nav-car text-muted-foreground shadow-soft transition-[transform,color] duration-(--dur-base) ease-pop hover:scale-105 hover:text-foreground active:scale-95 sm:grid md:start-8"
          >
            <ChevronRightIcon className="size-4.5" />
          </button>
          <button
            type="button"
            aria-label="التالي"
            onClick={() => go(current + 1)}
            className="absolute end-5 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-nav-car text-muted-foreground shadow-soft transition-[transform,color] duration-(--dur-base) ease-pop hover:scale-105 hover:text-foreground active:scale-95 sm:grid md:end-8"
          >
            <ChevronLeftIcon className="size-4.5" />
          </button>
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`الشريحة ${i + 1}`}
                aria-current={i === current}
                onClick={() => go(i)}
                className={cn(
                  'grid h-3 place-items-center transition-[width] duration-(--dur-slow) ease-out-quint',
                  i === current ? 'w-8' : 'w-2',
                )}
              >
                <span
                  className={cn(
                    'block h-0.75 w-full rounded-full transition-colors duration-(--dur-slow)',
                    i === current ? 'bg-muted-foreground' : 'bg-strong',
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
