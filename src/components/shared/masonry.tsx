import { type ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * تخطيط متدفّق (Masonry) بترتيب صفّي: كل عنصر يذهب إلى أقصر عمود، والارتفاع يُحسب مسبقاً من
 * نسبة أبعاده — فلا قفزات بعد تحميل الصور، والترتيب يُقرأ من اليمين كما يُقرأ النص.
 */
export function Masonry<T>({
  items,
  getKey,
  ratio,
  extra = 0,
  render,
  minColumn = 220,
  maxColumns = 4,
  gap = 20,
  className,
  label,
}: {
  items: T[];
  getKey: (item: T) => string;
  /** الارتفاع ÷ العرض لمحتوى العنصر المرن (الصورة) */
  ratio: (item: T) => number;
  /** ارتفاع إضافي لكل بطاقة (العنوان والتفاصيل) — رقم، أو دالة لعرض العمود حين تتغيّر البطاقة بعرضها */
  extra?: number | ((colWidth: number) => number);
  render: (item: T, index: number) => ReactNode;
  minColumn?: number;
  maxColumns?: number;
  gap?: number;
  className?: string;
  label?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // عمودان على الأقل حتى على الجوال — طابع «المعرض» لا القائمة
  const count = Math.max(2, Math.min(maxColumns, Math.floor((width + gap) / (minColumn + gap)) || 2));
  const columns = useMemo(() => {
    const colWidth = width ? (width - gap * (count - 1)) / count : minColumn;
    const fixed = typeof extra === 'function' ? extra(colWidth) : extra;
    const heights = new Array<number>(count).fill(0);
    const cols: { item: T; index: number }[][] = Array.from({ length: count }, () => []);
    items.forEach((item, index) => {
      const target = heights.indexOf(Math.min(...heights));
      cols[target]!.push({ item, index });
      heights[target]! += colWidth * ratio(item) + fixed + gap;
    });
    return cols;
  }, [items, count, width, gap, minColumn, ratio, extra]);

  return (
    <div ref={box} role="list" aria-label={label} className={cn('flex items-start', className)} style={{ gap }}>
      {columns.map((col, c) => (
        <div key={c} className="flex min-w-0 flex-1 flex-col" style={{ gap }}>
          {col.map(({ item, index }) => (
            <div key={getKey(item)} role="listitem">
              {render(item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
