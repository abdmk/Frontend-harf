'use client';

import { useEffect, useState } from 'react';

import { CheckIcon, DownloadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type Props = { fontName: string; label?: string; size?: 'sm' | 'lg'; className?: string };

/**
 * التحميل — للعرض: يُظهر التقدّم ثم النجاح.
 * في المنتج: يطلب من الخادم رابطاً موقّتاً موقّعاً بعد التحقّق من ترخيص المستخدم،
 * ولا يُكشف أي مسار حقيقي للملف في الصفحة.
 */
export function DownloadButton({ fontName, label = 'تحميل', size = 'sm', className }: Props) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  useEffect(() => {
    if (state === 'busy') {
      const t = window.setTimeout(() => setState('done'), 700);
      return () => window.clearTimeout(t);
    }
    if (state === 'done') {
      const t = window.setTimeout(() => setState('idle'), 1600);
      return () => window.clearTimeout(t);
    }
  }, [state]);

  return (
    <button
      type="button"
      aria-label={`${label} ${fontName}`}
      aria-live="polite"
      onClick={() => state === 'idle' && setState('busy')}
      className={cn(
        'group/dl relative z-10 inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap text-white transition-[background-color,transform] duration-200 active:scale-[.97]',
        size === 'sm' ? 'h-8 min-w-21 rounded-xs px-3 text-meta' : 'h-12 rounded-sm px-6 text-lead',
        state === 'done' ? 'bg-ok-600' : 'bg-primary hover:bg-harf-600',
        className,
      )}
    >
      {state === 'done' ? (
        <CheckIcon className="size-3.5 animate-pop-in" />
      ) : (
        <DownloadIcon
          className={cn(
            'size-3.5 transition-transform duration-200 group-hover/dl:translate-y-0.5',
            state === 'busy' && 'animate-bounce',
          )}
        />
      )}
      <span>{state === 'busy' ? 'جارٍ…' : state === 'done' ? 'تمّ' : label}</span>
    </button>
  );
}
