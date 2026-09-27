import { type ComponentPropsWithoutRef, type ElementType, useEffect, useRef } from 'react';

type RevealProps<T extends ElementType> = {
  as?: T;
  /** ترتيب العنصر ضمن مجموعته — يؤخّر ظهوره قليلاً (تتابع) */
  index?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * يُظهر العنصر بانزلاق خفيف حين يدخل الشاشة. بلا حركة عند تفضيل تقليلها،
 * وبلا إخفاء أصلاً إن لم يعمل JavaScript (الحالة الأولى تُضاف بعد التحميل).
 */
export function Reveal<T extends ElementType = 'div'>({ as, index = 0, style, ...props }: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const Comp = (as ?? 'div') as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // ظاهر أصلاً: لا نخفيه ثم نظهره
    el.dataset.reveal = 'out';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.reveal = 'in';
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <Comp ref={ref} style={{ ...style, '--reveal-i': index % 6 }} {...props} />;
}
