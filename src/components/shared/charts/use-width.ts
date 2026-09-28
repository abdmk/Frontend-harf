import { useLayoutEffect, useRef, useState } from 'react';

/** عرض الحاوية بالبكسل — كي ترسم الرسوم بمقاسها الحقيقي (خطوط وحواف لا تتمطّط) */
export function useWidth<T extends HTMLElement>(initial = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setWidth(Math.max(120, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}
