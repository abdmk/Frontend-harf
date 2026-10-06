import { cn } from '@/lib/utils';
import type { FileKind } from '@/types/domain/file';

export type { FileKind };

const COLOR: Record<FileKind, string> = {
  pdf: 'bg-file-pdf',
  otf: 'bg-file-otf',
  ttf: 'bg-file-ttf',
  zip: 'bg-file-zip',
  woff2: 'bg-file-ttf',
  file: 'bg-muted-foreground',
};

/** أيقونة ملف: ورقة بزاوية مطويّة وشارة ملوّنة بالصيغة — كما في تصميم الرفع */
export function FileIcon({ kind, className }: { kind: FileKind; className?: string }) {
  return (
    <span className={cn('relative inline-block h-12 w-10 shrink-0', className)} aria-hidden>
      <svg viewBox="0 0 40 48" className="absolute inset-0 size-full text-strong" fill="none">
        <path
          d="M6 1.5h19.5L38.5 14.5V42A4.5 4.5 0 0 1 34 46.5H6A4.5 4.5 0 0 1 1.5 42V6A4.5 4.5 0 0 1 6 1.5Z"
          className="fill-card"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M25.5 1.5V10a4.5 4.5 0 0 0 4.5 4.5h8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          'absolute start-[-10%] bottom-[22%] rounded-[5px] px-1.5 py-0.75 font-sans text-micro leading-none font-semibold tracking-wide text-white uppercase',
          COLOR[kind],
        )}
        dir="ltr"
      >
        {kind === 'woff2' ? 'WOFF' : kind === 'file' ? '?' : kind}
      </span>
    </span>
  );
}
