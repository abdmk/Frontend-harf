import { useEffect, useRef, useState } from 'react';

import { Carousel } from '@/components/shared/carousel';
import { CrossIcon, ExpandIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { faceStyle } from '@/lib/font-weight';
import type { LiveFace } from '@/types/domain/font';

/** معرض صور الخط: شريحة كبيرة + مصغّرات + ملء الشاشة (Esc للخروج) */
const THUMB = ['أ', 'ا ب', 'حرف', 'نص', '٣'];

/** شرائح عيّنات بالخط الحقيقي حين تتوفّر ملفاته — بدل مربّعات الصور الفارغة */
function specimenSlides(face: LiveFace, latin: boolean) {
  const heavy = faceStyle(face, 800);
  const regular = faceStyle(face, 400);
  const slide = 'grid size-full place-items-center px-8 text-center';
  return [
    <div key="name" className={cn(slide, 'bg-sunken')}>
      <span className="text-7xl leading-tight sm:text-9xl" style={heavy}>
        {face.nameAr}
      </span>
    </div>,
    <div key="abc" className={cn(slide, 'bg-ink text-ink-foreground')}>
      <span className="max-w-4xl text-4xl leading-relaxed sm:text-6xl" style={regular}>
        ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي
      </span>
    </div>,
    <div key="line" className={cn(slide, 'bg-sunken')}>
      <span className="max-w-4xl text-5xl leading-snug sm:text-7xl" style={heavy}>
        حرفٌ يصنع الهوية
      </span>
    </div>,
    <div key="text" className={cn(slide, 'bg-card')}>
      <p className="max-w-3xl text-2xl leading-loose sm:text-3xl" style={regular}>
        لا إبداع حيث لا حرية، ولا فكرة حقيقية تولد في مكان يخشى السؤال.
      </p>
    </div>,
    <div key="nums" className={cn(slide, 'bg-ink text-ink-foreground')}>
      <span dir="ltr" className="text-5xl leading-snug sm:text-7xl" style={regular}>
        {latin ? 'Aa Bb 0123456789' : '٠١٢٣٤٥٦٧٨٩'}
      </span>
    </div>,
  ];
}

export function FontGallery({
  count = 5,
  fontName,
  face,
  latin = false,
}: {
  count?: number;
  fontName: string;
  face?: LiveFace;
  latin?: boolean;
}) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const fsBtn = useRef<HTMLButtonElement>(null);
  const slides = face
    ? specimenSlides(face, latin)
    : Array.from({ length: count }, (_, k) => <div key={k} className="size-full bg-sunken" />);

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
            className={cn(
              'grid aspect-[1120/580] place-items-center rounded-sm border-2 border-transparent bg-sunken transition-[border-color,transform] duration-200 hover:-translate-y-0.5 aria-current:border-primary',
              face && (k === 1 || k === 4) && 'bg-ink text-ink-foreground',
            )}
          >
            {face && (
              <span aria-hidden className="text-2xl" style={faceStyle(face, 700)}>
                {THUMB[k]}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
