import { useRef, useState } from 'react';

import type { Rect } from '../utils/image';

/**
 * الصورة مع تحديد منطقة الكتابة: السحب على الصورة يرسم تحديداً جديداً، وما خارجه يُعتَّم.
 * الإحداثيات بوحدات الصورة نفسها (لا الشاشة) — فتصل للمحرّك كما هي.
 */
export function CropImage({
  url,
  width,
  height,
  rect,
  onRect,
}: {
  url: string;
  width: number;
  height: number;
  rect: Rect | null;
  onRect: (r: Rect) => void;
}) {
  const box = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; r: Rect } | null>(null);

  const toImage = (e: React.PointerEvent) => {
    const b = box.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(width, ((e.clientX - b.left) / b.width) * width)),
      y: Math.max(0, Math.min(height, ((e.clientY - b.top) / b.height) * height)),
    };
  };
  const shown = draft?.r ?? rect;
  const min = Math.max(width, height) * 0.02;

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-md bg-sunken"
      style={{ aspectRatio: `${width} / ${height}`, maxHeight: '26rem', maxWidth: `calc(26rem * ${width / height})` }}
    >
      <img src={url} alt="الصورة المرفوعة" className="absolute inset-0 size-full object-contain" draggable={false} />
      <svg
        ref={box}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="منطقة الكتابة المحدّدة — اسحب على الصورة لتغييرها"
        className="absolute inset-0 size-full cursor-crosshair touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = toImage(e);
          setDraft({ x0: p.x, y0: p.y, r: { x: p.x, y: p.y, w: 0, h: 0 } });
        }}
        onPointerMove={(e) => {
          if (!draft) return;
          const p = toImage(e);
          setDraft({
            ...draft,
            r: {
              x: Math.min(draft.x0, p.x),
              y: Math.min(draft.y0, p.y),
              w: Math.abs(p.x - draft.x0),
              h: Math.abs(p.y - draft.y0),
            },
          });
        }}
        onPointerUp={() => {
          if (draft && draft.r.w > min && draft.r.h > min) onRect(draft.r);
          setDraft(null);
        }}
        onPointerCancel={() => setDraft(null)}
      >
        {shown && (
          <>
            <path
              fillRule="evenodd"
              className="fill-scrim"
              d={`M0 0H${width}V${height}H0Z M${shown.x} ${shown.y}h${shown.w}v${shown.h}h${-shown.w}Z`}
            />
            <rect
              x={shown.x}
              y={shown.y}
              width={shown.w}
              height={shown.h}
              fill="none"
              vectorEffect="non-scaling-stroke"
              className="stroke-primary"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          </>
        )}
      </svg>
    </div>
  );
}
