import { cn } from '@/lib/cn';

import { simulateBroken } from '../utils/arabic-reshape';

/**
 * نافذة داكنة بهيئة لوحة «Composition» في برامج التصميم: تعرض النص كما يرسمه برنامج لا يدعم العربية —
 * من اليسار لليمين حرفياً، بلا وصل. «قبل» = نصّك كما هو، «بعد» = النتيجة الجاهزة.
 * الألوان ثابتة في الوضعين: هي صورة لبرنامج آخر، لا جزء من واجهة حرف.
 */
export function AppPreview({
  appName,
  text,
  stage,
  className,
}: {
  appName: string;
  text: string;
  stage: 'before' | 'after';
  className?: string;
}) {
  return (
    <figure
      aria-label={`معاينة ${stage === 'before' ? 'قبل' : 'بعد'} المعالجة في ${appName}`}
      className={cn('flex min-h-60 flex-col overflow-hidden bg-n-900 text-n-0', className)}
    >
      <figcaption className="flex h-9 shrink-0 items-center gap-3 border-b border-n-800 px-4 text-caption text-n-300">
        <span aria-hidden className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-n-700" />
          <i className="size-2.5 rounded-full bg-n-700" />
          <i className="size-2.5 rounded-full bg-n-700" />
        </span>
        <span dir="ltr" className="truncate">
          {appName} — Composition
        </span>
        <span
          className={cn(
            'ms-auto rounded-full px-2 py-0.5 text-micro font-medium',
            stage === 'before' ? 'bg-dgr-600 text-n-0' : 'bg-ok-700 text-n-0',
          )}
        >
          {stage === 'before' ? 'قبل' : 'بعد'}
        </span>
      </figcaption>
      <div className="grid flex-1 place-items-center p-6 sm:p-8">
        {text ? (
          <p
            key={stage}
            dir="ltr"
            // كما يرسمه البرنامج: ترتيب الأحرف كما هي من اليسار لليمين، وكل حرف غير مُشكَّل منفصل
            className="w-full animate-fade-up text-center text-2xl leading-loose break-words whitespace-pre-wrap [unicode-bidi:bidi-override] sm:text-3xl"
          >
            {simulateBroken(text)}
          </p>
        ) : (
          <p className="text-center text-meta text-n-400">اكتب نصاً لترى كيف سيظهر في {appName}.</p>
        )}
      </div>
    </figure>
  );
}
