'use client';

import { useEffect, useRef, useState } from 'react';

import { Carousel } from '@/components/shared/carousel';
import { CrossIcon, ExpandIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/** معرض صور الخط: شريحة كبيرة + مصغّرات + ملء الشاشة (Esc للخروج) */
export function FontGallery({ count = 5, fontName }: { count?: number; fontName: string }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const fsBtn = useRef<HTMLButtonElement>(null);
  const slides = Array.from({ length: count }, (_, k) => <div key={k} className="size-full bg-sunken" />);

  useEffect(() => {
    if (!full) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    fsBtn.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [full]);

  return (
    <section aria-label={`صور ${fontName}`}>
      <div
        role={full ? 'dialog' : undefined}
        aria-modal={full || undefined}
        aria-label={full ? `صور ${fontName} — ملء الشاشة` : undefined}
        className={cn(full ? 'fixed inset-0 z-[60] animate-in duration-300 fade-in zoom-in-[.98]' : 'relative')}
      >
        <Carousel
          label={`صور ${fontName}`}
          slides={slides}
          index={i}
          onIndexChange={setI}
          className={cn(full ? 'size-full rounded-none' : 'aspect-[4/3] rounded-lg sm:aspect-[1120/580]')}
          overlay={
            <button
              ref={fsBtn}
              type="button"
              aria-label={full ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
              onClick={() => setFull((v) => !v)}
              className="absolute start-5 top-5 z-10 grid size-9 place-items-center rounded-sm bg-nav-car text-muted-foreground shadow-soft transition-[color,transform] hover:scale-105 hover:text-foreground"
            >
              {full ? <CrossIcon className="size-4" /> : <ExpandIcon className="size-4" />}
            </button>
          }
        />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-3">
        {slides.map((_, k) => (
          <button
            key={k}
            type="button"
            aria-label={`الصورة ${k + 1}`}
            aria-current={k === i}
            onClick={() => setI(k)}
            className="aspect-[1120/580] rounded-sm border-2 border-transparent bg-sunken transition-[border-color,transform] duration-200 hover:-translate-y-0.5 aria-current:border-primary"
          />
        ))}
      </div>
    </section>
  );
}
