import { useLayoutEffect, useRef } from 'react';

/**
 * يحرّك مؤشّراً (خطّاً أو حبّة) ليطابق العنصر النشط داخل حاوية — للتبويبات والمبدّلات.
 * يتابع تغيّر العنصر النشط وتغيّر المقاسات تلقائياً، فلا يحتاج الاستدعاء إلى تبعيات.
 */
export function useSlidingIndicator<C extends HTMLElement, I extends HTMLElement>(activeSelector: string) {
  const container = useRef<C>(null);
  const indicator = useRef<I>(null);
  useLayoutEffect(() => {
    const box = container.current;
    const ind = indicator.current;
    if (!box || !ind) return;
    const place = () => {
      const on = box.querySelector<HTMLElement>(activeSelector);
      ind.style.opacity = on ? '1' : '0';
      if (!on) return;
      ind.style.width = `${on.offsetWidth}px`;
      ind.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(box);
    const mo = new MutationObserver(place);
    mo.observe(box, { subtree: true, attributes: true, attributeFilter: ['data-state', 'aria-pressed'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [activeSelector]);
  return [container, indicator] as const;
}
