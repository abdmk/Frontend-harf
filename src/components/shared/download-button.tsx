import { useEffect, useState } from 'react';

import { CheckIcon, DownloadIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type Props = {
  fontName: string;
  label?: string;
  size?: 'sm' | 'lg';
  /** secondary: للنسخة التجريبية بجانب زرّ الشراء */
  /** quiet: زرّ البطاقات المتكرّرة — إطار وحرف بلون العلامة، ويمتلئ عند المرور فقط */
  variant?: 'primary' | 'secondary' | 'quiet';
  className?: string;
  /** ملف حقيقي (خطوط OFL ومخطوطات مجانية فقط) — يصير الزرّ رابط تحميل فعلياً */
  file?: { url: string; bytes: number; format?: string; name?: string };
};

/**
 * التحميل. مع `file` (خطوط مجانية بترخيص OFL فقط، إعادة توزيعها مسموحة): رابط تحميل حقيقي.
 * بدونه — للعرض: يُظهر التقدّم ثم النجاح. الخطوط المدفوعة لا تُعطى مساراً ثابتاً أبداً؛ في المنتج
 * يطلب الزرّ من الخادم رابطاً موقّتاً موقّعاً بعد التحقّق من ترخيص المستخدم.
 */
/**
 * فعل البطاقة في الشبكات (تحميل، اختر الترخيص): عشرات البطاقات في الصفحة — لو امتلأت كلها بالأحمر
 * ما عرفت العين أين تبدأ («5 أخطاء UX»: زرّ رئيسي واحد في الشاشة). هادئ حتى يقترب منه المستخدم.
 */
export const QUIET_CTA =
  'border border-primary/35 bg-card text-primary hover:border-transparent hover:bg-primary-fill hover:text-primary-foreground focus-visible:bg-primary-fill focus-visible:text-primary-foreground';

export function DownloadButton({
  fontName,
  label = 'تحميل',
  size = 'sm',
  variant = 'primary',
  className,
  file,
}: Props) {
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

  const classes = cn(
    'group/dl relative z-10 inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-[background-color,transform] duration-(--dur-base) active:scale-[.97]',
    size === 'sm' ? 'h-8 min-w-21 rounded-xs px-3 text-meta' : 'h-12 rounded-sm px-6 text-lead',
    state === 'done'
      ? 'bg-ok-700 text-white'
      : variant === 'primary'
        ? 'bg-primary-fill text-primary-foreground hover:bg-harf-600'
        : variant === 'quiet'
          ? QUIET_CTA
          : 'border bg-sunken text-foreground hover:bg-inset',
    className,
  );
  const content = (
    <>
      {state === 'done' ? (
        <CheckIcon className="size-3.5 animate-pop-in" />
      ) : (
        <DownloadIcon
          className={cn(
            'size-3.5 transition-transform duration-(--dur-base) group-hover/dl:translate-y-0.5',
            state === 'busy' && 'animate-bounce',
          )}
        />
      )}
      <span>{state === 'busy' ? 'جارٍ…' : state === 'done' ? 'تمّ' : label}</span>
    </>
  );

  if (file)
    return (
      <a
        href={file.url}
        download={file.name ?? true}
        aria-label={`${label} ${fontName} (${file.format ?? 'ZIP'}، ${formatBytes(file.bytes)})`}
        title={`${file.format ?? 'ZIP'} · ${formatBytes(file.bytes)}`}
        onClick={() => state === 'idle' && setState('busy')}
        className={classes}
      >
        {content}
      </a>
    );

  return (
    <button
      type="button"
      aria-label={`${label} ${fontName}`}
      aria-live="polite"
      onClick={() => state === 'idle' && setState('busy')}
      className={classes}
    >
      {content}
    </button>
  );
}

export function formatBytes(n: number) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;
}
