import { type ComponentPropsWithoutRef, type ElementType, useLayoutEffect, useRef } from 'react';

type RevealProps<T extends ElementType> = {
  as?: T;
  /** ترتيب العنصر ضمن مجموعته — يؤخّر ظهوره قليلاً (تتابع) */
  index?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * دخول هادئ للعناصر الظاهرة عند فتح الصفحة فقط (تتابع قصير). ما تحت الشاشة لا يُخفى أبداً —
 * فلا فراغات عند التمرير السريع أو البحث داخل الصفحة أو الطباعة. بلا حركة عند تفضيل تقليلها.
 */
export function Reveal<T extends ElementType = 'div'>({ as, index = 0, style, ...props }: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const Comp = (as ?? 'div') as ElementType;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) el.dataset.reveal = 'enter';
  }, []);

  return <Comp ref={ref} style={{ ...style, '--reveal-i': index % 6 }} {...props} />;
}
