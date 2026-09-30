import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { formatBytes } from '@/components/shared/download-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExpandIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
} from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { type Manuscript, MANUSCRIPT_CATEGORY_LABEL } from '@/types/domain/manuscript';

import { fileName } from './manuscript-card';

const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3, 4];
const LICENSE = { personal: 'مجاني — شخصي', commercial: 'مجاني — تجاري & شخصي' } as const;

/**
 * عارض المخطوطة: تكبير وتصغير وتدوير وملء الشاشة، وسحب لتحريك الرسم المكبَّر، والتنقّل بالأسهم.
 * الاختصارات: ← → للتنقّل، + − للتكبير، 0 للحجم الأصلي، R للتدوير، F لملء الشاشة.
 */
export function ManuscriptViewer({
  list,
  current,
  onChange,
  saved,
  onSave,
}: {
  list: Manuscript[];
  current: Manuscript | null;
  onChange: (m: Manuscript | null) => void;
  saved: boolean;
  onSave: () => void;
}) {
  const index = current ? list.findIndex((m) => m.id === current.id) : -1;
  const [view, setView] = useState({ id: '', zoom: 1, rotate: 0, x: 0, y: 0 });
  // التكبير والتدوير يخصّان المخطوطة المفتوحة — فتح أخرى يعيدهما
  const v = view.id === current?.id ? view : { id: current?.id ?? '', zoom: 1, rotate: 0, x: 0, y: 0 };
  const set = (patch: Partial<typeof v>) => setView({ ...v, ...patch });
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const go = (d: number) => {
    if (index < 0 || !list.length) return;
    onChange(list[(index + d + list.length) % list.length]!);
  };
  const zoomBy = (d: number) => {
    const i = ZOOMS.findIndex((z) => z >= v.zoom);
    const next = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? ZOOMS.length - 1 : i) + d))]!;
    set({ zoom: next, ...(next <= 1 && { x: 0, y: 0 }) });
  };
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen?.();
  };

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      // الصفحة من اليمين: السهم الأيسر للتالي
      if (e.key === 'ArrowLeft') go(1);
      else if (e.key === 'ArrowRight') go(-1);
      else if (e.key === '+' || e.key === '=') zoomBy(1);
      else if (e.key === '-') zoomBy(-1);
      else if (e.key === '0') set({ zoom: 1, x: 0, y: 0 });
      else if (e.key.toLowerCase() === 'r') set({ rotate: (v.rotate + 90) % 360 });
      else if (e.key.toLowerCase() === 'f') fullscreen();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <Dialog open={!!current} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent
        className="gap-0 p-0 sm:max-w-dialog-lg sm:p-0"
        // التركيز على النافذة نفسها لا على أول أداة — فالأسهم والاختصارات تعمل فوراً
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
        }}
      >
        {current && (
          <>
            <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-5 py-4 pe-14 sm:pe-16">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-lead">{current.title}</DialogTitle>
                <DialogDescription className="text-caption">
                  <span dir="ltr" className="tabular-nums">
                    {index + 1} / {list.length}
                  </span>{' '}
                  · {MANUSCRIPT_CATEGORY_LABEL[current.category]}
                </DialogDescription>
              </div>
              {/* على الجوال تنزل الأدوات إلى سطر خاص كي لا تدفع زرّ الإغلاق خارج الشاشة */}
              <div
                role="toolbar"
                aria-label="أدوات العرض"
                className="flex items-center gap-1 max-sm:-ms-2 max-sm:basis-full"
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="تصغير"
                  onClick={() => zoomBy(-1)}
                  disabled={v.zoom <= ZOOMS[0]!}
                >
                  <MinusIcon />
                </Button>
                <button
                  type="button"
                  onClick={() => set({ zoom: 1, x: 0, y: 0 })}
                  aria-label="الحجم الأصلي"
                  className="w-12 text-center text-caption text-muted-foreground tabular-nums hover:text-foreground"
                  dir="ltr"
                >
                  {Math.round(v.zoom * 100)}%
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="تكبير"
                  onClick={() => zoomBy(1)}
                  disabled={v.zoom >= ZOOMS.at(-1)!}
                >
                  <PlusIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="تدوير"
                  onClick={() => set({ rotate: (v.rotate + 90) % 360 })}
                >
                  <RefreshIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="ملء الشاشة" onClick={fullscreen}>
                  <ExpandIcon />
                </Button>
              </div>
            </header>

            <div
              ref={stage}
              className={cn(
                'relative grid h-[min(46dvh,30rem)] touch-none place-items-center overflow-hidden bg-sunken select-none sm:h-[min(56vh,30rem)]',
                v.zoom > 1 ? 'cursor-grab active:cursor-grabbing' : '',
              )}
              onPointerDown={(e) => {
                if (v.zoom <= 1) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY, ox: v.x, oy: v.y };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                set({
                  x: drag.current.ox + e.clientX - drag.current.x,
                  y: drag.current.oy + e.clientY - drag.current.y,
                });
              }}
              onPointerUp={() => (drag.current = null)}
              onDoubleClick={() => (v.zoom > 1 ? set({ zoom: 1, x: 0, y: 0 }) : set({ zoom: 2 }))}
            >
              <img
                key={current.id}
                src={current.url}
                alt={current.title}
                draggable={false}
                className="absolute inset-8 size-[calc(100%-4rem)] animate-fade-up object-contain transition-transform duration-(--dur-base) ease-out-quint dark:invert"
                style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.zoom}) rotate(${v.rotate}deg)` }}
              />
              <button
                type="button"
                aria-label="السابقة"
                onClick={() => go(-1)}
                className="absolute start-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-soft transition-colors hover:bg-card"
              >
                <ChevronRightIcon className="size-5" />
              </button>
              <button
                type="button"
                aria-label="التالية"
                onClick={() => go(1)}
                className="absolute end-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-soft transition-colors hover:bg-card"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild>
                  <a href={current.url} download={fileName(current)}>
                    <DownloadIcon />
                    تحميل SVG
                  </a>
                </Button>
                <Button variant="outline" aria-pressed={saved} onClick={onSave}>
                  <BookmarkIcon filled={saved} />
                  {saved ? 'محفوظة' : 'حفظ'}
                </Button>
                <span className="ms-auto text-caption text-tertiary max-sm:hidden">
                  ← → للتنقّل · + − للتكبير · R للتدوير
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {(
                  [
                    ['التصنيف', MANUSCRIPT_CATEGORY_LABEL[current.category]],
                    [
                      'المصمّم',
                      <Link
                        to={paths.designer.getHref(current.designer.id)}
                        className="font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {current.designer.nameAr}
                      </Link>,
                    ],
                    [
                      'الأبعاد',
                      <span dir="ltr" className="tabular-nums">
                        {current.width} × {current.height}
                      </span>,
                    ],
                    ['حجم الملف', <span dir="ltr">{formatBytes(current.bytes)}</span>],
                    ['التحميلات', <span className="tabular-nums">{current.downloads.toLocaleString('en-US')}</span>],
                    ['الترخيص', LICENSE[current.license]],
                  ] as const
                ).map(([k, val]) => (
                  <div key={k} className="flex flex-col gap-0.5 border-b pb-3">
                    <dt className="text-caption text-tertiary">{k}</dt>
                    <dd className="text-control">{val}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-caption text-muted-foreground">
                كُتبت بخط{' '}
                {current.fonts.map((f, i) => (
                  <span key={f.id}>
                    {i > 0 && ' و'}
                    <Link to={paths.font.getHref(f.id)} className="font-medium text-primary hover:underline">
                      {f.name}
                    </Link>
                  </span>
                ))}{' '}
                من مكتبة حرف.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
