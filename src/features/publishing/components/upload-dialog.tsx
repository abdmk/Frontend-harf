import { type ReactNode, useId, useState } from 'react';

import { Dropzone } from '@/components/shared/dropzone';
import { FileIcon } from '@/components/shared/file-icon';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckIcon, CloudUploadIcon, CrossIcon, InfoIcon, LinkIcon, TrashIcon } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUploads } from '@/features/publishing/hooks/use-uploads';
import { UPLOAD_LIMITS } from '@/features/publishing/utils/validate';
import { cn } from '@/lib/cn';
import { formatBytesAr } from '@/lib/format';
import type { UploadItem } from '@/types/domain/publishing';

/** نافذة «تحميل الملفات»: منطقة إفلات، صفوف الملفات بحالاتها، والاستيراد من رابط */
export function UploadDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border p-6 shadow-overlay sm:max-w-dialog-md"
      >
        <UploadPanel />
      </DialogContent>
    </Dialog>
  );
}

function UploadPanel() {
  const { items, addFiles, addUrl, remove } = useUploads();
  return (
    <>
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border text-foreground">
          <CloudUploadIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <DialogTitle className="text-lg font-semibold">تحميل الملفات</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            اختر الملفات التي تفضلها وقم برفعها.
          </DialogDescription>
        </div>
        <DialogClose
          aria-label="إغلاق"
          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          <CrossIcon className="size-4" />
        </DialogClose>
      </div>

      <Dropzone
        onFiles={addFiles}
        multiple
        accept={UPLOAD_LIMITS.exts.map((e) => `.${e}`).join(',')}
        hint="تنسيقات OTF وTTF وPDF وZIP، بحجم يصل إلى 250 ميجابايت."
        className="mt-8"
      />

      {items.length > 0 && (
        <ul className="mt-4 flex flex-col gap-4" aria-label="الملفات">
          {items.map((it) => (
            <FileRow key={it.id} item={it} onRemove={() => remove(it.id)} />
          ))}
        </ul>
      )}

      <div className="my-6 flex items-center gap-6 text-sm text-muted-foreground" role="separator" aria-label="أو">
        <span className="h-px flex-1 bg-border" />
        أو
        <span className="h-px flex-1 bg-border" />
      </div>

      <UrlImport onSubmit={addUrl} />
    </>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 animate-spin text-file-zip [animation-duration:1.2s]" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="11"
          y="2"
          width="2"
          height="6"
          rx="1"
          fill="currentColor"
          opacity={0.25 + i * 0.1}
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
    </svg>
  );
}

function FileRow({ item, onRemove }: { item: UploadItem; onRemove: () => void }) {
  const pct = Math.round((item.loaded / Math.max(item.size, 1)) * 100);
  const title = item.name.replace(/\.[a-z0-9]+$/i, '');
  return (
    <li
      className={cn(
        'animate-fade-up rounded-md border p-5',
        item.status === 'error' && 'border-primary/40 bg-tint-brand',
      )}
    >
      <div className="flex items-start gap-4">
        <FileIcon kind={item.kind} />
        <div className="min-w-0 flex-1">
          <p dir="auto" className="truncate text-lg font-semibold">
            {title}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {item.status !== 'error' && (
              <span>
                {formatBytesAr(item.loaded)} من {formatBytesAr(item.size)}
              </span>
            )}
            <span aria-live="polite" className="inline-flex items-center gap-2">
              {item.status === 'uploading' && (
                <>
                  <Spinner /> <span className="text-foreground">جارٍ الرفع…</span>
                </>
              )}
              {item.status === 'done' && (
                <>
                  <span className="grid size-4 animate-pop-in place-items-center rounded-full bg-ok-500 text-white">
                    <CheckIcon className="size-2.5" />
                  </span>
                  <span className="text-foreground">مكتمل</span>
                </>
              )}
              {item.status === 'error' && <span className="text-primary">{item.error}</span>}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={item.status === 'uploading' ? `إلغاء رفع ${item.name}` : `حذف ${item.name}`}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          {item.status === 'uploading' ? <CrossIcon className="size-4" /> : <TrashIcon className="size-4.5" />}
        </button>
      </div>
      {item.status === 'uploading' && (
        <div
          role="progressbar"
          aria-label={`تقدّم رفع ${item.name}`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-4 h-2 overflow-hidden rounded-full bg-sunken"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </li>
  );
}

function UrlImport({ onSubmit }: { onSubmit: (url: string) => string | null }) {
  const id = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        const err = onSubmit(value);
        setError(err);
        if (!err) setValue('');
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor={id} className="text-lg font-semibold">
          استيراد من رابط URL
        </label>
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label="عن الاستيراد من رابط"
            className="grid size-5 place-items-center rounded-full bg-inset text-muted-foreground"
          >
            <InfoIcon className="size-3" />
          </TooltipTrigger>
          <TooltipContent className="max-w-60 leading-relaxed">
            يجلب الخادم الملف من رابط عامّ يبدأ بـ https، ثم يفحصه قبل قبوله.
          </TooltipContent>
        </Tooltip>
      </div>
      <div
        className={cn(
          'flex h-14 items-center gap-3 rounded-md border px-5 transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-focus',
          error && 'border-primary',
        )}
      >
        <LinkIcon className="size-4.5 shrink-0 text-muted-foreground" />
        <input
          id={id}
          type="url"
          inputMode="url"
          dir="auto"
          autoComplete="off"
          maxLength={2048}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="ألصق رابط الملف"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className="size-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-2 animate-fade-up text-xs text-primary">
          {error}
        </p>
      )}
    </form>
  );
}
