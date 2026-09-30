import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { TrashIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type Img = { url: string; name: string };

/** مسافة الفأرة قبل بدء السحب (نقرة لا تُعدّ سحباً)، ومدّة الضغط على اللمس (لا نمنع تمرير الصفحة) */
const MOUSE_SLOP = 4;
const TOUCH_HOLD = 250;

/**
 * ترتيب الصور بالسحب: اضغط على الصورة واسحبها إلى مكانها — بقية الصور تفسح لها المجال بحركة ناعمة
 * (FLIP). على اللمس: اضغط مطوّلاً ثم اسحب. لوحة المفاتيح: ركّز على صورة وحرّكها بالأسهم.
 */
export function SortableImages({ images, onChange }: { images: Img[]; onChange: (v: Img[]) => void }) {
  const list = useRef<HTMLUListElement>(null);
  const rects = useRef(new Map<string, DOMRect>());
  const [dragging, setDragging] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; w: number; h: number; dx: number; dy: number } | null>(
    null,
  );
  const [announce, setAnnounce] = useState('');
  const ghostBox = useRef<{ w: number; h: number; dx: number; dy: number } | null>(null);
  const gesture = useRef<{
    url: string;
    id: number;
    x: number;
    y: number;
    timer?: number;
    active: boolean;
    touch: boolean;
  } | null>(null);
  // أحدث قائمة داخل معالجات المؤشّر (تتغيّر أثناء السحب)
  const latest = useRef(images);
  useLayoutEffect(() => {
    latest.current = images;
  });

  // FLIP: قبل الرسم نقيس المواقع القديمة، بعده نعكس الفرق ثم نتركه يعود إلى 0
  const measure = () => {
    list.current?.querySelectorAll<HTMLElement>('[data-url]').forEach((el) => {
      rects.current.set(el.dataset.url!, el.getBoundingClientRect());
    });
  };
  useLayoutEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.current?.querySelectorAll<HTMLElement>('[data-url]').forEach((el) => {
      const before = rects.current.get(el.dataset.url!);
      if (!before || reduce) return;
      const now = el.getBoundingClientRect();
      const dx = before.left - now.left;
      const dy = before.top - now.top;
      if (!dx && !dy) return;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
        duration: 220,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
      });
    });
    rects.current.clear();
  }, [images]);

  // بعد الضغط المطوّل على اللمس: نمنع تمرير الصفحة أثناء السحب فقط (مستمع غير سلبي)
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const block = (e: TouchEvent) => {
      if (gesture.current?.active) e.preventDefault();
    };
    el.addEventListener('touchmove', block, { passive: false });
    return () => el.removeEventListener('touchmove', block);
  }, []);

  const moveTo = (url: string, to: number) => {
    const cur = latest.current;
    const from = cur.findIndex((i) => i.url === url);
    if (from < 0 || to === from || to < 0 || to >= cur.length) return;
    measure();
    const next = [...cur];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    onChange(next);
    setAnnounce(`الصورة الآن في الموضع ${to + 1} من ${cur.length}${to === 0 ? ' — الغلاف' : ''}`);
  };

  /**
   * الهدف: أقرب مركز بطاقة إلى مركز المسحوبة. المواقع من التخطيط (offset*) لا من
   * getBoundingClientRect — فالبطاقات التي تنزلق في حركة FLIP لا تُربك الحساب.
   */
  const settle = (url: string, cx: number, cy: number) => {
    const ul = list.current;
    if (!ul) return;
    const base = ul.getBoundingClientRect();
    let best: { url: string; d: number } | null = null;
    ul.querySelectorAll<HTMLElement>('[data-url]').forEach((el) => {
      const x = base.left + el.offsetLeft + el.offsetWidth / 2;
      const y = base.top + el.offsetTop + el.offsetHeight / 2;
      const d = Math.hypot(cx - x, cy - y);
      if (!best || d < best.d) best = { url: el.dataset.url!, d };
    });
    const target = best as { url: string; d: number } | null;
    if (target && target.url !== url)
      moveTo(
        url,
        latest.current.findIndex((i) => i.url === target.url),
      );
  };

  const start = (el: HTMLElement, url: string, e: React.PointerEvent) => {
    const r = el.getBoundingClientRect();
    gesture.current!.active = true;
    setDragging(url);
    const box = { w: r.width, h: r.height, dx: e.clientX - r.left, dy: e.clientY - r.top };
    ghostBox.current = box;
    setGhost({ x: e.clientX, y: e.clientY, ...box });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>, url: string) => {
    if ((e.target as HTMLElement).closest('button') || e.button !== 0) return;
    const el = e.currentTarget;
    const touch = e.pointerType !== 'mouse';
    gesture.current = { url, id: e.pointerId, x: e.clientX, y: e.clientY, active: false, touch };
    if (touch) {
      const snapshot = { clientX: e.clientX, clientY: e.clientY } as React.PointerEvent;
      gesture.current.timer = window.setTimeout(() => {
        el.setPointerCapture(e.pointerId);
        start(el, url, snapshot);
        navigator.vibrate?.(10);
      }, TOUCH_HOLD);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.id) return;
    if (!g.active) {
      const far = Math.hypot(e.clientX - g.x, e.clientY - g.y) > MOUSE_SLOP;
      // لمس تحرّك قبل انتهاء الضغط المطوّل ← تمرير عادي للصفحة، لا سحب
      if (g.touch) {
        if (far) window.clearTimeout(g.timer);
        return;
      }
      if (!far) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      start(e.currentTarget, g.url, e);
    }
    e.preventDefault();
    setGhost((s) => s && { ...s, x: e.clientX, y: e.clientY });
    // مركز البطاقة المسحوبة (لا نقطة الإمساك) — فلا تتبدّل قبل أن تعبر فعلاً إلى جارتها
    const box = ghostBox.current;
    const cx = box ? e.clientX - box.dx + box.w / 2 : e.clientX;
    const cy = box ? e.clientY - box.dy + box.h / 2 : e.clientY;
    settle(g.url, cx, cy);
  };

  const end = (e?: React.PointerEvent) => {
    const g = gesture.current;
    // الإفلات: تثبيت الموضع النهائي من آخر نقطة للمؤشّر
    const box = ghostBox.current;
    if (g?.active && e && box) settle(g.url, e.clientX - box.dx + box.w / 2, e.clientY - box.dy + box.h / 2);
    if (g?.timer) window.clearTimeout(g.timer);
    gesture.current = null;
    setDragging(null);
    setGhost(null);
  };

  const dragged = images.find((i) => i.url === dragging);

  return (
    <>
      <ul
        ref={list}
        aria-label="صور الخط — اسحب لإعادة الترتيب"
        className="relative grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {images.map((img, i) => (
          <li
            key={img.url}
            data-url={img.url}
            tabIndex={0}
            aria-roledescription="صورة قابلة للسحب"
            aria-label={`${img.name}، الموضع ${i + 1} من ${images.length}${i === 0 ? '، الغلاف' : ''}. الأسهم لتغيير الترتيب`}
            onPointerDown={(e) => onPointerDown(e, img.url)}
            onPointerMove={onPointerMove}
            onPointerUp={end}
            onPointerCancel={() => end()}
            onContextMenu={(e) => gesture.current?.touch && e.preventDefault()}
            onKeyDown={(e) => {
              // الصفحة من اليمين: السهم الأيمن/الأعلى = أبكر
              const d =
                e.key === 'ArrowRight' || e.key === 'ArrowUp'
                  ? -1
                  : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
                    ? 1
                    : 0;
              if (!d) return;
              e.preventDefault();
              moveTo(img.url, i + d);
              requestAnimationFrame(() =>
                list.current?.querySelector<HTMLElement>(`[data-url="${CSS.escape(img.url)}"]`)?.focus(),
              );
            }}
            className={cn(
              'group relative cursor-grab touch-pan-y overflow-hidden rounded-md border bg-card transition-[opacity,box-shadow,border-color] duration-(--dur-base) select-none [-webkit-touch-callout:none] hover:border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing',
              dragging === img.url && 'border-dashed border-strong opacity-35',
            )}
          >
            <div className="relative aspect-[4/3] bg-sunken">
              <img src={img.url} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
              {i === 0 && (
                <span className="absolute start-2 top-2 rounded-full bg-ink px-2 py-0.5 text-micro text-ink-foreground">
                  الغلاف
                </span>
              )}
              <span
                aria-hidden
                dir="ltr"
                className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-card/90 text-micro font-semibold tabular-nums shadow-soft"
              >
                {i + 1}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-1.5 ps-3">
              <span className="truncate text-caption text-muted-foreground">{img.name}</span>
              <button
                type="button"
                aria-label={`احذف ${img.name}`}
                onClick={() => {
                  URL.revokeObjectURL(img.url);
                  measure();
                  onChange(images.filter((x) => x.url !== img.url));
                }}
                className="grid size-8 shrink-0 place-items-center rounded-xs text-tertiary hover:bg-sunken hover:text-foreground"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* الشبح: نسخة الصورة تتبع المؤشّر، مرفوعة قليلاً */}
      {ghost && dragged && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 overflow-hidden rounded-md border bg-card shadow-overlay"
          style={{
            width: ghost.w,
            left: ghost.x - ghost.dx,
            top: ghost.y - ghost.dy,
            transform: 'rotate(-1.5deg) scale(1.03)',
          }}
        >
          <img src={dragged.url} alt="" className="aspect-[4/3] w-full object-cover" />
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </>
  );
}
